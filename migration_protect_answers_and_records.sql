-- Apply AFTER existing schema/content migrations. Never rerun schema.sql on
-- production: it drops data and restores the old policies.
-- Configure the backend-only SUPABASE_SERVICE_ROLE_KEY before this rollout.
-- Transactional and repeatable; no rows or foreign keys are removed.
BEGIN;

-- Remove ALL old policies on these tables, including permissive policies with
-- unexpected names. Adding a restrictive-looking permissive policy is not enough.
DO $$
DECLARE policy_row record;
BEGIN
    FOR policy_row IN
        SELECT tablename, policyname FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('questions', 'options', 'session_logs',
                            'writing_submissions', 'profiles', 'passages')
    LOOP
        EXECUTE format('DROP POLICY %I ON public.%I',
                       policy_row.policyname, policy_row.tablename);
    END LOOP;
END $$;

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passages ENABLE ROW LEVEL SECURITY;

-- Questions include answer text/explanations and JSON metadata. Keep entire
-- tables private; only the backend's allowlisted content response is public.
REVOKE ALL PRIVILEGES ON TABLE public.questions, public.options,
    public.session_logs, public.writing_submissions, public.profiles,
    public.passages FROM PUBLIC, anon, authenticated;

GRANT SELECT ON public.questions, public.options, public.passages TO service_role;
GRANT SELECT, INSERT ON public.session_logs, public.writing_submissions TO service_role;

-- Browser clients cannot create or change grades, even for their own account.
-- Null-owner legacy rows stay private, including rows orphaned by account deletion.
GRANT SELECT, DELETE ON public.session_logs, public.writing_submissions TO authenticated;
CREATE POLICY "Owner reads sessions" ON public.session_logs
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Owner deletes sessions" ON public.session_logs
    FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Owner reads writing" ON public.writing_submissions
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Owner deletes writing" ON public.writing_submissions
    FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
CREATE POLICY "Owner reads profile" ON public.profiles
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id);
CREATE POLICY "Owner creates profile" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY "Owner updates profile" ON public.profiles
    FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);

-- Passages remain public practice material, but browsers cannot edit content.
GRANT SELECT ON public.passages TO anon, authenticated;
CREATE POLICY "Public passage reads" ON public.passages
    FOR SELECT TO anon, authenticated USING (true);

COMMIT;
