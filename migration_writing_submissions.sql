-- ====================================================================
-- MIGRATE WRITING SUBMISSIONS TABLE TO THE LATEST SCHEMA
-- Run this script in your Supabase SQL Editor
-- ====================================================================

-- 1. Drop the old writing_submissions table (warning: this will clear previous submissions)
DROP TABLE IF EXISTS public.writing_submissions CASCADE;

-- 2. Create the table matching schema.sql
CREATE TABLE public.writing_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    prompt TEXT NOT NULL,
    essay_text TEXT NOT NULL,
    exam_type TEXT DEFAULT 'ielts',
    task_type TEXT DEFAULT '',
    word_count INTEGER DEFAULT 0,
    overall_band NUMERIC(3,1) DEFAULT 0,
    task_achievement NUMERIC(3,1) DEFAULT 0,
    coherence_cohesion NUMERIC(3,1) DEFAULT 0,
    lexical_resource NUMERIC(3,1) DEFAULT 0,
    grammatical_range NUMERIC(3,1) DEFAULT 0,
    feedback TEXT DEFAULT '',
    suggestions JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.writing_submissions ENABLE ROW LEVEL SECURITY;

-- 4. Re-create policies for writing_submissions
CREATE POLICY "Users can view own writing" ON public.writing_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own writing" ON public.writing_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow anon writing inserts" ON public.writing_submissions FOR INSERT WITH CHECK (user_id IS NULL);
CREATE POLICY "Allow anon writing reads" ON public.writing_submissions FOR SELECT USING (user_id IS NULL);
