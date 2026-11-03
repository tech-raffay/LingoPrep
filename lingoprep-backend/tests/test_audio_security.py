"""Audio regressions use disposable caches and mocked speech providers only."""

import asyncio
from concurrent.futures import ThreadPoolExecutor
import io
import json
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock, Mock, patch
import wave

import httpx
from fastapi.testclient import TestClient

from app.main import app
from app.services import audio_upload, speaking_service, tts_service
from scripts import pregenerate_audio

AUDIO_ID = "bb100001-0001-0001-0001-000000000001"
OTHER_ID = "bb100002-0002-0002-0002-000000000002"


def wav_bytes():
    output = io.BytesIO()
    with wave.open(output, "wb") as recording:
        recording.setnchannels(1)
        recording.setsampwidth(2)
        recording.setframerate(16000)
        recording.writeframes(b"\x00\x00" * 160)
    return output.getvalue()


class CacheTestCase(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name).resolve() / "audio"
        self.root.mkdir()
        cache = patch.object(tts_service, "AUDIO_CACHE_DIR", self.root)
        cache.start()
        self.addCleanup(cache.stop)
        inflight = patch.object(tts_service, "_inflight", {})
        inflight.start()
        self.addCleanup(inflight.stop)

    def source(self, audio_id=AUDIO_ID, transcript="Current transcript"):
        return {"id": audio_id, "transcript": transcript, "exam_type": "ielts"}

    def seed(self, audio_id=AUDIO_ID, transcript="Old transcript"):
        path = tts_service.get_audio_file_path(audio_id, transcript)
        path.write_bytes(b"old recording")
        return path

    def test_traversal_wildcards_and_absolute_ids_are_rejected(self):
        for audio_id in ("../outside", "..\\outside", "*", "[ab]", "C:\\outside", "not-a-uuid"):
            with self.subTest(audio_id=audio_id), self.assertRaises(ValueError):
                tts_service.get_audio_file_path(audio_id, "text")
        for name in ("../escape.mp3", "..\\escape.mp3", "C:\\escape.mp3", "*.mp3", "file:stream"):
            with self.subTest(filename=name), self.assertRaises(ValueError):
                tts_service.cache_path(name)

    def test_symlink_cannot_serve_or_overwrite_an_outside_file(self):
        outside = self.root.parent / "private.mp3"
        outside.write_bytes(b"private")
        destination = tts_service.get_audio_file_path(AUDIO_ID, "text")
        try:
            destination.symlink_to(outside)
        except OSError as exc:
            self.skipTest(f"OS does not permit symlink creation: {exc.winerror if hasattr(exc, 'winerror') else exc.errno}")
        with self.assertRaises(ValueError):
            tts_service.get_audio_file_path(AUDIO_ID, "text")
        with self.assertRaises(ValueError):
            tts_service.atomic_cache_write(destination, b"replacement")
        self.assertEqual(outside.read_bytes(), b"private")

    def test_concurrent_writers_use_distinct_temporary_files(self):
        destination = tts_service.get_audio_file_path(AUDIO_ID, "text")
        contents = [bytes([i]) * 10000 for i in range(6)]
        with ThreadPoolExecutor(max_workers=6) as workers:
            list(workers.map(lambda content: tts_service.atomic_cache_write(destination, content), contents))
        self.assertIn(destination.read_bytes(), contents)
        self.assertEqual(list(self.root.glob("*.part")), [])

    def test_link_detection_rejects_paths_even_without_os_link_privileges(self):
        with patch.object(Path, "is_symlink", return_value=True):
            with self.assertRaises(ValueError):
                tts_service.get_audio_file_path(AUDIO_ID, "text")

    async def test_concurrent_listeners_share_generation_and_survive_disconnect(self):
        started, finish = asyncio.Event(), asyncio.Event()

        async def synthesize(transcript, exam, output_path, seed):
            started.set()
            await finish.wait()
            tts_service.atomic_cache_write(output_path, b"new recording")

        with patch.object(tts_service, "synthesize_transcript", side_effect=synthesize) as synth:
            first = asyncio.create_task(tts_service.get_or_generate_audio(AUDIO_ID, "new"))
            await started.wait()
            second = asyncio.create_task(tts_service.get_or_generate_audio(AUDIO_ID, "new"))
            await asyncio.sleep(0)
            first.cancel()
            with self.assertRaises(asyncio.CancelledError):
                await first
            finish.set()
            path = await second
        self.assertEqual(path.read_bytes(), b"new recording")
        self.assertEqual(synth.call_count, 1)

    async def test_failed_synthesis_does_not_publish_partial_audio(self):
        with patch.object(tts_service, "_synthesize_line", side_effect=RuntimeError("provider failure")):
            with self.assertRaises(RuntimeError):
                await tts_service.get_or_generate_audio(AUDIO_ID, "Narrator: Test")
        self.assertEqual(list(self.root.iterdir()), [])

    async def test_invalid_pregeneration_input_preserves_existing_cache(self):
        old = self.seed()
        with self.assertRaises(ValueError):
            pregenerate_audio.from_json(self.root / "missing")
        for sources in ([], [self.source(transcript="")], [self.source(), self.source()],
                        [{**self.source(), "exam_type": "unknown"}]):
            with self.subTest(sources=sources), self.assertRaises(ValueError):
                await pregenerate_audio.generate(sources, prune=True)
        self.assertEqual(old.read_bytes(), b"old recording")

    async def test_pruning_is_explicit_and_limited_to_supplied_managed_ids(self):
        old = self.seed()
        other = self.seed(OTHER_ID)
        unmanaged = self.root / "unmanaged.mp3"
        unmanaged.write_bytes(b"keep")
        manifest = self.root / pregenerate_audio.MANIFEST_NAME
        previous = {AUDIO_ID: [old.name], OTHER_ID: [other.name]}
        manifest.write_text(json.dumps(previous))
        with patch.object(tts_service, "_synthesize_line", new=AsyncMock(return_value=b"new")):
            await pregenerate_audio.generate([self.source()])
        self.assertTrue(old.exists())  # Default never deletes files.
        await pregenerate_audio.generate([self.source()], prune=True)
        self.assertFalse(old.exists())
        self.assertTrue(other.exists())
        self.assertTrue(unmanaged.exists())
        self.assertEqual(json.loads(manifest.read_text())[OTHER_ID], [other.name])

    async def test_generation_failure_preserves_manifest_and_old_files(self):
        old = self.seed()
        manifest = self.root / pregenerate_audio.MANIFEST_NAME
        original = json.dumps({AUDIO_ID: [old.name]})
        manifest.write_text(original)
        with patch.object(tts_service, "get_or_generate_audio", side_effect=RuntimeError("failed")):
            with self.assertRaises(RuntimeError):
                await pregenerate_audio.generate([self.source()], prune=True)
        self.assertEqual(manifest.read_text(), original)
        self.assertTrue(old.exists())

    async def test_tampered_manifest_cannot_prune_outside_cache(self):
        manifest = self.root / pregenerate_audio.MANIFEST_NAME
        manifest.write_text(json.dumps({AUDIO_ID: ["../outside.mp3"]}))
        with patch.object(tts_service, "get_or_generate_audio") as generate:
            with self.assertRaises(ValueError):
                await pregenerate_audio.generate([self.source()], prune=True)
        generate.assert_not_called()


class PlaybackTests(unittest.TestCase):
    def test_invalid_ids_fail_before_database_or_cache_access(self):
        with TestClient(app) as api, patch("app.services.listening_service.get_audio_source") as lookup:
            for audio_id in ("..%5Coutside", "*", "not-a-uuid"):
                response = api.get(f"/api/listening/audio/{audio_id}")
                self.assertEqual(response.status_code, 422)
        lookup.assert_not_called()

    def test_playback_uses_current_fingerprint_and_supports_ranges(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(tts_service, "AUDIO_CACHE_DIR", Path(directory)):
            old = tts_service.get_audio_file_path(AUDIO_ID, "old")
            old.write_bytes(b"old audio")
            current = tts_service.get_audio_file_path(AUDIO_ID, "current")
            current.write_bytes(b"current audio")
            with TestClient(app) as api, patch("app.services.listening_service.get_audio_source", return_value={
                "id": AUDIO_ID, "transcript": "current", "exam_type": "ielts"
            }), patch.object(tts_service, "synthesize_transcript") as synth:
                response = api.get(f"/api/listening/audio/{AUDIO_ID}", headers={"Range": "bytes=0-6"})
                self.assertEqual(response.status_code, 206)
                self.assertEqual(response.content, b"current")
                self.assertEqual(response.headers["cache-control"], "no-cache")
                current.unlink()
                synth.side_effect = RuntimeError("provider secret")
                response = api.get(f"/api/listening/audio/{AUDIO_ID}")
                self.assertEqual(response.status_code, 503)
                self.assertNotIn("provider secret", response.text)
                self.assertNotIn("old audio", response.text)

    def test_unknown_or_unavailable_metadata_never_falls_back_to_disk(self):
        with TestClient(app) as api, patch("app.services.listening_service.get_audio_source") as lookup, patch.object(
            tts_service, "get_or_generate_audio"
        ) as generate:
            lookup.return_value = None
            self.assertEqual(api.get(f"/api/listening/audio/{AUDIO_ID}").status_code, 404)
            lookup.side_effect = RuntimeError("secret database connection")
            response = api.get(f"/api/listening/audio/{AUDIO_ID}")
            self.assertEqual(response.status_code, 503)
            self.assertNotIn("secret", response.text)
        generate.assert_not_called()


class UploadTests(unittest.TestCase):
    def test_browser_webm_and_other_supported_containers_are_recognized(self):
        cases = [(b"\x1aE\xdf\xa3header", "audio/webm;codecs=opus", "webm"),
                 (b"OggSheader", "audio/ogg", "ogg"),
                 (b"fLaCheader", "audio/flac", "flac"),
                 (b"ID3header", "audio/mpeg", "mp3"),
                 (b"\x00\x00\x00\x18ftypM4A ", "audio/mp4", "m4a")]
        for data, mime, extension in cases:
            with self.subTest(extension=extension):
                self.assertEqual(audio_upload.audio_format(data, mime)[0], extension)

    def test_supported_audio_ignores_untrusted_filename(self):
        with TestClient(app) as api, patch.object(speaking_service, "transcribe_audio_file", new=AsyncMock(return_value="Hello")) as transcribe:
            response = api.post("/api/speaking/transcribe", files={"file": ("../../escape.exe", wav_bytes(), "audio/wav")})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["transcript"], "Hello")
        self.assertEqual(transcribe.call_args.args[1:], ("wav", "audio/wav"))

    def test_empty_spoofed_and_oversized_audio_never_reaches_provider(self):
        cases = [(b"", "audio/wav", 400), (b"not audio", "audio/webm", 415),
                 (wav_bytes(), "audio/mpeg", 415), (wav_bytes() + b"x" * 1024, "audio/wav", 413)]
        with TestClient(app) as api, patch.object(audio_upload, "MAX_AUDIO_BYTES", 512), patch.object(
            speaking_service, "transcribe_audio_file"
        ) as transcribe:
            for data, mime, status in cases:
                with self.subTest(status=status):
                    response = api.post("/api/speaking/transcribe", files={"file": ("recording", data, mime)})
                    self.assertEqual(response.status_code, status)
        transcribe.assert_not_called()

    def test_declared_oversized_request_is_rejected_before_parsing(self):
        with TestClient(app) as api, patch.object(audio_upload, "MAX_REQUEST_BYTES", 16):
            response = api.post("/api/speaking/transcribe", content=b"x" * 17)
        self.assertEqual(response.status_code, 413)

    def test_provider_errors_do_not_disclose_internal_details(self):
        with TestClient(app) as api, patch.object(speaking_service, "transcribe_audio_file", side_effect=RuntimeError("secret api key")):
            response = api.post("/api/speaking/transcribe", files={"file": ("recording.wav", wav_bytes(), "audio/wav")})
        self.assertEqual(response.status_code, 503)
        self.assertNotIn("secret", response.text)


class AsyncUploadTests(unittest.IsolatedAsyncioTestCase):
    async def test_transcription_deadline_cancels_and_closes_provider(self):
        async def stalled_provider(**kwargs):
            await asyncio.sleep(60)
        client = Mock()
        client.audio.transcriptions.create = AsyncMock(side_effect=stalled_provider)
        manager = AsyncMock()
        manager.__aenter__.return_value = client
        with patch.object(speaking_service, "AsyncGroq", return_value=manager), patch.object(
            speaking_service, "TRANSCRIPTION_DEADLINE_SECONDS", 0.01
        ), patch.object(speaking_service.settings, "GROQ_API_KEY", "test-only"):
            with self.assertRaises(TimeoutError):
                await speaking_service.transcribe_audio_file(wav_bytes(), "wav", "audio/wav")
        manager.__aexit__.assert_awaited_once()

    async def test_chunked_upload_limit_closes_multipart_spools(self):
        boundary = "test-boundary"
        start = f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="a.wav"\r\nContent-Type: audio/wav\r\n\r\n'.encode()
        async def chunks():
            yield start + wav_bytes()
            yield b"x" * 2048
            yield f"\r\n--{boundary}--\r\n".encode()
        spools = []
        def create_spool(*args, **kwargs):
            spool = tempfile.SpooledTemporaryFile(*args, **kwargs)
            spools.append(spool)
            return spool
        with patch("starlette.formparsers.SpooledTemporaryFile", side_effect=create_spool), patch.object(audio_upload, "MAX_REQUEST_BYTES", 1024), patch.object(
            speaking_service, "transcribe_audio_file"
        ) as transcribe:
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as api:
                response = await api.post("/api/speaking/transcribe", content=chunks(), headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
        self.assertEqual(response.status_code, 413)
        transcribe.assert_not_called()
        self.assertTrue(spools)
        self.assertTrue(all(spool.closed for spool in spools))

    async def test_async_transcription_uses_bytes_and_closes_provider_client(self):
        client = Mock()
        client.audio.transcriptions.create = AsyncMock(return_value=SimpleNamespace(text="Hello"))
        manager = AsyncMock()
        manager.__aenter__.return_value = client
        with patch.object(speaking_service, "AsyncGroq", return_value=manager), patch.object(
            speaking_service.settings, "GROQ_API_KEY", "test-only"
        ):
            result = await speaking_service.transcribe_audio_file(wav_bytes(), "wav", "audio/wav")
        self.assertEqual(result, "Hello")
        self.assertEqual(client.audio.transcriptions.create.call_args.kwargs["file"], ("recording.wav", wav_bytes(), "audio/wav"))
        manager.__aexit__.assert_awaited_once()
