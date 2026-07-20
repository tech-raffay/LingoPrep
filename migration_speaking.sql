-- ============================================
-- LingoPrep — Speaking Module Migration
-- Run this in Supabase SQL Editor to:
-- 1. Update CHECK constraints on passages and session_logs
-- 2. Add speaking prompt seed data
-- ============================================

-- 1. Drop old CHECK constraints and add new ones with 'speaking'
ALTER TABLE public.passages DROP CONSTRAINT IF EXISTS passages_module_check;
ALTER TABLE public.passages ADD CONSTRAINT passages_module_check CHECK (module IN ('reading', 'listening', 'speaking'));

ALTER TABLE public.session_logs DROP CONSTRAINT IF EXISTS session_logs_module_check;
ALTER TABLE public.session_logs ADD CONSTRAINT session_logs_module_check CHECK (module IN ('reading', 'listening', 'writing', 'speaking'));

-- 2. Insert speaking prompts (only if they don't already exist)
INSERT INTO public.passages (id, title, content, module, word_count, difficulty, exam_type)
SELECT '55555555-5555-5555-5555-555555555555',
       'IELTS Speaking: Describe a book you read recently',
       'Describe a book you read recently that you found useful. You should say: what the book was, when you read it, what it was about, and explain why you found it useful.',
       'speaking', 35, 'medium', 'ielts'
WHERE NOT EXISTS (SELECT 1 FROM public.passages WHERE id = '55555555-5555-5555-5555-555555555555');

INSERT INTO public.passages (id, title, content, module, word_count, difficulty, exam_type)
SELECT '66666666-6666-6666-6666-666666666666',
       'TOEFL Speaking: Online vs In-person Education',
       'Some people prefer to study online, while others prefer to attend traditional face-to-face classes. Which do you prefer and why? Use specific reasons and examples to support your choice.',
       'speaking', 33, 'medium', 'toefl'
WHERE NOT EXISTS (SELECT 1 FROM public.passages WHERE id = '66666666-6666-6666-6666-666666666666');

-- Done!
