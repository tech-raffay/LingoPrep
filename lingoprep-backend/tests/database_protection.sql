-- ONLY run through run_database_protection.py in its disposable cluster.
-- Stub Supabase Auth, then load the actual repository schema and migration.
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth;
CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
$$ SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;
\ir ../../schema.sql
\ir ../../migration_reading_question_types.sql
-- Reproduce Supabase's broad grants, plus a stray permissive policy.
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT (is_correct) ON public.options TO anon;
CREATE POLICY "Unexpected public records" ON public.session_logs FOR ALL USING (true) WITH CHECK (true);
\ir ../../migration_protect_answers_and_records.sql
\ir ../../migration_protect_answers_and_records.sql

INSERT INTO auth.users VALUES
 ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a@example.invalid', '{}'),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b@example.invalid', '{}');
INSERT INTO public.session_logs(user_id,module,score) VALUES
 ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','reading',7),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','reading',6),
 (NULL,'reading',5);
INSERT INTO public.writing_submissions(user_id,prompt,essay_text) VALUES
 ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Prompt','Private A'),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','Prompt','Private B'),
 (NULL,'Prompt','Legacy private');

SET ROLE anon;
DO $$
DECLARE statement text;
BEGIN
    FOREACH statement IN ARRAY ARRAY[
        'SELECT is_correct FROM public.options',
        'SELECT correct_answer_text FROM public.questions',
        'SELECT * FROM public.session_logs',
        'SELECT * FROM public.writing_submissions',
        'SELECT * FROM public.profiles',
        'INSERT INTO public.session_logs(module,score) VALUES (''reading'',9)',
        'INSERT INTO public.writing_submissions(prompt,essay_text) VALUES (''x'',''x'')'
    ] LOOP
        BEGIN
            EXECUTE statement;
            RAISE EXCEPTION 'Anonymous access unexpectedly succeeded: %', statement;
        EXCEPTION WHEN insufficient_privilege THEN NULL;
        END;
    END LOOP;
    IF (SELECT count(*) FROM public.passages) = 0 THEN
        RAISE EXCEPTION 'Public practice passages unavailable';
    END IF;
END $$;
RESET ROLE;

SET request.jwt.claim.sub = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
SET ROLE authenticated;
DO $$
DECLARE statement text; affected integer;
BEGIN
    IF (SELECT count(*) FROM public.session_logs) != 1
       OR (SELECT count(*) FROM public.writing_submissions) != 1
       OR (SELECT count(*) FROM public.profiles) != 1 THEN
        RAISE EXCEPTION 'Owner isolation failed';
    END IF;
    FOREACH statement IN ARRAY ARRAY[
        'SELECT is_correct FROM public.options',
        'SELECT explanation FROM public.questions',
        'INSERT INTO public.session_logs(user_id,module,score) VALUES (auth.uid(),''reading'',9)',
        'INSERT INTO public.writing_submissions(user_id,prompt,essay_text) VALUES (auth.uid(),''x'',''x'')',
        'UPDATE public.session_logs SET score=9',
        'UPDATE public.writing_submissions SET overall_band=9',
        'UPDATE public.options SET is_correct=true',
        'UPDATE public.passages SET content=''forged''',
        'UPDATE public.profiles SET id=''bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'''
    ] LOOP
        BEGIN
            EXECUTE statement;
            RAISE EXCEPTION 'Authenticated write/read unexpectedly succeeded: %', statement;
        EXCEPTION WHEN insufficient_privilege THEN NULL;
        END;
    END LOOP;
    DELETE FROM public.session_logs WHERE user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    GET DIAGNOSTICS affected = ROW_COUNT;
    IF affected != 0 THEN RAISE EXCEPTION 'Deleted another user session'; END IF;
    DELETE FROM public.writing_submissions WHERE user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    GET DIAGNOSTICS affected = ROW_COUNT;
    IF affected != 0 THEN RAISE EXCEPTION 'Deleted another user essay'; END IF;
    DELETE FROM public.session_logs WHERE user_id = auth.uid();
    GET DIAGNOSTICS affected = ROW_COUNT;
    IF affected != 1 THEN RAISE EXCEPTION 'Owner cannot delete session'; END IF;
    UPDATE public.profiles SET full_name = 'Student A' WHERE id = auth.uid();
    GET DIAGNOSTICS affected = ROW_COUNT;
    IF affected != 1 THEN RAISE EXCEPTION 'Owner cannot update profile'; END IF;
END $$;
RESET ROLE;

SET ROLE service_role;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.options WHERE is_correct)
       OR NOT EXISTS (SELECT 1 FROM public.questions) THEN
        RAISE EXCEPTION 'Server cannot read grading keys';
    END IF;
END $$;
INSERT INTO public.session_logs(user_id,module,score)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','listening',8);
INSERT INTO public.writing_submissions(user_id,prompt,essay_text)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Prompt','Trusted write');
RESET ROLE;

-- Account deletion still uses SET NULL, but never exposes the orphaned records.
DELETE FROM auth.users WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
SET ROLE authenticated;
DO $$
BEGIN
    IF (SELECT count(*) FROM public.session_logs) != 1
       OR (SELECT count(*) FROM public.writing_submissions) != 2 THEN
        RAISE EXCEPTION 'Orphaned records leaked or server writes missing';
    END IF;
END $$;
RESET ROLE;

SELECT 'PASS: answer secrecy, server-only writes, owner isolation, guest/orphan privacy, repeatability';
