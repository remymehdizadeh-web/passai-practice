import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// NCLEX Categories mapping
const NCLEX_CATEGORIES = [
  'Management of Care',
  'Safety and Infection Control',
  'Health Promotion and Maintenance',
  'Psychosocial Integrity',
  'Basic Care and Comfort',
  'Pharmacological and Parenteral Therapies',
  'Reduction of Risk Potential',
  'Physiological Adaptation',
];

const NCLEX_TO_STUDY_TAGS: Record<string, string[]> = {
  'Management of Care': ['Leadership & Prioritization'],
  'Safety and Infection Control': ['Fundamentals'],
  'Health Promotion and Maintenance': ['Fundamentals'],
  'Psychosocial Integrity': ['Mental Health'],
  'Basic Care and Comfort': ['Fundamentals'],
  'Pharmacological and Parenteral Therapies': ['Pharmacology'],
  'Reduction of Risk Potential': ['Med-Surg'],
  'Physiological Adaptation': ['Med-Surg'],
};

// Category-specific topics for varied question generation
const CATEGORY_TOPICS: Record<string, string[]> = {
  'Management of Care': [
    'delegation and supervision', 'prioritization of care', 'ethical practice', 
    'legal rights and responsibilities', 'advance directives', 'informed consent',
    'confidentiality', 'advocacy', 'case management', 'continuity of care',
    'collaboration with interdisciplinary team', 'referrals', 'resource management'
  ],
  'Safety and Infection Control': [
    'standard precautions', 'transmission-based precautions', 'surgical asepsis',
    'medical asepsis', 'safe medication administration', 'fall prevention',
    'restraint use', 'fire safety', 'disaster planning', 'security protocols',
    'handling hazardous materials', 'sharps safety', 'infection control measures'
  ],
  'Health Promotion and Maintenance': [
    'health screening', 'immunizations', 'lifestyle choices', 'disease prevention',
    'growth and development', 'aging process', 'self-care', 'high-risk behaviors',
    'prenatal care', 'newborn care', 'family planning', 'health teaching techniques'
  ],
  'Psychosocial Integrity': [
    'coping mechanisms', 'grief and loss', 'crisis intervention', 'mental health concepts',
    'therapeutic communication', 'abuse and neglect', 'stress management',
    'substance use disorders', 'behavioral interventions', 'support systems',
    'cultural awareness', 'end-of-life care', 'family dynamics'
  ],
  'Basic Care and Comfort': [
    'nutrition and oral hydration', 'elimination', 'mobility and immobility',
    'personal hygiene', 'rest and sleep', 'non-pharmacological comfort',
    'palliative care', 'assistive devices', 'positioning', 'skin integrity'
  ],
  'Pharmacological and Parenteral Therapies': [
    'medication administration', 'adverse effects', 'contraindications',
    'drug interactions', 'dosage calculations', 'IV therapy', 'blood products',
    'central venous access', 'TPN', 'pharmacokinetics', 'controlled substances',
    'pain management medications', 'anticoagulants', 'insulins', 'cardiac medications'
  ],
  'Reduction of Risk Potential': [
    'diagnostic tests', 'lab values interpretation', 'potential complications',
    'therapeutic procedures', 'vital signs monitoring', 'system-specific assessments',
    'changes in condition', 'surgical procedures', 'anesthesia complications'
  ],
  'Physiological Adaptation': [
    'fluid and electrolyte imbalances', 'alterations in body systems',
    'hemodynamics', 'illness management', 'medical emergencies', 'pathophysiology',
    'respiratory emergencies', 'cardiac emergencies', 'neurological emergencies',
    'shock management', 'sepsis', 'DKA', 'unexpected responses to therapies'
  ],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nclex_category, count = 5, difficulty = 'medium' } = await req.json();
    
    console.log(`Generating ${count} questions for category: ${nclex_category}, difficulty: ${difficulty}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Validate category
    if (!NCLEX_CATEGORIES.includes(nclex_category)) {
      throw new Error(`Invalid NCLEX category: ${nclex_category}`);
    }

    const topics = CATEGORY_TOPICS[nclex_category] || [];
    const selectedTopics = topics.sort(() => Math.random() - 0.5).slice(0, 5).join(', ');
    const studyTags = NCLEX_TO_STUDY_TAGS[nclex_category] || ['Mixed / Exam Mode'];

    const systemPrompt = `You are an expert NCLEX-RN question writer with deep knowledge of nursing education and exam design. Create high-quality, clinically accurate NCLEX-style questions that test critical thinking and clinical judgment.

STRICT REQUIREMENTS:
1. Each question MUST follow NCLEX format with a clinical scenario stem
2. Each question MUST have exactly 4 answer options (A, B, C, D)
3. Only ONE answer can be correct
4. Questions should test application and analysis, not simple recall
5. Include realistic patient scenarios with vital signs, lab values, or clinical findings when appropriate
6. Rationales must explain WHY the correct answer is right AND why each wrong answer is incorrect
7. The takeaway should be a memorable clinical pearl

DIFFICULTY LEVELS:
- easy: Straightforward application, common scenarios
- medium: Requires synthesizing multiple pieces of information
- hard: Complex scenarios, multiple comorbidities, requires prioritization

OUTPUT FORMAT: Return a valid JSON array with this exact structure:
[
  {
    "stem": "Clinical scenario question ending with a clear question?",
    "options": [
      { "label": "A", "text": "First option" },
      { "label": "B", "text": "Second option" },
      { "label": "C", "text": "Third option" },
      { "label": "D", "text": "Fourth option" }
    ],
    "correct_label": "B",
    "rationale_bullets": [
      "Explanation of why correct answer is right",
      "Key clinical reasoning point"
    ],
    "wrong_option_bullets": [
      { "label": "A", "why_wrong": "Reason A is incorrect" },
      { "label": "C", "why_wrong": "Reason C is incorrect" },
      { "label": "D", "why_wrong": "Reason D is incorrect" }
    ],
    "takeaway": "One-sentence clinical pearl to remember"
  }
]`;

    const userPrompt = `Generate exactly ${count} unique NCLEX-RN questions for the category "${nclex_category}".

Focus on these specific topics: ${selectedTopics}

Difficulty level: ${difficulty}

Requirements:
- Each question must be unique and test different concepts
- Use realistic clinical scenarios
- Vary the correct answer positions (don't make them all B or C)
- Include specific details like vital signs, medications, or lab values where appropriate
- Make distractors plausible but clearly distinguishable from the correct answer

Return ONLY a valid JSON array, no additional text.`;

    console.log('Calling Lovable AI...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'API credits exhausted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from AI');
    }

    console.log('AI response received, parsing...');

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    let questions;
    try {
      questions = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content:', content.substring(0, 500));
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!Array.isArray(questions)) {
      questions = [questions];
    }

    // Validate and format questions
    const formattedQuestions = questions.map((q: any, index: number) => {
      if (!q.stem || !q.options || !q.correct_label) {
        console.warn(`Question ${index} missing required fields, skipping`);
        return null;
      }

      return {
        stem: q.stem,
        options: q.options,
        correct_label: q.correct_label,
        rationale_bullets: q.rationale_bullets || [],
        wrong_option_bullets: q.wrong_option_bullets || null,
        takeaway: q.takeaway || '',
        category: nclex_category, // Legacy field
        nclex_category: nclex_category,
        study_tags: studyTags,
        difficulty: difficulty,
        exam_type: 'Both',
        is_active: true,
      };
    }).filter(Boolean);

    if (formattedQuestions.length === 0) {
      throw new Error('No valid questions generated');
    }

    // Insert into database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Inserting ${formattedQuestions.length} questions into database...`);

    const { data, error } = await supabase
      .from('questions')
      .insert(formattedQuestions)
      .select('id');

    if (error) {
      console.error('Database insert error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Successfully inserted ${data?.length || 0} questions`);

    return new Response(JSON.stringify({ 
      success: true, 
      count: data?.length || 0,
      category: nclex_category,
      message: `Generated ${data?.length || 0} questions for ${nclex_category}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-questions:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
