
-- Drop the old unique constraint on subject_name alone
ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS subjects_subject_name_key;
