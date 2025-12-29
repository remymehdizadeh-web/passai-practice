import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getSessionId } from '@/lib/session';
import type { Question, QuestionOption, WrongOptionBullet } from '@/types/question';

// Helper function to parse question from database
function parseQuestion(raw: any): Question {
  return {
    id: raw.id,
    stem: raw.stem,
    options: (typeof raw.options === 'string' ? JSON.parse(raw.options) : raw.options) as QuestionOption[],
    correct_label: raw.correct_label,
    rationale_bullets: raw.rationale_bullets || [],
    wrong_option_bullets: raw.wrong_option_bullets as WrongOptionBullet[] | null,
    takeaway: raw.takeaway,
    category: raw.category,
    difficulty: raw.difficulty,
    is_active: raw.is_active,
    created_at: raw.created_at,
  };
}

export function useQuestions() {
  return useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      // Filter for RN or Both questions only
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .or('exam_type.eq.RN,exam_type.eq.Both')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return (data || []).map(parseQuestion);
    },
  });
}

export function useBookmarks() {
  const sessionId = getSessionId();
  
  return useQuery({
    queryKey: ['bookmarks', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*, questions(*)')
        .eq('session_id', sessionId);
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  return useMutation({
    mutationFn: async ({ questionId, isBookmarked }: { questionId: string; isBookmarked: boolean }) => {
      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('session_id', sessionId)
          .eq('question_id', questionId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({ session_id: sessionId, question_id: questionId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', sessionId] });
    },
  });
}

export function useUserProgress() {
  const sessionId = getSessionId();

  return useQuery({
    queryKey: ['progress', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('session_id', sessionId);
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function useRecordProgress() {
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  return useMutation({
    mutationFn: async ({ questionId, selectedLabel, isCorrect }: { 
      questionId: string; 
      selectedLabel: string; 
      isCorrect: boolean 
    }) => {
      const { error } = await supabase
        .from('user_progress')
        .insert({
          session_id: sessionId,
          question_id: questionId,
          selected_label: selectedLabel,
          is_correct: isCorrect,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', sessionId] });
    },
  });
}

export function useReportIssue() {
  const sessionId = getSessionId();

  return useMutation({
    mutationFn: async ({ 
      questionId, 
      reportType, 
      description 
    }: { 
      questionId: string; 
      reportType: string; 
      description?: string;
    }) => {
      const { error } = await supabase
        .from('issue_reports')
        .insert({
          session_id: sessionId,
          question_id: questionId,
          report_type: reportType,
          description,
        });
      if (error) throw error;
    },
  });
}

export function useMissedQuestions() {
  const sessionId = getSessionId();

  return useQuery({
    queryKey: ['missed-questions', sessionId],
    queryFn: async () => {
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('question_id')
        .eq('session_id', sessionId)
        .eq('is_correct', false);
      
      if (progressError) throw progressError;
      
      const missedIds = [...new Set((progress || []).map(p => p.question_id))];
      
      if (missedIds.length === 0) return [];

      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .in('id', missedIds);
      
      if (questionsError) throw questionsError;
      return (questions || []).map(parseQuestion);
    },
  });
}
