# Backend answer and record protection

The backend returns question text, choices and presentation metadata before a
test. Correct option IDs, correctness flags, typed answer keys and explanations
are returned only in submission feedback. Nested presentation data is explicitly
allowlisted. Both single-passage and full-test grading load authoritative answers
through a separate server client.

Result writes use the verified authentication identity, never a user ID supplied
in the request body. Guests get feedback without storing their essays or results.
Invalid credentials are rejected instead of silently becoming guest requests.
User history reads and deletes continue to use the user's token and row security.

## Deployment order

These changes require a coordinated backend and database rollout. They have not
been applied to production automatically.

1. Back up the database and test this rollout on a staging copy. Confirm the
   existing question-type migration has been applied. Inspect custom views and
   SECURITY DEFINER functions for alternate access to these tables; the supplied
   migration covers the repository's tables and policies, not unknown extensions.
2. Configure `SUPABASE_SERVICE_ROLE_KEY` in the backend's secret environment with
   the project's legacy **service_role JWT key**. Keep `SUPABASE_KEY` as the public
   anon key for authentication and user-scoped requests. Never put the service
   key in frontend variables, source control or logs. The server client does not
   accept a user's bearer token and never falls back to the public key.
3. During a maintenance window, deploy this backend and apply
   `migration_protect_answers_and_records.sql` after all older migrations. It is
   transactional and repeatable, preserves rows, replaces policies on the six
   named tables, and revokes browser access to question/option tables and result
   writes. Older backend versions cannot grade/save under these restrictions.
4. Verify public content and submission feedback, signed-in save/history/delete,
   guest feedback without storage, and rejection of invalid tokens. Using the
   public key and two separate test users, verify direct answer reads and result
   insert/update requests fail, and that each user can see/delete only their own
   records. Avoid production test essays containing personal information.

Do not rerun `schema.sql` or the older result/writing policy scripts after this
migration: they may drop data or restore unsafe policies. For a fresh database,
apply this migration last as well. If rollout fails, keep the restrictive database
rules in place and fix forward or keep the affected endpoints in maintenance;
restoring the permissive policies would reopen the exposure.

Without the server key, protected content/scoring returns 503. Result persistence
failures preserve feedback with `saved=false` where that response field exists.
Legacy single-passage responses do not have a save-status field.

## Local verification

From `lingoprep-backend`:

```powershell
.\venv\Scripts\python.exe -m unittest discover -s tests -v
.\venv\Scripts\python.exe tests/run_database_protection.py --pg-bin 'C:\Program Files\PostgreSQL\18\bin'
```

The SQL runner creates and stops a separate local cluster using synthetic users,
loads the repository schema, and applies the migration twice. It checks anonymous
denial, cross-user isolation, blocked score/content modifications, legitimate
server writes, owner deletes, and privacy after account deletion. Logs remain in
the ignored root `tmp/` directory. It needs PostgreSQL binaries and permission to
launch a local process; it never connects to Supabase or the normal local server.

## Scope

This is a practice application: submission feedback still reveals answers, and
seed SQL in the repository contains the public question bank's keys. Listening
transcripts remain public practice material. This change prevents premature API
answer-key disclosure and database record access; it does not turn the public
question bank into a confidential examination bank.

Existing null-owner records are retained but inaccessible to browser roles.
Account deletion can still leave private orphaned rows because the existing
foreign keys use `ON DELETE SET NULL`; retention/erasure is a separate decision.
AI score validation, rate limiting and duplicate submissions remain separate
backend work.

References: [Supabase server key access](https://supabase.com/docs/guides/database/secure-data)
and [PostgreSQL row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html).
