# Statistics and maintenance

This change builds on PR #5 (`fix/persistence-resource-limits`). It addresses the backend statistics and maintenance findings without changing exam scoring tables or introducing new frontend features.

## Statistics contract

- A genuine zero contributes to the average. Null, boolean, nonnumeric, nonfinite and out-of-range grades do not become zero grades.
- Module `count` means valid scored attempts. `attempt_count` includes all attempts and `unscored_count` identifies records excluded from grade calculations. First/latest scores refer to valid graded attempts.
- Existing flat and per-exam response fields remain available. `scored_module_count`, `is_complete_summary`, and `summary_kind: practice_history` make coverage explicit. Even four practiced modules are not one timed full mock exam.
- IELTS averages include all scored modules, including zero. TOEFL preserves the application's legacy 0-30 section/0-120 aggregate convention; this is not a conversion to the revised official TOEFL scale.
- Unknown exam records remain visible in recent history and `unclassified_sessions` but do not silently enter IELTS averages. Content metadata is fetched in batches.
- History is read in ordered pages, including when the database imposes a smaller page size. More than 10,000 rows fails with 503 rather than silently returning truncated statistics. Offset pagination is not a transaction snapshot during concurrent edits; database aggregation remains a future scale improvement.
- Recent statistics responses exclude essay/answer payloads. The separate owned history endpoint retains its existing 20-row contract; full pagination/report viewing is future work.

## Database and prompt maintenance

Database HTTP/JSON failures produce safe dependency errors. 404/406 from the database no longer mean an empty result. `single()` means zero or one row and rejects multiple matches. Insert/delete are terminal operations. Deletes require a real predicate, not merely select/order/limit parameters.

Writing list/random/submit use a shared catalog. An empty IELTS catalog uses the same static example; database failures return 503. TOEFL examples remain static. Speaking fallback respects both exam and difficulty filters. Listing routes run synchronous database operations in FastAPI's worker threads.

Apply `migration_writing_prompts.sql` in staging before deploying this backend. It creates a missing writing prompt table, or adds the exam column to a compatible existing table, without deleting content. Review existing column types first; incompatible schemas fail transactionally and require a deliberate adaptation. Existing rows lacking an exam label stay unclassified until the content owner assigns one. No blanket IELTS backfill is performed.

Browser roles can read only public prompt columns, cannot write prompts, and cannot read extra sample-essay columns. The migration removes pre-existing table and column grants, enables row security and grants limited prompt access. Existing custom SELECT policies should also be reviewed in staging; this migration does not delete arbitrary policies. Never run `schema.sql`, `supabase_bootstrap.sql`, the old destructive writing-submission script, or replacement seed scripts as an upgrade to a live database.

## Operations

`/health` is process liveness. `/ready` returns 503 when required configuration is absent and 200 when configuration is present; its explicit `configuration_only` scope does not prove database, provider or migration availability. It never returns keys or calls a paid provider. Deployment smoke checks must verify real dependencies separately.

Application shutdown cancels and awaits owned audio tasks, then closes the pooled database HTTP client. Restarting the application lifespan reopens the pool. Shared disk cache retention, cross-worker synthesis coordination, PR #3 audio integration and scheduled PR #5 private-checkpoint cleanup remain deployment responsibilities.

## Local verification

From `lingoprep-backend`:

```powershell
.\venv\Scripts\python.exe -m unittest discover -s tests -q
.\venv\Scripts\python.exe tests/run_database_protection.py --pg-bin 'C:\Program Files\PostgreSQL\18\bin' --maintenance
```

Local result: 68 backend tests passed; disposable PostgreSQL checks and the frontend production build passed.

The unit/API suite uses mocked providers and database transports; real audio decoding is local. The SQL runner creates its own disposable cluster and shuts it down in `finally`. It tests fresh/repeated setup, preservation of old unlabeled rows, read restrictions, private-column denial and rejected browser writes. The frontend was also checked with `npm run build`.

No production migration, paid evaluation or production write was performed. Progress charts, stored report pages, exam-version redesign, admin content authoring and full deployment parity remain separate backlog items (APP-00/01/05/06/09).
