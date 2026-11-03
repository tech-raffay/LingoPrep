-- Additive prompt setup: no drops, deletes, or inferred exam labels.
-- Existing rows without exam_type must be classified by the content owner.
BEGIN;
CREATE TABLE IF NOT EXISTS public.writing_samples (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_type text CHECK (exam_type IN ('ielts', 'toefl')),
    task_type text NOT NULL,
    question text NOT NULL,
    overall numeric
);
ALTER TABLE public.writing_samples ADD COLUMN IF NOT EXISTS exam_type text;
ALTER TABLE public.writing_samples ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.writing_samples FROM PUBLIC, anon, authenticated;
-- Table REVOKE does not remove pre-existing column grants.
DO $$
DECLARE column_names text;
BEGIN
    SELECT string_agg(quote_ident(attname), ', ') INTO column_names
    FROM pg_attribute WHERE attrelid = 'public.writing_samples'::regclass
        AND attnum > 0 AND NOT attisdropped;
    EXECUTE format('REVOKE ALL (%s) ON public.writing_samples FROM PUBLIC, anon, authenticated', column_names);
END $$;
GRANT SELECT (id, exam_type, task_type, question, overall)
    ON public.writing_samples TO anon, authenticated;
GRANT ALL ON public.writing_samples TO service_role;
DROP POLICY IF EXISTS "Published practice prompt reads" ON public.writing_samples;
CREATE POLICY "Published practice prompt reads" ON public.writing_samples
    FOR SELECT TO anon, authenticated USING (exam_type IN ('ielts', 'toefl'));
COMMIT;
