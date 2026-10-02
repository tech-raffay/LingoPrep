-- ============================================================================
-- LingoPrep — make sure every signed-in user's results can be saved.
-- Run once in the Supabase SQL editor. Safe to run more than once.
--
-- session_logs.user_id references profiles(id). Profiles are created by the
-- on_auth_user_created trigger, but accounts made before that trigger existed
-- have no profile row, so their results could never be stored.
-- ============================================================================

-- 1. Backfill a profile for every existing account that is missing one.
INSERT INTO public.profiles (id, email, full_name)
SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'full_name', '')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 2. Let a signed-in user create their own profile row if it is ever missing.
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
