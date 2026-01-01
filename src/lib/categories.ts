// Official NCLEX Client Needs Categories (used for analytics, scoring, adaptive logic)
export const NCLEX_CATEGORIES = [
  'Management of Care',
  'Safety and Infection Control',
  'Health Promotion and Maintenance',
  'Psychosocial Integrity',
  'Basic Care and Comfort',
  'Pharmacological and Parenteral Therapies',
  'Reduction of Risk Potential',
  'Physiological Adaptation',
] as const;

export type NclexCategory = typeof NCLEX_CATEGORIES[number];

// User-facing study sections (used for navigation and filtering)
export const STUDY_SECTIONS = [
  'Fundamentals',
  'Med-Surg',
  'Pharmacology',
  'Pediatrics',
  'Maternal & Newborn',
  'Mental Health',
  'Leadership & Prioritization',
  'Mixed / Exam Mode',
] as const;

export type StudySection = typeof STUDY_SECTIONS[number];

// Mapping: Study Section -> NCLEX Categories it covers
export const STUDY_SECTION_TO_NCLEX: Record<StudySection, NclexCategory[]> = {
  'Fundamentals': [
    'Basic Care and Comfort',
    'Safety and Infection Control',
    'Health Promotion and Maintenance',
  ],
  'Med-Surg': [
    'Physiological Adaptation',
    'Reduction of Risk Potential',
    'Basic Care and Comfort',
  ],
  'Pharmacology': [
    'Pharmacological and Parenteral Therapies',
  ],
  'Pediatrics': [
    'Physiological Adaptation',
    'Health Promotion and Maintenance',
    'Psychosocial Integrity',
  ],
  'Maternal & Newborn': [
    'Health Promotion and Maintenance',
    'Physiological Adaptation',
    'Reduction of Risk Potential',
  ],
  'Mental Health': [
    'Psychosocial Integrity',
  ],
  'Leadership & Prioritization': [
    'Management of Care',
    'Safety and Infection Control',
  ],
  'Mixed / Exam Mode': NCLEX_CATEGORIES as unknown as NclexCategory[],
};

// Reverse mapping: NCLEX Category -> Primary Study Section
export const NCLEX_TO_PRIMARY_STUDY_SECTION: Record<NclexCategory, StudySection> = {
  'Management of Care': 'Leadership & Prioritization',
  'Safety and Infection Control': 'Fundamentals',
  'Health Promotion and Maintenance': 'Fundamentals',
  'Psychosocial Integrity': 'Mental Health',
  'Basic Care and Comfort': 'Fundamentals',
  'Pharmacological and Parenteral Therapies': 'Pharmacology',
  'Reduction of Risk Potential': 'Med-Surg',
  'Physiological Adaptation': 'Med-Surg',
};

// Short display names for NCLEX categories (for compact UI)
export const NCLEX_SHORT_NAMES: Record<NclexCategory, string> = {
  'Management of Care': 'Management',
  'Safety and Infection Control': 'Safety',
  'Health Promotion and Maintenance': 'Health Promo',
  'Psychosocial Integrity': 'Psychosocial',
  'Basic Care and Comfort': 'Basic Care',
  'Pharmacological and Parenteral Therapies': 'Pharm',
  'Reduction of Risk Potential': 'Risk Reduction',
  'Physiological Adaptation': 'Physio Adapt',
};

// Icons/emojis for study sections (for friendly UI)
export const STUDY_SECTION_ICONS: Record<StudySection, string> = {
  'Fundamentals': '📚',
  'Med-Surg': '🏥',
  'Pharmacology': '💊',
  'Pediatrics': '👶',
  'Maternal & Newborn': '🤱',
  'Mental Health': '🧠',
  'Leadership & Prioritization': '👥',
  'Mixed / Exam Mode': '🎯',
};

// Helper to get study section display color
export function getStudySectionColor(section: StudySection): string {
  const colors: Record<StudySection, string> = {
    'Fundamentals': 'bg-blue-500/10 text-blue-500',
    'Med-Surg': 'bg-emerald-500/10 text-emerald-500',
    'Pharmacology': 'bg-purple-500/10 text-purple-500',
    'Pediatrics': 'bg-pink-500/10 text-pink-500',
    'Maternal & Newborn': 'bg-rose-500/10 text-rose-500',
    'Mental Health': 'bg-indigo-500/10 text-indigo-500',
    'Leadership & Prioritization': 'bg-amber-500/10 text-amber-500',
    'Mixed / Exam Mode': 'bg-primary/10 text-primary',
  };
  return colors[section];
}
