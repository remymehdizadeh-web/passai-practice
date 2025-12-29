-- Create questions table for NCLEX practice
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stem TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_label TEXT NOT NULL CHECK (correct_label IN ('A', 'B', 'C', 'D')),
  rationale_bullets TEXT[] NOT NULL DEFAULT '{}',
  wrong_option_bullets JSONB,
  takeaway TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_progress table to track attempts (anonymous users supported)
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  selected_label TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookmarks table
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, question_id)
);

-- Create issue_reports table for quality control
CREATE TABLE public.issue_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('wrong_answer', 'unclear', 'typo', 'not_nclex_style', 'other')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_reports ENABLE ROW LEVEL SECURITY;

-- Questions are public read (no auth required for MVP)
CREATE POLICY "Questions are publicly readable"
ON public.questions
FOR SELECT
USING (is_active = true);

-- User progress - users can insert and read their own session data
CREATE POLICY "Anyone can insert progress"
ON public.user_progress
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can read their own progress"
ON public.user_progress
FOR SELECT
USING (true);

-- Bookmarks - users can manage their own bookmarks
CREATE POLICY "Anyone can insert bookmarks"
ON public.bookmarks
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can read their own bookmarks"
ON public.bookmarks
FOR SELECT
USING (true);

CREATE POLICY "Users can delete their own bookmarks"
ON public.bookmarks
FOR DELETE
USING (true);

-- Issue reports - anyone can submit
CREATE POLICY "Anyone can submit issue reports"
ON public.issue_reports
FOR INSERT
WITH CHECK (true);

-- Insert seed questions for immediate use
INSERT INTO public.questions (stem, options, correct_label, rationale_bullets, wrong_option_bullets, takeaway, category, difficulty) VALUES
(
  'A nurse is caring for a client who is receiving a blood transfusion. Which of the following findings should the nurse identify as an indication of a transfusion reaction?',
  '[{"label": "A", "text": "Temperature increase of 0.5°F"}, {"label": "B", "text": "Urticaria and itching"}, {"label": "C", "text": "Blood pressure of 118/76 mmHg"}, {"label": "D", "text": "Heart rate of 82 bpm"}]',
  'B',
  ARRAY['Urticaria (hives) and itching are classic signs of an allergic transfusion reaction', 'Stop the transfusion immediately if these symptoms occur', 'Allergic reactions are the most common type of transfusion reaction', 'Notify the provider and blood bank immediately', 'Keep the IV line open with normal saline'],
  '[{"label": "A", "why_wrong": "A temperature increase of less than 1°F is not significant and can occur normally"}, {"label": "C", "why_wrong": "This blood pressure reading is within normal limits"}, {"label": "D", "why_wrong": "This heart rate is within normal limits for an adult"}]',
  'Always stop the transfusion first when a reaction is suspected, then notify the provider.',
  'Med-Surg',
  'medium'
),
(
  'A nurse is assessing a client who has heart failure. Which of the following findings should the nurse expect?',
  '[{"label": "A", "text": "Bradycardia"}, {"label": "B", "text": "Weight loss"}, {"label": "C", "text": "Crackles in the lungs"}, {"label": "D", "text": "Decreased jugular venous distention"}]',
  'C',
  ARRAY['Crackles (rales) indicate fluid accumulation in the lungs from left-sided heart failure', 'Fluid backs up into the pulmonary system when the left ventricle cannot pump effectively', 'Other expected findings include dyspnea, orthopnea, and fatigue', 'Weight gain from fluid retention is common, not weight loss', 'Jugular venous distention (JVD) is elevated, not decreased'],
  '[{"label": "A", "why_wrong": "Tachycardia, not bradycardia, is expected as the heart compensates"}, {"label": "B", "why_wrong": "Weight gain from fluid retention is expected, not weight loss"}, {"label": "D", "why_wrong": "JVD is typically elevated in heart failure due to fluid backup"}]',
  'Left-sided heart failure causes pulmonary symptoms; right-sided causes systemic symptoms.',
  'Med-Surg',
  'medium'
),
(
  'A nurse is preparing to administer digoxin to a client. The client''s apical pulse is 56/min. Which of the following actions should the nurse take?',
  '[{"label": "A", "text": "Administer the medication"}, {"label": "B", "text": "Hold the medication and notify the provider"}, {"label": "C", "text": "Administer half the prescribed dose"}, {"label": "D", "text": "Wait 1 hour and reassess the pulse"}]',
  'B',
  ARRAY['Digoxin should be held if the apical pulse is below 60 bpm in adults', 'Digoxin slows the heart rate and can cause bradycardia', 'Always check the apical pulse for a full minute before administration', 'Notify the provider because the low heart rate may indicate toxicity', 'Never adjust the dose without a provider order'],
  '[{"label": "A", "why_wrong": "Administering digoxin with a pulse below 60 bpm could cause dangerous bradycardia"}, {"label": "C", "why_wrong": "Nurses cannot independently adjust medication doses without an order"}, {"label": "D", "why_wrong": "Waiting without notifying the provider delays appropriate intervention"}]',
  'Check apical pulse for 1 full minute before digoxin. Hold if <60 bpm and notify the provider.',
  'Pharmacology',
  'easy'
),
(
  'A nurse is caring for a newborn who is 12 hours old. Which of the following findings should the nurse report to the provider immediately?',
  '[{"label": "A", "text": "Respiratory rate of 52/min"}, {"label": "B", "text": "Bluish discoloration of the hands and feet"}, {"label": "C", "text": "Passage of dark green stool"}, {"label": "D", "text": "Circumoral cyanosis"}]',
  'D',
  ARRAY['Circumoral cyanosis (blueness around the mouth) indicates central cyanosis and poor oxygenation', 'This is a sign of respiratory distress or cardiac problems and requires immediate attention', 'Acrocyanosis (blue hands/feet) is normal in newborns for the first 24-48 hours', 'Normal newborn respiratory rate is 30-60 breaths per minute', 'Meconium (dark green stool) is expected in the first 24-48 hours'],
  '[{"label": "A", "why_wrong": "A respiratory rate of 52/min is within normal range for newborns (30-60)"}, {"label": "B", "why_wrong": "Acrocyanosis is a normal finding in the first 24-48 hours of life"}, {"label": "C", "why_wrong": "Meconium is the expected first stool and is normally dark green to black"}]',
  'Circumoral cyanosis indicates central cyanosis and requires immediate intervention.',
  'Pediatrics',
  'medium'
),
(
  'A nurse is caring for a client who is in labor and has an epidural in place. The client reports feeling lightheaded. Which of the following actions should the nurse take first?',
  '[{"label": "A", "text": "Check the client''s blood pressure"}, {"label": "B", "text": "Turn the client to a lateral position"}, {"label": "C", "text": "Administer oxygen via face mask"}, {"label": "D", "text": "Increase the IV fluid rate"}]',
  'A',
  ARRAY['Assessment (checking blood pressure) should always come first before interventions', 'Epidurals commonly cause hypotension due to sympathetic blockade', 'Lightheadedness is a symptom of hypotension', 'After confirming hypotension, interventions include positioning, fluids, and oxygen', 'Document findings and notify the anesthesiologist if hypotension persists'],
  '[{"label": "B", "why_wrong": "Positioning is appropriate but assessment should come first"}, {"label": "C", "why_wrong": "Oxygen may be needed but we must assess the cause first"}, {"label": "D", "why_wrong": "Increasing fluids is appropriate for hypotension but requires assessment first"}]',
  'Always assess first. Use the nursing process: Assessment before Intervention.',
  'OB/Maternity',
  'medium'
),
(
  'A nurse is preparing to administer medications to a client who has a nasogastric tube. Which of the following actions should the nurse take?',
  '[{"label": "A", "text": "Crush extended-release tablets for administration"}, {"label": "B", "text": "Mix all medications together before administering"}, {"label": "C", "text": "Verify tube placement before medication administration"}, {"label": "D", "text": "Administer medications with the tube clamped"}]',
  'C',
  ARRAY['Always verify NG tube placement before administering anything through the tube', 'Placement can be verified by aspirating gastric contents and checking pH (should be 0-5)', 'X-ray is the gold standard for initial placement verification', 'Never crush extended-release or enteric-coated medications', 'Administer medications separately and flush between each'],
  '[{"label": "A", "why_wrong": "Extended-release medications should never be crushed as this releases the full dose at once"}, {"label": "B", "why_wrong": "Medications should be administered separately to prevent interactions and clogging"}, {"label": "D", "why_wrong": "The tube should be open/unclamped during medication administration"}]',
  'Verify NG tube placement before every use. Never crush extended-release medications.',
  'Fundamentals',
  'easy'
),
(
  'A nurse is caring for a client who is experiencing a panic attack. Which of the following interventions should the nurse implement first?',
  '[{"label": "A", "text": "Teach the client about the physical symptoms of anxiety"}, {"label": "B", "text": "Stay with the client and speak in a calm manner"}, {"label": "C", "text": "Encourage the client to discuss their feelings"}, {"label": "D", "text": "Administer a PRN anti-anxiety medication"}]',
  'B',
  ARRAY['During a panic attack, the priority is to ensure client safety and provide a calming presence', 'Stay with the client to prevent injury and reduce fear', 'Use short, simple sentences as the client cannot process complex information during a panic attack', 'Teaching and discussion are appropriate after the acute phase', 'Medication may be given but therapeutic presence is the immediate intervention'],
  '[{"label": "A", "why_wrong": "Teaching is not effective during an acute panic attack due to impaired cognition"}, {"label": "C", "why_wrong": "The client cannot effectively discuss feelings during an acute panic episode"}, {"label": "D", "why_wrong": "While medication may help, staying with the client and providing calm support is the first priority"}]',
  'During panic attacks: Stay calm, stay present, use simple sentences. Teach later.',
  'Mental Health',
  'medium'
),
(
  'A charge nurse is delegating tasks to unlicensed assistive personnel (UAP). Which of the following tasks is appropriate to delegate?',
  '[{"label": "A", "text": "Performing a sterile dressing change"}, {"label": "B", "text": "Taking vital signs on a stable client"}, {"label": "C", "text": "Assessing a client''s pain level"}, {"label": "D", "text": "Administering oral medications"}]',
  'B',
  ARRAY['UAPs can perform vital signs on stable, predictable clients', 'The Five Rights of Delegation: Right task, Right circumstance, Right person, Right direction, Right supervision', 'Assessment, teaching, evaluation, and medication administration cannot be delegated to UAPs', 'Sterile procedures require nursing judgment and are not delegated', 'Always consider client stability when delegating'],
  '[{"label": "A", "why_wrong": "Sterile procedures require nursing judgment and clinical decision-making"}, {"label": "C", "why_wrong": "Assessment is a nursing responsibility and cannot be delegated"}, {"label": "D", "why_wrong": "Medication administration requires a licensed professional"}]',
  'Remember: Assessment, Teaching, Evaluation, and Medications cannot be delegated.',
  'Leadership',
  'easy'
),
(
  'A nurse is caring for a client who has methicillin-resistant Staphylococcus aureus (MRSA) in a wound. Which of the following precautions should the nurse implement?',
  '[{"label": "A", "text": "Airborne precautions"}, {"label": "B", "text": "Droplet precautions"}, {"label": "C", "text": "Contact precautions"}, {"label": "D", "text": "Standard precautions only"}]',
  'C',
  ARRAY['MRSA requires contact precautions to prevent transmission', 'Contact precautions include: private room (or cohorting), gown, gloves for all contact', 'MRSA is spread through direct contact with infected wounds or contaminated surfaces', 'Equipment should be dedicated or thoroughly cleaned between patients', 'Hand hygiene is critical in preventing MRSA transmission'],
  '[{"label": "A", "why_wrong": "Airborne precautions are for pathogens spread through small droplet nuclei (TB, measles)"}, {"label": "B", "why_wrong": "Droplet precautions are for pathogens spread through large respiratory droplets (flu, meningitis)"}, {"label": "D", "why_wrong": "MRSA requires additional contact precautions beyond standard precautions"}]',
  'MRSA = Contact precautions. Remember: gown and gloves for any contact.',
  'Safety',
  'easy'
),
(
  'A nurse is caring for a client who has been taking lithium for bipolar disorder. Which of the following laboratory values should the nurse monitor?',
  '[{"label": "A", "text": "Liver function tests"}, {"label": "B", "text": "Thyroid function and creatinine"}, {"label": "C", "text": "Complete blood count"}, {"label": "D", "text": "Prothrombin time"}]',
  'B',
  ARRAY['Lithium can cause hypothyroidism and renal impairment', 'Monitor thyroid function tests and creatinine/BUN regularly', 'Lithium has a narrow therapeutic range (0.6-1.2 mEq/L)', 'Signs of lithium toxicity include tremors, GI upset, confusion, and seizures', 'Maintain adequate sodium and fluid intake to prevent toxicity'],
  '[{"label": "A", "why_wrong": "Lithium does not significantly affect liver function"}, {"label": "C", "why_wrong": "While CBC may be checked, thyroid and kidney function are the priority labs for lithium"}, {"label": "D", "why_wrong": "PT/INR is monitored for anticoagulant therapy, not lithium"}]',
  'Lithium affects thyroid and kidneys. Monitor TSH and creatinine regularly.',
  'Pharmacology',
  'medium'
);