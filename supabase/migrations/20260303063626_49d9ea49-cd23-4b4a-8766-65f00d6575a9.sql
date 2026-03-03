
-- Add section column to subjects table so each section has its own subjects
ALTER TABLE public.subjects ADD COLUMN section text DEFAULT 'A2';

-- Create unique constraint so same subject name can exist in different sections
ALTER TABLE public.subjects ADD CONSTRAINT subjects_name_section_unique UNIQUE (subject_name, section);
