import { useMemo } from 'react';
import { useQuestions, useUserProgress, useConfidenceTrend } from '@/hooks/useQuestions';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { ShareProgressCard } from '@/components/ShareProgressCard';
import {
  TrendingUp, 
  TrendingDown,
  Target,
  Flame,
  BarChart3,
  Zap,
  BookOpen,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

import { NCLEX_CATEGORIES, NCLEX_SHORT_NAMES, type NclexCategory } from '@/lib/categories';

export function StatsView() {
  const { data: questions } = useQuestions();
  const { data: progress } = useUserProgress();
  const { data: confidenceTrend } = useConfidenceTrend();
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    if (!progress || !questions) {
      return {
        totalAnswered: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0,
        readinessScore: null,
        trend: 'stable' as const,
        categoryMastery: [],
        weakestAreas: [],
        strongestAreas: [],
        accuracyTrend: [],
        streakDays: profile?.streak_days || 0,
        todayCount: 0,
        dailyGoal: profile?.study_goal_daily || 15,
      };
    }

    const totalAnswered = progress.length;
    const correctAnswers = progress.filter(p => p.is_correct).length;
    const incorrectAnswers = totalAnswered - correctAnswers;
    const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

    // Today's progress
    const today = new Date().toISOString().split('T')[0];
    const todayCount = progress.filter(p => p.created_at.split('T')[0] === today).length;

    // Category stats using NCLEX categories
    const nclexCategoryStats: Record<string, { correct: number; total: number }> = {};
    progress.forEach((p) => {
      const q = questions.find((q) => q.id === p.question_id);
      if (q) {
        const nclexCat = q.nclex_category || q.category;
        if (!nclexCategoryStats[nclexCat]) {
          nclexCategoryStats[nclexCat] = { correct: 0, total: 0 };
        }
        nclexCategoryStats[nclexCat].total++;
        if (p.is_correct) nclexCategoryStats[nclexCat].correct++;
      }
    });

    const categoryMastery = NCLEX_CATEGORIES.map(category => {
      const stats = nclexCategoryStats[category];
      return {
        category,
        shortName: NCLEX_SHORT_NAMES[category as NclexCategory] || category.split(' ').slice(0, 2).join(' '),
        accuracy: stats ? Math.round((stats.correct / stats.total) * 100) : 0,
        total: stats?.total || 0,
        correct: stats?.correct || 0,
      };
    }).filter(c => c.total > 0);

    const sortedByAccuracy = [...categoryMastery].sort((a, b) => a.accuracy - b.accuracy);
    const weakestAreas = sortedByAccuracy.slice(0, 3);
    const strongestAreas = sortedByAccuracy.slice(-3).reverse();

    // Trend calculation
    const recentProgress = progress.slice(-20);
    const olderProgress = progress.slice(-40, -20);
    let trend: 'up' | 'down' | 'stable' = 'stable';
    
    if (recentProgress.length >= 10 && olderProgress.length >= 10) {
      const recentAccuracy = recentProgress.filter(p => p.is_correct).length / recentProgress.length;
      const olderAccuracy = olderProgress.filter(p => p.is_correct).length / olderProgress.length;
      const diff = recentAccuracy - olderAccuracy;
      if (diff > 0.05) trend = 'up';
      else if (diff < -0.05) trend = 'down';
    }

    // Readiness score
    let readinessScore: number | null = null;
    if (totalAnswered >= 10) {
      const completionRate = Math.min(100, Math.round((totalAnswered / questions.length) * 100));
      const accuracyWeight = accuracy * 0.75;
      const completionWeight = completionRate * 0.15;
      const streakWeight = Math.min((profile?.streak_days || 0) * 2, 10);
      readinessScore = Math.round(accuracyWeight + completionWeight + streakWeight);
    }

    return {
      totalAnswered,
      correctAnswers,
      incorrectAnswers,
      accuracy,
      readinessScore,
      trend,
      categoryMastery,
      weakestAreas,
      strongestAreas,
      streakDays: profile?.streak_days || 0,
      todayCount,
      dailyGoal: profile?.study_goal_daily || 15,
    };
  }, [questions, progress, profile]);

  if (!user) {
    return (
      <div className="pb-6 flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
          <BarChart3 className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Track Your Progress</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">Sign in to see detailed analytics and track your NCLEX prep journey</p>
        <button 
          onClick={() => navigate('/auth')}
          className="btn-premium px-8 py-3"
        >
          Get Started
        </button>
      </div>
    );
  }

  const goalProgress = Math.min(100, Math.round((stats.todayCount / stats.dailyGoal) * 100));

  return (
    <div className="pb-6 space-y-6">
      {/* Big Score Display */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-accent p-6 text-primary-foreground">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm opacity-80 mb-1">Overall Accuracy</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black">{stats.accuracy}</span>
                <span className="text-2xl font-bold">%</span>
                {stats.trend === 'up' && <TrendingUp className="w-6 h-6 opacity-80" />}
                {stats.trend === 'down' && <TrendingDown className="w-6 h-6 opacity-80" />}
              </div>
            </div>
            {stats.strongestAreas[0] && (
              <ShareProgressCard
                category={stats.strongestAreas[0].category}
                previousAccuracy={Math.max(0, stats.strongestAreas[0].accuracy - 8)}
                currentAccuracy={stats.strongestAreas[0].accuracy}
                questionsCompleted={stats.totalAnswered}
                streakDays={stats.streakDays}
              />
            )}
          </div>
          
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 opacity-70" />
              <span className="text-sm font-medium">{stats.correctAnswers} correct</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 opacity-70" />
              <span className="text-sm font-medium">{stats.incorrectAnswers} wrong</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto mb-2">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-black text-foreground">{stats.streakDays}</p>
          <p className="text-xs text-muted-foreground">day streak</p>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground">{stats.totalAnswered}</p>
          <p className="text-xs text-muted-foreground">questions</p>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <p className="text-2xl font-black text-foreground">{stats.todayCount}</p>
          <p className="text-xs text-muted-foreground">today</p>
        </div>
      </div>

      {/* Daily Goal Progress */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Daily Goal</span>
          </div>
          <span className="text-sm font-bold text-foreground">{stats.todayCount}/{stats.dailyGoal}</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-500",
              goalProgress >= 100 
                ? "bg-gradient-to-r from-success to-emerald-400" 
                : "bg-gradient-to-r from-primary to-accent"
            )}
            style={{ width: `${goalProgress}%` }}
          />
        </div>
        {goalProgress >= 100 && (
          <p className="text-xs text-success mt-2 font-medium">Goal reached!</p>
        )}
      </div>

      {/* Readiness Score */}
      {stats.readinessScore !== null && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black",
              stats.readinessScore >= 70 
                ? "bg-success/10 text-success" 
                : stats.readinessScore >= 50 
                ? "bg-warning/10 text-warning" 
                : "bg-destructive/10 text-destructive"
            )}>
              {stats.readinessScore}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground mb-1">Readiness Score</p>
              <p className="text-sm text-muted-foreground">
                {stats.readinessScore >= 70 
                  ? "You're on track for exam day" 
                  : stats.readinessScore >= 50 
                  ? "Keep practicing to improve" 
                  : "Focus on weak areas"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Weak Areas - Focus Section */}
      {stats.weakestAreas.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning" />
            Focus Areas
          </h2>
          <div className="space-y-2">
            {stats.weakestAreas.map((area, index) => (
              <div 
                key={area.category} 
                className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                  area.accuracy >= 70 ? "bg-success/10 text-success" :
                  area.accuracy >= 50 ? "bg-warning/10 text-warning" : 
                  "bg-destructive/10 text-destructive"
                )}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{area.shortName}</p>
                  <p className="text-xs text-muted-foreground">{area.correct}/{area.total} correct</p>
                </div>
                <div className={cn(
                  "text-lg font-black",
                  area.accuracy >= 70 ? "text-success" :
                  area.accuracy >= 50 ? "text-warning" : "text-destructive"
                )}>
                  {area.accuracy}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strong Areas */}
      {stats.strongestAreas.length > 0 && stats.strongestAreas[0].accuracy > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success" />
            Strengths
          </h2>
          <div className="space-y-2">
            {stats.strongestAreas.slice(0, 2).map((area) => (
              <div 
                key={area.category} 
                className="bg-success/5 border border-success/20 rounded-xl p-4 flex items-center gap-4"
              >
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{area.shortName}</p>
                  <p className="text-xs text-muted-foreground">{area.correct}/{area.total} correct</p>
                </div>
                <div className="text-lg font-black text-success">
                  {area.accuracy}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Categories */}
      {stats.categoryMastery.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">All Categories</h2>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {stats.categoryMastery.map((cat) => (
              <div key={cat.category} className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{cat.shortName}</p>
                </div>
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      cat.accuracy >= 70 ? "bg-success" :
                      cat.accuracy >= 50 ? "bg-warning" : "bg-destructive"
                    )}
                    style={{ width: `${cat.accuracy}%` }}
                  />
                </div>
                <span className={cn(
                  "text-sm font-bold w-10 text-right",
                  cat.accuracy >= 70 ? "text-success" :
                  cat.accuracy >= 50 ? "text-warning" : "text-destructive"
                )}>
                  {cat.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for no data */}
      {stats.totalAnswered === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground mb-1">No data yet</p>
          <p className="text-sm text-muted-foreground">Start practicing to see your stats</p>
        </div>
      )}
    </div>
  );
}
