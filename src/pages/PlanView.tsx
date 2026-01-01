import { useMemo } from 'react';
import { useQuestions, useUserProgress } from '@/hooks/useQuestions';
import { useProfile, calculateDaysUntilExam } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { 
  Target, 
  Clock, 
  Zap, 
  ChevronRight, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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

interface PlanViewProps {
  onNavigate: (tab: 'practice') => void;
}

export function PlanView({ onNavigate }: PlanViewProps) {
  const { data: questions } = useQuestions();
  const { data: progress } = useUserProgress();
  const { data: profile } = useProfile();
  const { user } = useAuth();

  const daysUntilExam = calculateDaysUntilExam(profile?.exam_date || null);
  const dailyGoal = profile?.study_goal_daily || 15;

  const todayProgress = useMemo(() => {
    if (!progress) return 0;
    const today = new Date().toISOString().split('T')[0];
    return progress.filter(p => p.created_at.split('T')[0] === today).length;
  }, [progress]);

  const planData = useMemo(() => {
    if (!questions || !progress) {
      return {
        focusAreas: [],
        questionsToday: dailyGoal,
        estimatedTime: Math.ceil(dailyGoal * 1.5),
        weeklyTarget: dailyGoal * 7,
        weeklyCompleted: 0,
      };
    }

    // Calculate category performance
    const categoryStats: Record<string, { correct: number; total: number }> = {};
    progress.forEach((p) => {
      const q = questions.find((q) => q.id === p.question_id);
      if (q) {
        if (!categoryStats[q.category]) {
          categoryStats[q.category] = { correct: 0, total: 0 };
        }
        categoryStats[q.category].total++;
        if (p.is_correct) categoryStats[q.category].correct++;
      }
    });

    // Get weakest categories (< 70% accuracy or low attempts)
    const focusAreas = NCLEX_CATEGORIES
      .map(category => {
        const stats = categoryStats[category];
        const accuracy = stats ? Math.round((stats.correct / stats.total) * 100) : 0;
        const attempts = stats?.total || 0;
        return { category, accuracy, attempts };
      })
      .filter(c => c.attempts < 5 || c.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    // Calculate weekly progress
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyCompleted = progress.filter(
      p => new Date(p.created_at) >= oneWeekAgo
    ).length;

    return {
      focusAreas,
      questionsToday: Math.max(0, dailyGoal - todayProgress),
      estimatedTime: Math.ceil(Math.max(0, dailyGoal - todayProgress) * 1.5),
      weeklyTarget: dailyGoal * 7,
      weeklyCompleted,
    };
  }, [questions, progress, dailyGoal, todayProgress]);

  const weeklyProgress = Math.min(100, Math.round((planData.weeklyCompleted / planData.weeklyTarget) * 100));

  return (
    <div className="pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Today's Plan</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        {daysUntilExam !== null && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{daysUntilExam}d to exam</span>
          </div>
        )}
      </div>

      {/* Today's Session Card */}
      <div className="card-organic p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {planData.questionsToday > 0 
                  ? `${planData.questionsToday} questions to go`
                  : 'Daily goal complete!'}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>~{planData.estimatedTime} min</span>
              </div>
            </div>
          </div>
          {todayProgress >= dailyGoal && (
            <CheckCircle2 className="w-6 h-6 text-success" />
          )}
        </div>

        {/* Daily progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Today's progress</span>
            <span className="font-medium text-foreground">{todayProgress}/{dailyGoal}</span>
          </div>
          <Progress 
            value={Math.min(100, (todayProgress / dailyGoal) * 100)} 
            className="h-2"
          />
        </div>

        <Button 
          onClick={() => onNavigate('practice')} 
          className="w-full btn-premium"
          disabled={planData.questionsToday === 0}
        >
          <Zap className="w-4 h-4 mr-2" />
          {planData.questionsToday > 0 ? 'Start Session' : 'Done for Today'}
        </Button>
      </div>

      {/* Focus Areas */}
      {planData.focusAreas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h2 className="font-semibold text-foreground">Focus Areas</h2>
          </div>
          <div className="space-y-2">
            {planData.focusAreas.map((area) => (
              <div 
                key={area.category}
                className="card-organic p-4 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{area.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {area.attempts === 0 
                      ? 'Not started' 
                      : `${area.accuracy}% accuracy · ${area.attempts} attempted`}
                  </p>
                </div>
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold",
                  area.accuracy >= 70 ? "bg-success/10 text-success" :
                  area.accuracy >= 50 ? "bg-warning/10 text-warning" :
                  "bg-destructive/10 text-destructive"
                )}>
                  {area.attempts === 0 ? '–' : `${area.accuracy}%`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Progress */}
      <div className="card-organic p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-foreground">This Week</h2>
        </div>
        
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-2xl font-bold text-foreground">{planData.weeklyCompleted}</p>
            <p className="text-sm text-muted-foreground">of {planData.weeklyTarget} questions</p>
          </div>
          <p className={cn(
            "text-sm font-medium",
            weeklyProgress >= 80 ? "text-success" :
            weeklyProgress >= 50 ? "text-warning" :
            "text-muted-foreground"
          )}>
            {weeklyProgress}% complete
          </p>
        </div>
        
        <Progress value={weeklyProgress} className="h-2" />
      </div>

      {/* Intensity Option */}
      {user && daysUntilExam !== null && daysUntilExam <= 14 && (
        <button className="w-full card-organic p-4 flex items-center gap-4 border-2 border-primary/20 hover:border-primary/40 transition-all">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-foreground">Intensify Mode</p>
            <p className="text-xs text-muted-foreground">Double your daily goal for final push</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}