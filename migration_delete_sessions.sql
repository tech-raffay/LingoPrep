-- ============================================================================
-- Let a signed-in user delete their own test results (the bin button on the
-- Results page). Run once in the Supabase SQL editor. Safe to run again.
-- ============================================================================

DROP POLICY IF EXISTS "Users can delete own sessions" ON public.session_logs;
CREATE POLICY "Users can delete own sessions" ON public.session_logs
  FOR DELETE USING (auth.uid() = user_id);
