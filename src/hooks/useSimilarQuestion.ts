import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Question } from '@/types/question';
import { toast } from 'sonner';

interface GeneratedQuestion {
  id: string;
  stem: string;
  options: { label: string; text: string }[];
  correct_label: string;
  explanation: string;
  key_concept: string;
  category: string;
  difficulty: string;
  is_generated: boolean;
  original_question_id: string;
}

export function useSimilarQuestion() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState<GeneratedQuestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSimilar = async (question: Question) => {
    setIsLoading(true);
    setError(null);
    setGeneratedQuestion(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-similar', {
        body: { question }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        if (data.error.includes('Rate limit')) {
          toast.error('Rate limit reached. Please try again later.');
        } else if (data.error.includes('credits')) {
          toast.error('AI credits needed. Please add credits to continue.');
        } else {
          toast.error('Failed to generate question');
        }
        setError(data.error);
        return null;
      }

      setGeneratedQuestion(data.question);
      return data.question;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate question';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setGeneratedQuestion(null);
    setError(null);
  };

  return {
    isLoading,
    generatedQuestion,
    error,
    generateSimilar,
    reset,
  };
}
