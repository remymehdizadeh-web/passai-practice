-- Add exam_date column to profiles
ALTER TABLE public.profiles 
ADD COLUMN exam_date date DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.exam_date IS 'Optional NCLEX exam date for countdown feature';