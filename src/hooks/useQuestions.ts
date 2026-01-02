import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getSessionSupabase } from '@/lib/supabaseWithSession';
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
    nclex_category: raw.nclex_category || raw.category,
    study_tags: raw.study_tags || [],
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
  const sessionSupabase = getSessionSupabase();
  
  return useQuery({
    queryKey: ['bookmarks', sessionId],
    queryFn: async () => {
      const { data, error } = await sessionSupabase
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
  const sessionSupabase = getSessionSupabase();

  return useMutation({
    mutationFn: async ({ questionId, isBookmarked }: { questionId: string; isBookmarked: boolean }) => {
      if (isBookmarked) {
        const { error } = await sessionSupabase
          .from('bookmarks')
          .delete()
          .eq('session_id', sessionId)
          .eq('question_id', questionId);
        if (error) throw error;
      } else {
        const { error } = await sessionSupabase
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
  const sessionSupabase = getSessionSupabase();

  return useQuery({
    queryKey: ['progress', sessionId],
    queryFn: async () => {
      const { data, error } = await sessionSupabase
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
  const sessionSupabase = getSessionSupabase();

  return useMutation({
    mutationFn: async ({ 
      questionId, 
      selectedLabel, 
      isCorrect,
      confidence 
    }: { 
      questionId: string; 
      selectedLabel: string; 
      isCorrect: boolean;
      confidence?: 'low' | 'medium' | 'high' | null;
    }) => {
      // Record progress
      const { error } = await sessionSupabase
        .from('user_progress')
        .insert({
          session_id: sessionId,
          question_id: questionId,
          selected_label: selectedLabel,
          is_correct: isCorrect,
          confidence: confidence || null,
        });
      if (error) throw error;

      // Add to review queue if incorrect or low confidence
      if (!isCorrect || confidence === 'low') {
        const reason = !isCorrect ? 'incorrect' : 'low_confidence';
        const { error: queueError } = await sessionSupabase
          .from('review_queue')
          .upsert({
            session_id: sessionId,
            question_id: questionId,
            reason,
            due_at: new Date().toISOString(),
            interval_days: 1,
            review_count: 0,
          }, { onConflict: 'session_id,question_id' });
        
        if (queueError) console.error('Error adding to review queue:', queueError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['review-queue', sessionId] });
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
  const sessionSupabase = getSessionSupabase();

  return useQuery({
    queryKey: ['missed-questions', sessionId],
    queryFn: async () => {
      const { data: progress, error: progressError } = await sessionSupabase
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

// Review Queue Hooks
export interface ReviewQueueItem {
  id: string;
  session_id: string;
  question_id: string;
  due_at: string;
  reason: 'incorrect' | 'low_confidence' | 'spaced_repetition' | 'bookmarked';
  interval_days: number;
  ease_factor: number;
  review_count: number;
  question?: Question;
}

export function useReviewQueue() {
  const sessionId = getSessionId();
  const sessionSupabase = getSessionSupabase();

  return useQuery({
    queryKey: ['review-queue', sessionId],
    queryFn: async () => {
      const { data, error } = await sessionSupabase
        .from('review_queue')
        .select('*, questions(*)')
        .eq('session_id', sessionId)
        .lte('due_at', new Date().toISOString())
        .order('due_at', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        question: item.questions ? parseQuestion(item.questions) : undefined,
      })) as ReviewQueueItem[];
    },
  });
}

export function useUpdateReviewQueue() {
  const queryClient = useQueryClient();
  const sessionId = getSessionId();
  const sessionSupabase = getSessionSupabase();

  return useMutation({
    mutationFn: async ({ 
      questionId, 
      isCorrect,
      confidence 
    }: { 
      questionId: string; 
      isCorrect: boolean;
      confidence?: 'low' | 'medium' | 'high' | null;
    }) => {
      // Get current queue item
      const { data: queueItem } = await sessionSupabase
        .from('review_queue')
        .select('*')
        .eq('session_id', sessionId)
        .eq('question_id', questionId)
        .single();

      if (!queueItem) return;

      // SM-2 algorithm simplified
      let newEaseFactor = queueItem.ease_factor || 2.5;
      let newInterval = queueItem.interval_days || 1;

      if (isCorrect && confidence !== 'low') {
        // Increase interval based on ease factor
        if (queueItem.review_count === 0) {
          newInterval = 1;
        } else if (queueItem.review_count === 1) {
          newInterval = 6;
        } else {
          newInterval = Math.round(queueItem.interval_days * newEaseFactor);
        }

        // Adjust ease factor based on confidence
        if (confidence === 'high') {
          newEaseFactor = Math.min(3.0, newEaseFactor + 0.1);
        } else if (confidence === 'medium') {
          // Keep ease factor the same
        }
      } else {
        // Reset on incorrect or low confidence
        newInterval = 1;
        newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
      }

      const dueAt = new Date();
      dueAt.setDate(dueAt.getDate() + newInterval);

      const { error } = await sessionSupabase
        .from('review_queue')
        .update({
          due_at: dueAt.toISOString(),
          interval_days: newInterval,
          ease_factor: newEaseFactor,
          review_count: queueItem.review_count + 1,
        })
        .eq('id', queueItem.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-queue', sessionId] });
    },
  });
}

// Confidence trend hook
export function useConfidenceTrend() {
  const sessionId = getSessionId();
  const sessionSupabase = getSessionSupabase();

  return useQuery({
    queryKey: ['confidence-trend', sessionId],
    queryFn: async () => {
      const { data, error } = await sessionSupabase
        .from('user_progress')
        .select('confidence, created_at, is_correct')
        .eq('session_id', sessionId)
        .not('confidence', 'is', null)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Calculate confidence score over time
      const confidenceMap = { low: 1, medium: 2, high: 3 };
      const trend = (data || []).map(item => ({
        date: item.created_at,
        score: confidenceMap[item.confidence as keyof typeof confidenceMap] || 0,
        isCorrect: item.is_correct,
      }));
      
      // Calculate average confidence for last 10 vs previous 10
      const recent = trend.slice(-10);
      const older = trend.slice(-20, -10);
      
      const recentAvg = recent.length > 0 
        ? recent.reduce((sum, t) => sum + t.score, 0) / recent.length 
        : 0;
      const olderAvg = older.length > 0 
        ? older.reduce((sum, t) => sum + t.score, 0) / older.length 
        : 0;
      
      return {
        trend,
        recentAverage: recentAvg,
        olderAverage: olderAvg,
        isImproving: recentAvg > olderAvg + 0.1,
        totalWithConfidence: trend.length,
      };
    },
  });
}
