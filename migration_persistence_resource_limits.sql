-- Incremental migration. Apply after migration_protect_answers_and_records.sql.
-- All RPCs below are backend-only; never grant them to browser roles.
BEGIN;
CREATE TABLE IF NOT EXISTS public.submission_attempts (
    principal text NOT NULL,
    attempt_key uuid NOT NULL,
    fingerprint text NOT NULL,
    record_id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    state text NOT NULL DEFAULT 'running' CHECK (state IN ('running','ready','done','expired')),
    response jsonb,
    records jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (principal, attempt_key)
);
CREATE TABLE IF NOT EXISTS public.workload_counters (
    actor text NOT NULL, kind text NOT NULL, window_start timestamptz NOT NULL,
    requests integer NOT NULL, PRIMARY KEY (actor, kind, window_start)
);
CREATE TABLE IF NOT EXISTS public.workload_leases (
    token uuid PRIMARY KEY, kind text NOT NULL, expires_at timestamptz NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS submission_attempt_record_id ON public.submission_attempts(record_id);
CREATE INDEX IF NOT EXISTS submission_attempt_created_at ON public.submission_attempts(created_at);
CREATE INDEX IF NOT EXISTS submission_attempt_user ON public.submission_attempts(user_id);
CREATE INDEX IF NOT EXISTS workload_counter_window ON public.workload_counters(window_start);
CREATE INDEX IF NOT EXISTS workload_lease_kind ON public.workload_leases(kind);
CREATE INDEX IF NOT EXISTS workload_lease_expiry ON public.workload_leases(expires_at);
ALTER TABLE public.submission_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workload_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workload_leases ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.submission_attempts, public.workload_counters, public.workload_leases FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.claim_submission(p_principal text, p_key uuid, p_fingerprint text, p_user uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE attempt public.submission_attempts; inserted integer;
BEGIN
    INSERT INTO public.submission_attempts(principal,attempt_key,fingerprint,user_id)
    VALUES(p_principal,p_key,p_fingerprint,p_user) ON CONFLICT DO NOTHING;
    GET DIAGNOSTICS inserted = ROW_COUNT;
    SELECT * INTO attempt FROM public.submission_attempts WHERE principal=p_principal AND attempt_key=p_key FOR UPDATE;
    IF attempt.fingerprint <> p_fingerprint THEN RETURN '{"state":"conflict"}'; END IF;
    IF inserted=1 THEN RETURN '{"state":"new"}'; END IF;
    -- Keep a small tombstone, but erase private retry data after one day.
    IF attempt.created_at < now()-interval '1 day' THEN
        UPDATE public.submission_attempts SET state='expired',response=NULL,records=NULL WHERE principal=p_principal AND attempt_key=p_key;
        RETURN '{"state":"expired"}';
    END IF;
    RETURN jsonb_build_object('state',attempt.state,'response',attempt.response);
END $$;

CREATE OR REPLACE FUNCTION public.stage_submission(p_principal text,p_key uuid,p_response jsonb,p_records jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
    IF jsonb_array_length(p_records)>2 OR octet_length(p_response::text)>524288 OR octet_length(p_records::text)>524288 THEN
        RAISE EXCEPTION 'Attempt exceeds storage bounds';
    END IF;
    UPDATE public.submission_attempts SET state='ready',response=p_response,records=p_records
    WHERE principal=p_principal AND attempt_key=p_key AND state='running';
    -- A repeated checkpoint is safe after a lost database response.
    IF NOT FOUND AND NOT EXISTS (SELECT 1 FROM public.submission_attempts WHERE principal=p_principal AND attempt_key=p_key AND state IN ('ready','done')) THEN
        RAISE EXCEPTION 'Attempt cannot be staged';
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.finish_submission(p_principal text,p_key uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE attempt public.submission_attempts; item jsonb; data jsonb; result jsonb;
BEGIN
    SELECT * INTO attempt FROM public.submission_attempts WHERE principal=p_principal AND attempt_key=p_key FOR UPDATE;
    IF NOT FOUND OR attempt.state NOT IN ('ready','done') OR attempt.created_at < now()-interval '1 day' THEN
        RETURN '{"status":409,"body":{"detail":"This saved evaluation is unavailable or expired. It will not be evaluated again."}}';
    END IF;
    IF attempt.state='done' THEN RETURN attempt.response; END IF;
    IF attempt.user_id IS NOT NULL THEN
        FOR item IN SELECT * FROM jsonb_array_elements(attempt.records) LOOP
            -- Server-owned IDs and ownership override any collected fields.
            data := (item->'data') || jsonb_build_object('id',attempt.record_id,'user_id',attempt.user_id,'created_at',now());
            IF item->>'table'='session_logs' THEN
                INSERT INTO public.session_logs SELECT (jsonb_populate_record(NULL::public.session_logs,data)).*;
            ELSIF item->>'table'='writing_submissions' THEN
                INSERT INTO public.writing_submissions SELECT (jsonb_populate_record(NULL::public.writing_submissions,data)).*;
            ELSE RAISE EXCEPTION 'Unsupported result table'; END IF;
        END LOOP;
    END IF;
    result := jsonb_set(attempt.response, '{body,saved}', to_jsonb(attempt.user_id IS NOT NULL AND jsonb_array_length(attempt.records)>0));
    result := jsonb_set(result, '{body,save_retry_available}', 'false');
    UPDATE public.submission_attempts SET state='done',response=result,records=NULL WHERE principal=p_principal AND attempt_key=p_key;
    RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.acquire_workload(p_actors text[],p_kind text,p_token uuid,p_limit integer,p_capacity integer)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE actor_key text; window_time timestamptz := date_trunc('hour',now());
BEGIN
    -- Serialize admission per workload across all API processes.
    PERFORM pg_advisory_xact_lock(hashtextextended('lingoprep:'||p_kind,0));
    DELETE FROM public.workload_leases WHERE expires_at<now();
    DELETE FROM public.workload_counters WHERE window_start < window_time;
    IF (SELECT count(*) FROM public.workload_leases WHERE kind=p_kind)>=p_capacity THEN RETURN 'busy'; END IF;
    FOREACH actor_key IN ARRAY p_actors LOOP
        IF EXISTS(SELECT 1 FROM public.workload_counters c WHERE c.actor=actor_key AND kind=p_kind AND window_start=window_time AND requests>=p_limit) THEN RETURN 'quota'; END IF;
    END LOOP;
    FOREACH actor_key IN ARRAY p_actors LOOP
        INSERT INTO public.workload_counters VALUES(actor_key,p_kind,window_time,1)
        ON CONFLICT(actor,kind,window_start) DO UPDATE SET requests=workload_counters.requests+1;
    END LOOP;
    INSERT INTO public.workload_leases VALUES(p_token,p_kind,now()+interval '5 minutes');
    RETURN 'ok';
END $$;

CREATE OR REPLACE FUNCTION public.release_workload(p_token uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
    DELETE FROM public.workload_leases WHERE token=p_token;
$$;

CREATE OR REPLACE FUNCTION public.expire_submission_data()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
    UPDATE public.submission_attempts SET response=NULL,records=NULL,state='expired'
    WHERE created_at<now()-interval '1 day' AND state<>'expired';
    DELETE FROM public.submission_attempts WHERE created_at<now()-interval '7 days';
    DELETE FROM public.workload_counters WHERE window_start<date_trunc('hour',now());
    DELETE FROM public.workload_leases WHERE expires_at<now();
$$;

-- Deleting history also erases its retry copy and linked essay. A replay must
-- never resurrect a result the learner deliberately deleted.
CREATE OR REPLACE FUNCTION public.erase_submission_retry()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
    UPDATE public.submission_attempts SET state='expired',response=NULL,records=NULL WHERE record_id=OLD.id AND user_id=OLD.user_id;
    DELETE FROM public.writing_submissions WHERE id=OLD.id AND user_id=OLD.user_id;
    RETURN OLD;
END $$;
DROP TRIGGER IF EXISTS erase_submission_retry ON public.session_logs;
CREATE TRIGGER erase_submission_retry AFTER DELETE ON public.session_logs FOR EACH ROW EXECUTE FUNCTION public.erase_submission_retry();

REVOKE ALL ON FUNCTION public.claim_submission(text,uuid,text,uuid), public.stage_submission(text,uuid,jsonb,jsonb), public.finish_submission(text,uuid), public.acquire_workload(text[],text,uuid,integer,integer), public.release_workload(uuid), public.expire_submission_data(), public.erase_submission_retry() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_submission(text,uuid,text,uuid), public.stage_submission(text,uuid,jsonb,jsonb), public.finish_submission(text,uuid), public.acquire_workload(text[],text,uuid,integer,integer), public.release_workload(uuid), public.expire_submission_data() TO service_role;
COMMIT;
