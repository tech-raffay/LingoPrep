-- Executed only in the disposable cluster created by the local test runner.
\ir database_protection.sql
-- Fresh setup, then simulate an older catalog with private sample content.
\ir ../../migration_writing_prompts.sql
ALTER TABLE public.writing_samples ADD COLUMN sample_essay text;
INSERT INTO public.writing_samples(exam_type,task_type,question,sample_essay)
    VALUES ('ielts','task2','Public question','Private sample'),
           (NULL,'task2','Unclassified question','Private sample');
GRANT SELECT (sample_essay) ON public.writing_samples TO anon;
\ir ../../migration_writing_prompts.sql
DO $$ BEGIN
    IF (SELECT count(*) FROM public.writing_samples) <> 2 THEN
        RAISE EXCEPTION 'Migration lost existing prompts';
    END IF;
END $$;
SET ROLE anon;
DO $$ BEGIN
    IF (SELECT count(id) FROM public.writing_samples) <> 1 THEN
        RAISE EXCEPTION 'Unclassified prompts must stay hidden';
    END IF;
    BEGIN
        PERFORM sample_essay FROM public.writing_samples;
        RAISE EXCEPTION 'Private sample column exposed';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
        INSERT INTO public.writing_samples(task_type,question) VALUES ('task2','forged');
        RAISE EXCEPTION 'Anonymous prompt write allowed';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
END $$;
RESET ROLE;
-- Also check an older compatible table with no exam_type column.
DROP TABLE public.writing_samples;
CREATE TABLE public.writing_samples (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), task_type text,
    question text, overall numeric, sample_essay text
);
INSERT INTO public.writing_samples(task_type,question) VALUES ('task2','Preserved legacy question');
\ir ../../migration_writing_prompts.sql
DO $$ BEGIN
    IF (SELECT count(*) FROM public.writing_samples WHERE exam_type IS NULL) <> 1 THEN
        RAISE EXCEPTION 'Migration inferred or lost historical exam data';
    END IF;
END $$;
