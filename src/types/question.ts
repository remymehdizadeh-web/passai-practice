export interface QuestionOption {
  label: string;
  text: string;
}

export interface WrongOptionBullet {
  label: string;
  why_wrong: string;
}

export interface Question {
  id: string;
  stem: string;
  options: QuestionOption[];
  correct_label: string;
  rationale_bullets: string[];
  wrong_option_bullets: WrongOptionBullet[] | null;
  takeaway: string;
  category: string;
  // New category system
  nclex_category: string;
  study_tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  is_active: boolean;
  created_at: string;
}

export interface UserProgress {
  id: string;
  session_id: string;
  question_id: string;
  selected_label: string;
  is_correct: boolean;
  created_at: string;
}

export interface Bookmark {
  id: string;
  session_id: string;
  question_id: string;
  created_at: string;
}

export interface IssueReport {
  id: string;
  question_id: string;
  session_id: string;
  report_type: 'wrong_answer' | 'unclear' | 'typo' | 'not_nclex_style' | 'other';
  description?: string;
  created_at: string;
}
