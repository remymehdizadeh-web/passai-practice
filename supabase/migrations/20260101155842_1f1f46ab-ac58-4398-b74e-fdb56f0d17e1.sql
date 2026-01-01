-- Add nclex_category column for official NCLEX Client Needs categories
ALTER TABLE public.questions 
ADD COLUMN nclex_category text;

-- Add study_tags column for user-facing study sections
ALTER TABLE public.questions 
ADD COLUMN study_tags text[] DEFAULT '{}';

-- Add check constraint for valid NCLEX categories
ALTER TABLE public.questions 
ADD CONSTRAINT valid_nclex_category CHECK (
  nclex_category IS NULL OR nclex_category IN (
    'Management of Care',
    'Safety and Infection Control',
    'Health Promotion and Maintenance',
    'Psychosocial Integrity',
    'Basic Care and Comfort',
    'Pharmacological and Parenteral Therapies',
    'Reduction of Risk Potential',
    'Physiological Adaptation'
  )
);

-- Migrate existing category data to nclex_category based on best match
UPDATE public.questions SET nclex_category = 
  CASE 
    WHEN category = 'Management of Care' THEN 'Management of Care'
    WHEN category = 'Safety and Infection Control' THEN 'Safety and Infection Control'
    WHEN category = 'Safety' THEN 'Safety and Infection Control'
    WHEN category = 'Health Promotion and Maintenance' THEN 'Health Promotion and Maintenance'
    WHEN category = 'Mental Health' THEN 'Psychosocial Integrity'
    WHEN category = 'Pharmacology' THEN 'Pharmacological and Parenteral Therapies'
    WHEN category = 'Med-Surg' THEN 'Physiological Adaptation'
    WHEN category = 'Fundamentals' THEN 'Basic Care and Comfort'
    WHEN category = 'Pediatrics' THEN 'Physiological Adaptation'
    WHEN category = 'OB/Maternity' THEN 'Health Promotion and Maintenance'
    WHEN category = 'Leadership' THEN 'Management of Care'
    ELSE 'Physiological Adaptation'
  END;

-- Migrate existing category to study_tags
UPDATE public.questions SET study_tags = 
  CASE 
    WHEN category = 'Management of Care' THEN ARRAY['Leadership & Prioritization']
    WHEN category = 'Safety and Infection Control' THEN ARRAY['Fundamentals']
    WHEN category = 'Safety' THEN ARRAY['Fundamentals']
    WHEN category = 'Health Promotion and Maintenance' THEN ARRAY['Fundamentals']
    WHEN category = 'Mental Health' THEN ARRAY['Mental Health']
    WHEN category = 'Pharmacology' THEN ARRAY['Pharmacology']
    WHEN category = 'Med-Surg' THEN ARRAY['Med-Surg']
    WHEN category = 'Fundamentals' THEN ARRAY['Fundamentals']
    WHEN category = 'Pediatrics' THEN ARRAY['Pediatrics']
    WHEN category = 'OB/Maternity' THEN ARRAY['Maternal & Newborn']
    WHEN category = 'Leadership' THEN ARRAY['Leadership & Prioritization']
    ELSE ARRAY['Med-Surg']
  END;

-- Make nclex_category required for future inserts
ALTER TABLE public.questions 
ALTER COLUMN nclex_category SET NOT NULL;

-- Create index for efficient filtering
CREATE INDEX idx_questions_nclex_category ON public.questions(nclex_category);
CREATE INDEX idx_questions_study_tags ON public.questions USING GIN(study_tags);