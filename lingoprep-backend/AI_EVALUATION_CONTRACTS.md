# Authentication and AI evaluation contracts

This change builds on the database and ownership protection PR. Deploy the
backend and speaking frontend together: speaking now returns transcript feedback
with assessment_type=transcript_feedback, null overall_band and
pronunciation_fluency, and saved=false. Other numeric speaking criteria are
omitted. Feedback-only attempts are not written into graded history. Existing
history rows are not rewritten or removed. Audio-based pronunciation assessment
requires a separate acoustic assessment and provenance implementation.

Supplied invalid credentials return 401. Authentication service failures,
rate-limit responses and malformed identities return 503 instead of guest access.
Missing credentials still allow guests on optional endpoints. Legacy writing
requests now follow the same authentication rules as current evaluation routes.

Writing keeps the application's existing estimated score scales: IELTS 0–9 in
half-point increments and TOEFL 0–30 in whole-point increments. This change
validates those application contracts; it does not establish official exam
calibration. The overall writing estimate remains provider-supplied and validated;
no new aggregation formula is introduced. Scores must be finite numeric values.
Provider schemas reject unknown fields (including saved and user_id), missing
metrics, invalid increments and empty/oversized feedback. Server logic alone sets
saved based on the canonical session-history insert.

Requests trim whitespace and bound prompts to 4,000 characters, essays to 20,000
and transcripts to 12,000. Existing minimum lengths remain. Tasks are validated
against the selected exam. Prompt configuration failures return a generic 503.
The text bounds limit request size; they are not account quotas or an exact token
budget for every possible configured model.

AI failures never produce demo or zero-score fallbacks and never insert evaluation
records. Invalid output returns 502; missing configuration/provider failures return
503. Valid evaluations remain available with saved=false if history storage fails.
The separate writing archive insert remains non-atomic; saved describes history,
not a guarantee that both tables were written. Idempotency is separate work.

Chat evaluation uses an async client, a 30-second request timeout, at most one
retry, and a 45-second total deadline. Evaluation-time synchronous database work
runs in the threadpool. Transcription/playback fixes remain in the separate audio
PR and should be retained when the branches are integrated.

Local verification: run `python -m unittest discover -s tests -v` from the backend
and `npm run build` from the frontend. Fixtures mock authentication, providers and
storage. Do not use real production essays or credentials in tests.
