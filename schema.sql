-- ============================================
-- LingoPrep Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to ensure a clean migration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP TABLE IF EXISTS public.writing_submissions CASCADE;
DROP TABLE IF EXISTS public.session_logs CASCADE;
DROP TABLE IF EXISTS public.options CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.passages CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================
-- 1. PROFILES TABLE (linked to Supabase Auth)
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    target_exam TEXT DEFAULT 'ielts' CHECK (target_exam IN ('ielts', 'toefl')),
    target_score NUMERIC(3,1) DEFAULT 7.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. PASSAGES TABLE (Reading & Listening)
-- ============================================
CREATE TABLE public.passages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    module TEXT NOT NULL CHECK (module IN ('reading', 'listening', 'speaking')),
    audio_url TEXT DEFAULT '',
    audio_duration_seconds INTEGER DEFAULT 0,
    transcript TEXT DEFAULT '',
    word_count INTEGER DEFAULT 0,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    exam_type TEXT DEFAULT 'ielts' CHECK (exam_type IN ('ielts', 'toefl')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. QUESTIONS TABLE
-- ============================================
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    passage_id UUID NOT NULL REFERENCES public.passages(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    explanation TEXT DEFAULT '',
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. OPTIONS TABLE
-- ============================================
CREATE TABLE public.options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_label TEXT NOT NULL DEFAULT 'A',
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0
);

-- ============================================
-- 5. SESSION LOGS TABLE
-- ============================================
CREATE TABLE public.session_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    module TEXT NOT NULL CHECK (module IN ('reading', 'listening', 'writing', 'speaking')),
    passage_id UUID REFERENCES public.passages(id) ON DELETE SET NULL,
    score NUMERIC(4,1) DEFAULT 0,
    max_score NUMERIC(4,1) DEFAULT 0,
    percentage NUMERIC(5,1) DEFAULT 0,
    band_score NUMERIC(3,1) DEFAULT 0,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. WRITING SUBMISSIONS TABLE
-- ============================================
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

-- ============================================
-- 7. INDEXES
-- ============================================
CREATE INDEX idx_passages_module ON public.passages(module);
CREATE INDEX idx_passages_exam ON public.passages(exam_type);
CREATE INDEX idx_questions_passage ON public.questions(passage_id);
CREATE INDEX idx_options_question ON public.options(question_id);
CREATE INDEX idx_session_logs_user ON public.session_logs(user_id);
CREATE INDEX idx_session_logs_module ON public.session_logs(module);
CREATE INDEX idx_writing_submissions_user ON public.writing_submissions(user_id);

-- ============================================
-- 8. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_submissions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Passages/Questions/Options: everyone can read (public content)
CREATE POLICY "Anyone can read passages" ON public.passages FOR SELECT USING (true);
CREATE POLICY "Anyone can read questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Anyone can read options" ON public.options FOR SELECT USING (true);

-- Session logs: users can read/insert their own
CREATE POLICY "Users can view own sessions" ON public.session_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.session_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Also allow anonymous inserts for demo mode
CREATE POLICY "Allow anon session inserts" ON public.session_logs FOR INSERT WITH CHECK (user_id IS NULL);
CREATE POLICY "Allow anon session reads" ON public.session_logs FOR SELECT USING (user_id IS NULL);

-- Writing submissions: same pattern
CREATE POLICY "Users can view own writing" ON public.writing_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own writing" ON public.writing_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow anon writing inserts" ON public.writing_submissions FOR INSERT WITH CHECK (user_id IS NULL);
CREATE POLICY "Allow anon writing reads" ON public.writing_submissions FOR SELECT USING (user_id IS NULL);

-- ============================================
-- 9. SEED DATA — READING PASSAGES
-- ============================================

-- Reading Passage 1
INSERT INTO public.passages (id, title, content, module, word_count, difficulty, exam_type)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'The Impact of Climate Change on Marine Ecosystems',
    E'Climate change has emerged as one of the most significant threats to marine ecosystems worldwide. Rising ocean temperatures, increasing acidification, and changing current patterns are fundamentally altering the conditions that marine species have adapted to over millions of years.\n\nCoral reefs, often called the "rainforests of the sea," are particularly vulnerable. When water temperatures rise even 1-2°C above the normal summer maximum, corals expel the symbiotic algae living in their tissues, causing them to turn white — a phenomenon known as coral bleaching. If the stress continues, the coral dies. The Great Barrier Reef has experienced several mass bleaching events in recent years, with scientists warning that rising temperatures could render most coral reefs unviable by 2050.\n\nBeyond corals, marine food webs are being disrupted at every level. Phytoplankton, the microscopic organisms that form the base of the ocean food chain, are declining in many regions as warmer surface waters become more stratified, reducing the upwelling of nutrients from deeper layers. This has cascading effects: fewer phytoplankton means less food for zooplankton, which in turn affects fish populations and the larger predators that depend on them.\n\nOcean acidification, caused by the absorption of excess carbon dioxide from the atmosphere, poses an additional threat. As CO2 dissolves in seawater, it forms carbonic acid, lowering the pH of the ocean. This makes it harder for organisms like mollusks, sea urchins, and some species of plankton to build their calcium carbonate shells and skeletons. Studies have shown that current rates of acidification are unprecedented in at least the last 300 million years.',
    'reading', 320, 'medium', 'ielts'
);

INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order) VALUES
('11111111-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'What happens when water temperatures rise 1-2°C above the normal summer maximum?', 'The passage states that corals expel their symbiotic algae when temperatures rise 1-2°C above normal, causing coral bleaching.', 'medium', 1),
('11111111-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'Why is phytoplankton declining in many regions?', 'The passage explains that warmer surface waters become more stratified, reducing the upwelling of nutrients from deeper layers.', 'medium', 2),
('11111111-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 'What makes ocean acidification particularly concerning according to the passage?', 'The passage states that current rates of acidification are unprecedented in at least the last 300 million years.', 'hard', 3);

INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
('11111111-0001-0001-0001-000000000001', 'A', 'Coral reefs grow faster', FALSE, 1),
('11111111-0001-0001-0001-000000000001', 'B', 'Corals undergo bleaching by expelling symbiotic algae', TRUE, 2),
('11111111-0001-0001-0001-000000000001', 'C', 'Marine species migrate to deeper waters', FALSE, 3),
('11111111-0001-0001-0001-000000000001', 'D', 'Phytoplankton populations increase', FALSE, 4),
('11111111-0001-0001-0001-000000000002', 'A', 'Due to overfishing of zooplankton', FALSE, 1),
('11111111-0001-0001-0001-000000000002', 'B', 'Because of increased ocean salinity', FALSE, 2),
('11111111-0001-0001-0001-000000000002', 'C', 'Warmer surface waters reduce nutrient upwelling', TRUE, 3),
('11111111-0001-0001-0001-000000000002', 'D', 'Light pollution from coastal cities', FALSE, 4),
('11111111-0001-0001-0001-000000000003', 'A', 'It only affects tropical waters', FALSE, 1),
('11111111-0001-0001-0001-000000000003', 'B', 'Current rates are unprecedented in at least 300 million years', TRUE, 2),
('11111111-0001-0001-0001-000000000003', 'C', 'It has no measurable effect yet', FALSE, 3),
('11111111-0001-0001-0001-000000000003', 'D', 'It only affects microscopic organisms', FALSE, 4);

-- Reading Passage 2
INSERT INTO public.passages (id, title, content, module, word_count, difficulty, exam_type)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'The Psychology of Decision Making',
    E'Human decision-making is far less rational than most people assume. Research in behavioral economics and cognitive psychology has revealed that our choices are heavily influenced by cognitive biases — systematic patterns of deviation from rationality.\n\nOne of the most well-documented biases is the anchoring effect. When making estimates or decisions, people tend to rely too heavily on the first piece of information they encounter (the "anchor"), even when it is arbitrary or irrelevant. In a classic experiment, participants were asked to estimate the percentage of African countries in the United Nations. Those who first spun a wheel that landed on 65 gave significantly higher estimates than those whose wheel landed on 10, despite the wheel being obviously random.\n\nThe availability heuristic is another powerful bias. People tend to judge the probability of events based on how easily examples come to mind. After seeing news coverage of plane crashes, many people overestimate the danger of flying while underestimating far more common risks like car accidents. This bias explains why dramatic but rare events often receive disproportionate attention in public policy.\n\nLoss aversion, identified by psychologists Daniel Kahneman and Amos Tversky, describes our tendency to prefer avoiding losses over acquiring equivalent gains. Studies show that the pain of losing $100 is psychologically about twice as powerful as the pleasure of gaining $100. This asymmetry affects everything from investment decisions to everyday consumer choices.\n\nUnderstanding these biases is crucial not only for individual decision-making but also for designing better policies, products, and institutions that account for the systematic ways in which human judgment departs from pure rationality.',
    'reading', 280, 'hard', 'ielts'
);

INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order) VALUES
('22222222-0001-0001-0001-000000000001', '22222222-2222-2222-2222-222222222222', 'What is the anchoring effect?', 'The passage defines it as relying too heavily on the first piece of information encountered when making estimates.', 'medium', 1),
('22222222-0001-0001-0001-000000000002', '22222222-2222-2222-2222-222222222222', 'Why do people overestimate the danger of flying?', 'The availability heuristic causes people to judge probability based on how easily examples come to mind, and plane crashes receive heavy media coverage.', 'medium', 2),
('22222222-0001-0001-0001-000000000003', '22222222-2222-2222-2222-222222222222', 'According to loss aversion research, how does the pain of losing compare to the pleasure of gaining?', 'Studies show losing $100 is psychologically about twice as powerful as gaining $100.', 'easy', 3);

INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
('22222222-0001-0001-0001-000000000001', 'A', 'The tendency to make decisions quickly', FALSE, 1),
('22222222-0001-0001-0001-000000000001', 'B', 'Relying too heavily on the first piece of information encountered', TRUE, 2),
('22222222-0001-0001-0001-000000000001', 'C', 'Avoiding decisions altogether under pressure', FALSE, 3),
('22222222-0001-0001-0001-000000000001', 'D', 'Making choices based on emotional state', FALSE, 4),
('22222222-0001-0001-0001-000000000002', 'A', 'Because flying is statistically dangerous', FALSE, 1),
('22222222-0001-0001-0001-000000000002', 'B', 'Due to personal experience with turbulence', FALSE, 2),
('22222222-0001-0001-0001-000000000002', 'C', 'The availability heuristic makes dramatic events seem more probable', TRUE, 3),
('22222222-0001-0001-0001-000000000002', 'D', 'Airlines provide misleading safety information', FALSE, 4),
('22222222-0001-0001-0001-000000000003', 'A', 'They are roughly equal in intensity', FALSE, 1),
('22222222-0001-0001-0001-000000000003', 'B', 'The pain of losing is about twice as powerful as the pleasure of gaining', TRUE, 2),
('22222222-0001-0001-0001-000000000003', 'C', 'Gaining is three times more pleasurable than losing is painful', FALSE, 3),
('22222222-0001-0001-0001-000000000003', 'D', 'The relationship varies by age group', FALSE, 4);

-- ============================================
-- 10. SEED DATA — LISTENING PASSAGES
-- ============================================

-- Listening 1 (public placeholder MP3)
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'University Lecture: Introduction to Renewable Energy',
    '',
    'listening',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    225,
    'Good morning, everyone. Today we are going to discuss the fundamentals of renewable energy sources and why they are becoming increasingly important in our global energy landscape. Renewable energy refers to energy derived from natural processes that are replenished at a rate faster than they are consumed. The most common types include solar, wind, hydroelectric, and geothermal energy. Solar energy harnesses sunlight using photovoltaic cells or solar thermal collectors. Wind energy converts the kinetic energy of moving air into electricity using turbines. These sources are crucial because they produce little to no greenhouse gas emissions during operation.',
    'medium', 'ielts'
);

INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order) VALUES
('33333333-0001-0001-0001-000000000001', '33333333-3333-3333-3333-333333333333', 'What is the main topic of the lecture?', 'The speaker explicitly states they will discuss the fundamentals of renewable energy sources.', 'easy', 1),
('33333333-0001-0001-0001-000000000002', '33333333-3333-3333-3333-333333333333', 'Which of the following is NOT mentioned as a type of renewable energy?', 'The transcript mentions solar, wind, hydroelectric, and geothermal. Nuclear is not mentioned.', 'medium', 2),
('33333333-0001-0001-0001-000000000003', '33333333-3333-3333-3333-333333333333', 'Why are renewable energy sources described as crucial?', 'The transcript states they produce little to no greenhouse gas emissions during operation.', 'medium', 3);

INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
('33333333-0001-0001-0001-000000000001', 'A', 'Nuclear energy safety protocols', FALSE, 1),
('33333333-0001-0001-0001-000000000001', 'B', 'Fundamentals of renewable energy sources', TRUE, 2),
('33333333-0001-0001-0001-000000000001', 'C', 'History of fossil fuel consumption', FALSE, 3),
('33333333-0001-0001-0001-000000000001', 'D', 'Economic impact of oil prices', FALSE, 4),
('33333333-0001-0001-0001-000000000002', 'A', 'Solar energy', FALSE, 1),
('33333333-0001-0001-0001-000000000002', 'B', 'Wind energy', FALSE, 2),
('33333333-0001-0001-0001-000000000002', 'C', 'Nuclear energy', TRUE, 3),
('33333333-0001-0001-0001-000000000002', 'D', 'Geothermal energy', FALSE, 4),
('33333333-0001-0001-0001-000000000003', 'A', 'They are cheaper than all other energy sources', FALSE, 1),
('33333333-0001-0001-0001-000000000003', 'B', 'Governments require their use by law', FALSE, 2),
('33333333-0001-0001-0001-000000000003', 'C', 'They produce little to no greenhouse gas emissions', TRUE, 3),
('33333333-0001-0001-0001-000000000003', 'D', 'Fossil fuels have already run out', FALSE, 4);

-- Listening 2
INSERT INTO public.passages (id, title, content, module, audio_url, audio_duration_seconds, transcript, difficulty, exam_type)
VALUES (
    '44444444-4444-4444-4444-444444444444',
    'Campus Tour: Library Services Overview',
    '',
    'listening',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    180,
    'Welcome to the university library. I am Sarah, your campus guide. Our library offers several key services for students. First, we have an extensive digital database with access to over two million academic journals and research papers. You can access these from any campus computer or remotely using your student ID. Second, we offer group study rooms that can be booked online up to one week in advance. Each room is equipped with a whiteboard and a projector. Third, our writing center on the second floor provides free one-on-one tutoring for academic essays and dissertations. Sessions last 45 minutes and can be scheduled through the student portal.',
    'easy', 'toefl'
);

INSERT INTO public.questions (id, passage_id, question_text, explanation, difficulty, sort_order) VALUES
('44444444-0001-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'How many academic journals does the digital database provide access to?', 'The speaker mentions access to over two million academic journals.', 'easy', 1),
('44444444-0001-0001-0001-000000000002', '44444444-4444-4444-4444-444444444444', 'How far in advance can group study rooms be booked?', 'The speaker says rooms can be booked up to one week in advance.', 'easy', 2),
('44444444-0001-0001-0001-000000000003', '44444444-4444-4444-4444-444444444444', 'How long do writing center tutoring sessions last?', 'The speaker states sessions last 45 minutes.', 'easy', 3);

INSERT INTO public.options (question_id, option_label, option_text, is_correct, sort_order) VALUES
('44444444-0001-0001-0001-000000000001', 'A', 'Over five hundred thousand', FALSE, 1),
('44444444-0001-0001-0001-000000000001', 'B', 'Over one million', FALSE, 2),
('44444444-0001-0001-0001-000000000001', 'C', 'Over two million', TRUE, 3),
('44444444-0001-0001-0001-000000000001', 'D', 'Over ten million', FALSE, 4),
('44444444-0001-0001-0001-000000000002', 'A', 'One day', FALSE, 1),
('44444444-0001-0001-0001-000000000002', 'B', 'Three days', FALSE, 2),
('44444444-0001-0001-0001-000000000002', 'C', 'One week', TRUE, 3),
('44444444-0001-0001-0001-000000000002', 'D', 'One month', FALSE, 4),
('44444444-0001-0001-0001-000000000003', 'A', '30 minutes', FALSE, 1),
('44444444-0001-0001-0001-000000000003', 'B', '45 minutes', TRUE, 2),
('44444444-0001-0001-0001-000000000003', 'C', '60 minutes', FALSE, 3),
('44444444-0001-0001-0001-000000000003', 'D', '90 minutes', FALSE, 4);

-- ============================================
-- 11. SEED DATA — SPEAKING PROMPTS
-- ============================================

-- IELTS Speaking Prompt
INSERT INTO public.passages (id, title, content, module, word_count, difficulty, exam_type)
VALUES (
    '55555555-5555-5555-5555-555555555555',
    'IELTS Speaking: Describe a book you read recently',
    'Describe a book you read recently that you found useful. You should say: what the book was, when you read it, what it was about, and explain why you found it useful.',
    'speaking', 35, 'medium', 'ielts'
);

-- TOEFL Speaking Prompt
INSERT INTO public.passages (id, title, content, module, word_count, difficulty, exam_type)
VALUES (
    '66666666-6666-6666-6666-666666666666',
    'TOEFL Speaking: Online vs In-person Education',
    'Some people prefer to study online, while others prefer to attend traditional face-to-face classes. Which do you prefer and why? Use specific reasons and examples to support your choice.',
    'speaking', 33, 'medium', 'toefl'
);

-- ============================================
-- DONE! Schema + seed data complete.
-- ============================================

