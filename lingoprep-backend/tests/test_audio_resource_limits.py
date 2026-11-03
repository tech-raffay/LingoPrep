"""Real decoder fixtures plus bounded-provider and cleanup failure tests."""
import asyncio
import io
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import AsyncMock, patch
import wave

from fastapi import HTTPException
from app.services import audio_duration, speaking_service, tts_service
from persistence_fakes import isolated_attempts


def wav(seconds):
    output = io.BytesIO()
    with wave.open(output, "wb") as recording:
        recording.setnchannels(1)
        recording.setsampwidth(2)
        recording.setframerate(8000)
        recording.writeframes(b"\0\0" * (8000 * seconds))
    return output.getvalue()


class AudioDecoderTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        try:
            from imageio_ffmpeg import get_ffmpeg_exe
            cls.decoder = get_ffmpeg_exe()
        except ImportError:
            cls.decoder = shutil.which("ffmpeg")
        if not cls.decoder:
            raise unittest.SkipTest("Install requirements.txt to run real decoder integration tests")

    def test_real_wav_duration_boundary_and_corrupt_audio(self):
        with patch.dict(os.environ, {"FFMPEG_BINARY": self.decoder}):
            audio_duration.validate_audio_duration(wav(1), "wav")
            audio_duration.validate_audio_duration(wav(600), "wav")
            with self.assertRaises(HTTPException) as error:
                audio_duration.validate_audio_duration(wav(601), "wav")
            self.assertEqual(error.exception.status_code, 413)
            with self.assertRaises(HTTPException) as error:
                audio_duration.validate_audio_duration(b"RIFFnot a recording", "wav")
            self.assertEqual(error.exception.status_code, 422)

    def test_browser_webm_is_accepted(self):
        with tempfile.TemporaryDirectory() as directory, patch.dict(os.environ, {"FFMPEG_BINARY": self.decoder}):
            source = Path(directory) / "source.wav"
            target = Path(directory) / "recording.webm"
            source.write_bytes(wav(1))
            subprocess.run([self.decoder, "-nostdin", "-v", "error", "-i", str(source), "-c:a", "libopus", str(target)],
                           check=True, timeout=20, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                           creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
            audio_duration.validate_audio_duration(target.read_bytes(), "webm")

    def test_decoder_timeout_cleans_temporary_files(self):
        captured = []
        def timeout(command, **kwargs):
            captured.append(Path(command[-1]).parent)
            raise subprocess.TimeoutExpired(command, 20)
        with patch.dict(os.environ, {"FFMPEG_BINARY": self.decoder}), patch.object(audio_duration.subprocess, "run", side_effect=timeout):
            with self.assertRaises(HTTPException) as error:
                audio_duration.validate_audio_duration(wav(1), "wav")
        self.assertEqual(error.exception.status_code, 422)
        self.assertTrue(captured)
        self.assertFalse(captured[0].exists())

    def test_missing_decoder_does_not_skip_validation(self):
        with patch.dict(os.environ, {"FFMPEG_BINARY": "definitely-not-a-real-decoder"}):
            with self.assertRaises(HTTPException) as error:
                audio_duration.validate_audio_duration(wav(1), "wav")
            self.assertEqual(error.exception.status_code, 503)


class AudioWorkloadTests(unittest.IsolatedAsyncioTestCase):
    async def test_transcription_deadline_closes_provider(self):
        manager = AsyncMock()
        async def hang(**kwargs):
            await asyncio.sleep(10)
        manager.__aenter__.return_value.audio.transcriptions.create.side_effect = hang
        with patch.object(speaking_service.settings, "GROQ_API_KEY", "test-only"), patch.object(
            speaking_service, "AsyncGroq", return_value=manager
        ), patch.object(speaking_service, "TRANSCRIPTION_DEADLINE_SECONDS", 0.01):
            with self.assertRaises(TimeoutError):
                await speaking_service.transcribe_audio_file(b"audio", "wav", "audio/wav")
        manager.__aexit__.assert_awaited_once()

    async def test_failed_synthesis_cancels_sibling_lines_and_releases_capacity(self):
        cancelled = asyncio.Event()
        async def line(voice, text):
            if text == "failure":
                await asyncio.sleep(0.01)
                raise ValueError("synthetic failure")
            try:
                await asyncio.sleep(10)
            finally:
                cancelled.set()
        with isolated_attempts() as database, patch.object(tts_service, "_synthesize_line", side_effect=line):
            with self.assertRaises(ExceptionGroup):
                await tts_service.synthesize_transcript("failure\npending")
            self.assertTrue(cancelled.is_set())
            self.assertEqual(database.releases, 1)

    async def test_total_synthesis_bytes_are_bounded(self):
        with isolated_attempts(), patch.object(tts_service, "_synthesize_line", new=AsyncMock(return_value=b"x" * (2 * 1024 * 1024))):
            with self.assertRaises(ValueError):
                await tts_service.synthesize_transcript("line\n" * 9)
