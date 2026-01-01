import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getSessionId } from '@/lib/session';

interface LeaderboardEntry {
  rank: number;
  name: string;
  accuracy: number;
  questionsCompleted: number;
  isCurrentUser?: boolean;
}

// Generate simulated leaderboard with current user's real data
export function useLeaderboard() {
  const sessionId = getSessionId();

  return useQuery({
    queryKey: ['leaderboard', sessionId],
    queryFn: async () => {
      // Get current user's progress
      const { data: userProgress, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('session_id', sessionId);

      if (error) throw error;

      const userQuestionsCompleted = userProgress?.length || 0;
      const userCorrect = userProgress?.filter(p => p.is_correct).length || 0;
      const userAccuracy = userQuestionsCompleted > 0 
        ? Math.round((userCorrect / userQuestionsCompleted) * 100) 
        : 0;

      // Generate realistic simulated competitors
      const simulatedNames = [
        'NursingPro', 'StudyNinja', 'RN2Be', 'MedStudent', 'CareGiver',
        'NurseLife', 'HealthHero', 'ClinicalAce', 'PatientFirst', 'NCLEXChamp',
        'FutureRN', 'MedMaster', 'NurseInTraining', 'HealthSeeker', 'CareExpert'
      ];

      const entries: LeaderboardEntry[] = [];
      
      // Generate entries with varied performance
      simulatedNames.forEach((name, i) => {
        const baseAccuracy = 95 - (i * 4) + Math.floor(Math.random() * 5);
        const accuracy = Math.max(45, Math.min(98, baseAccuracy));
        const questionsCompleted = 50 + Math.floor(Math.random() * 150);
        
        entries.push({
          rank: 0,
          name,
          accuracy,
          questionsCompleted,
          isCurrentUser: false,
        });
      });

      // Add current user
      entries.push({
        rank: 0,
        name: 'You',
        accuracy: userAccuracy,
        questionsCompleted: userQuestionsCompleted,
        isCurrentUser: true,
      });

      // Sort by accuracy, then by questions completed
      entries.sort((a, b) => {
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        return b.questionsCompleted - a.questionsCompleted;
      });

      // Assign ranks
      entries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      const currentUserEntry = entries.find(e => e.isCurrentUser);
      const currentUserRank = currentUserEntry?.rank || entries.length;

      return {
        entries: entries.slice(0, 10), // Top 10
        currentUserRank,
        totalUsers: entries.length,
        currentUserEntry,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
