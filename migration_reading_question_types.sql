-- ============================================
-- Migration: IELTS Academic Reading — Multi-Question-Type Support
-- Run this in Supabase SQL Editor AFTER the main schema.sql
-- ============================================

-- Add question_type column (defaults to 'multiple_choice' for backward compat)
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'multiple_choice';

-- Add question_group_label for grouping (e.g., "Questions 1–6: Matching Headings")
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS question_group_label TEXT DEFAULT '';

-- Add correct_answer_text for non-MCQ types (text-input / matching answers)
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS correct_answer_text TEXT DEFAULT '';

-- Add question_data JSONB for rich visual data (tables, flowcharts, diagrams, etc.)
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS question_data JSONB DEFAULT '{}';

-- Add check constraint for valid question types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_question_type'
  ) THEN
    ALTER TABLE public.questions ADD CONSTRAINT valid_question_type CHECK (
      question_type IN (
        'multiple_choice',
        'tfng',
        'yng',
        'matching_headings',
        'matching_info',
        'matching_features',
        'matching_sentence_endings',
        'sentence_completion',
        'summary_completion',
        'note_completion',
        'table_completion',
        'flowchart_completion',
        'diagram_label',
        'short_answer'
      )
    );
  END IF;
END $$;

-- Index for filtering by question_type
CREATE INDEX IF NOT EXISTS idx_questions_type ON public.questions(question_type);
