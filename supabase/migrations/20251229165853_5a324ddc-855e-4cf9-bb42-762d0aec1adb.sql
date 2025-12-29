-- Add exam_type column to questions table
-- Values: 'RN', 'PN', or 'Both'
ALTER TABLE public.questions 
ADD COLUMN exam_type text NOT NULL DEFAULT 'Both';