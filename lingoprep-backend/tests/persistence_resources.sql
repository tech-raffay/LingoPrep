-- Load the existing isolated Supabase fixture and all prerequisite checks.
\ir database_protection.sql
\ir ../../migration_persistence_resource_limits.sql
\ir ../../migration_persistence_resource_limits.sql

DO $$
DECLARE role_name text; fn regprocedure;
BEGIN
    FOREACH role_name IN ARRAY ARRAY['anon','authenticated'] LOOP
        IF has_table_privilege(role_name,'public.submission_attempts','SELECT') THEN
            RAISE EXCEPTION 'Private attempts exposed';
        END IF;
        FOR fn IN SELECT oid::regprocedure FROM pg_proc WHERE proname IN
            ('claim_submission','stage_submission','finish_submission','acquire_workload','release_workload','expire_submission_data') LOOP
            IF has_function_privilege(role_name,fn,'EXECUTE') THEN RAISE EXCEPTION 'Browser can invoke protected RPC'; END IF;
        END LOOP;
    END LOOP;
END $$;

SET ROLE service_role;
SELECT public.claim_submission('user-a','11111111-1111-1111-1111-111111111111','hash-a','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
SELECT public.stage_submission('user-a','11111111-1111-1111-1111-111111111111',
    '{"status":200,"body":{"feedback":"Useful feedback","saved":false,"save_retry_available":true}}',
    '[{"table":"session_logs","data":{"module":"writing","score":7}},
      {"table":"writing_submissions","data":{"prompt":"Prompt","essay_text":"Essay","user_id":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}}]');
SELECT public.finish_submission('user-a','11111111-1111-1111-1111-111111111111');
SELECT public.finish_submission('user-a','11111111-1111-1111-1111-111111111111');
DO $$
BEGIN
    IF public.claim_submission('user-a','11111111-1111-1111-1111-111111111111','different-hash','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')->>'state' <> 'conflict' THEN
        RAISE EXCEPTION 'Key reuse accepted different payload';
    END IF;
END $$;
RESET ROLE;
DO $$
DECLARE record_key uuid;
BEGIN
    SELECT record_id INTO record_key FROM public.submission_attempts WHERE principal='user-a';
    IF (SELECT count(*) FROM public.session_logs WHERE id=record_key)<>1
       OR (SELECT count(*) FROM public.writing_submissions WHERE id=record_key AND user_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')<>1 THEN
        RAISE EXCEPTION 'Atomic persistence, ownership or replay failed';
    END IF;
END $$;

-- Fail the second insert: the first must roll back, while the checkpoint survives.
SELECT public.claim_submission('broken','22222222-2222-2222-2222-222222222222','hash','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
SELECT public.stage_submission('broken','22222222-2222-2222-2222-222222222222', '{"status":200,"body":{}}',
    '[{"table":"session_logs","data":{"module":"writing"}}, {"table":"writing_submissions","data":{"essay_text":"Missing prompt"}}]');
DO $$
DECLARE record_key uuid;
BEGIN
    BEGIN
        PERFORM public.finish_submission('broken','22222222-2222-2222-2222-222222222222');
        RAISE EXCEPTION 'Invalid archive unexpectedly saved';
    EXCEPTION WHEN not_null_violation THEN NULL;
    END;
    SELECT record_id INTO record_key FROM public.submission_attempts WHERE principal='broken' AND state='ready';
    IF record_key IS NULL OR EXISTS(SELECT 1 FROM public.session_logs WHERE id=record_key) THEN
        RAISE EXCEPTION 'Partial insert or lost checkpoint';
    END IF;
END $$;

-- A guest has a private retry checkpoint, but no permanent history or essay.
SELECT public.claim_submission('guest','33333333-3333-3333-3333-333333333333','hash',NULL);
SELECT public.stage_submission('guest','33333333-3333-3333-3333-333333333333','{"status":200,"body":{}}','[]');
DO $$
BEGIN
    IF public.finish_submission('guest','33333333-3333-3333-3333-333333333333')->'body'->>'saved' <> 'false' THEN
        RAISE EXCEPTION 'Guest marked saved';
    END IF;
    IF public.finish_submission('other-user','11111111-1111-1111-1111-111111111111')->>'status' <> '409' THEN
        RAISE EXCEPTION 'Other user accessed attempt';
    END IF;
END $$;

DO $$
DECLARE first_token uuid := gen_random_uuid(); second_token uuid := gen_random_uuid();
BEGIN
    IF public.acquire_workload(ARRAY['ip','user'],'unit',first_token,2,1)<>'ok' THEN RAISE EXCEPTION 'Admission failed'; END IF;
    IF public.acquire_workload(ARRAY['other'],'unit',second_token,2,1)<>'busy' THEN RAISE EXCEPTION 'Capacity bypass'; END IF;
    PERFORM public.release_workload(first_token);
    IF public.acquire_workload(ARRAY['ip','user'],'unit',second_token,2,1)<>'ok' THEN RAISE EXCEPTION 'Release failed'; END IF;
    PERFORM public.release_workload(second_token);
    IF public.acquire_workload(ARRAY['ip','rotated-guest'],'unit',gen_random_uuid(),2,1)<>'quota' THEN RAISE EXCEPTION 'IP quota bypass'; END IF;
    UPDATE public.workload_counters SET window_start=now()-interval '2 hours';
    IF public.acquire_workload(ARRAY['ip'],'unit',gen_random_uuid(),2,1)<>'ok' THEN RAISE EXCEPTION 'Quota did not reset'; END IF;
    UPDATE public.workload_leases SET expires_at=now()-interval '1 second';
    IF public.acquire_workload(ARRAY['ip'],'unit',gen_random_uuid(),2,1)<>'ok' THEN RAISE EXCEPTION 'Expired lease not reclaimed'; END IF;
END $$;

DELETE FROM public.session_logs WHERE id=(SELECT record_id FROM public.submission_attempts WHERE principal='user-a');
DO $$
BEGIN
    IF EXISTS(SELECT 1 FROM public.writing_submissions WHERE id=(SELECT record_id FROM public.submission_attempts WHERE principal='user-a'))
       OR (SELECT state FROM public.submission_attempts WHERE principal='user-a')<>'expired' THEN
        RAISE EXCEPTION 'History deletion retained private retry data';
    END IF;
END $$;
UPDATE public.submission_attempts SET created_at=now()-interval '2 days' WHERE principal='guest';
SELECT public.expire_submission_data();
DO $$
BEGIN
    IF EXISTS(SELECT 1 FROM public.submission_attempts WHERE principal='guest' AND (response IS NOT NULL OR records IS NOT NULL OR state<>'expired')) THEN
        RAISE EXCEPTION 'Private data did not expire';
    END IF;
END $$;
SELECT 'PASS: atomic rollback, replay, ownership, guest privacy, quotas, leases, deletion and expiry';
