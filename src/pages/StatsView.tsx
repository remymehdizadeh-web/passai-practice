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
    <div className="pb-4 space-y-3">
      {/* Hero Row: Accuracy + Readiness side by side */}
      <div className="grid grid-cols-5 gap-3">
        {/* Main Accuracy */}
        <div className="col-span-3 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent p-4 text-primary-foreground">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
          <p className="text-xs opacity-80 mb-0.5">Accuracy</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black">{stats.accuracy}</span>
            <span className="text-lg font-bold">%</span>
            {stats.trend === 'up' && <TrendingUp className="w-4 h-4 ml-1 opacity-80" />}
            {stats.trend === 'down' && <TrendingDown className="w-4 h-4 ml-1 opacity-80" />}
          </div>
          <div className="flex gap-3 mt-2 text-xs opacity-90">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />{stats.correctAnswers}
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="w-3 h-3" />{stats.incorrectAnswers}
            </span>
          </div>
        </div>

        {/* Readiness Score */}
        <div className="col-span-2 bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center">
          {stats.readinessScore !== null ? (
            <>
              <div className={cn(
                "text-3xl font-black",
                stats.readinessScore >= 70 ? "text-success" : 
                stats.readinessScore >= 50 ? "text-warning" : "text-destructive"
              )}>
                {stats.readinessScore}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-1">Readiness</p>
            </>
          ) : (
            <>
              <span className="text-2xl font-black text-muted-foreground">--</span>
              <p className="text-xs text-muted-foreground text-center mt-1">10+ for score</p>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats + Daily Goal Row */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
          <p className="text-lg font-black text-foreground">{stats.streakDays}</p>
          <p className="text-[10px] text-muted-foreground">streak</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <Target className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-black text-foreground">{stats.totalAnswered}</p>
          <p className="text-[10px] text-muted-foreground">total</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <Zap className="w-4 h-4 text-accent mx-auto mb-1" />
          <p className="text-lg font-black text-foreground">{stats.todayCount}</p>
          <p className="text-[10px] text-muted-foreground">today</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center relative overflow-hidden">
          <BookOpen className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-lg font-black text-foreground">{goalProgress}%</p>
          <p className="text-[10px] text-muted-foreground">goal</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div 
              className={cn(
                "h-full",
                goalProgress >= 100 ? "bg-success" : "bg-primary"
              )}
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Focus + Strengths in 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        {/* Focus Areas */}
        <div className="bg-card border border-border rounded-2xl p-3">
          <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-warning" />
            Focus Areas
          </h3>
          {stats.weakestAreas.length > 0 ? (
            <div className="space-y-2">
              {stats.weakestAreas.slice(0, 3).map((area) => (
                <div key={area.category} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-foreground truncate flex-1">{area.shortName}</span>
                  <span className={cn(
                    "text-xs font-bold shrink-0",
                    area.accuracy >= 70 ? "text-success" :
                    area.accuracy >= 50 ? "text-warning" : "text-destructive"
                  )}>
                    {area.accuracy}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No data yet</p>
          )}
        </div>

        {/* Strengths */}
        <div className="bg-card border border-border rounded-2xl p-3">
          <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Strengths
          </h3>
          {stats.strongestAreas.length > 0 && stats.strongestAreas[0].accuracy > 0 ? (
            <div className="space-y-2">
              {stats.strongestAreas.slice(0, 3).map((area) => (
                <div key={area.category} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-foreground truncate flex-1">{area.shortName}</span>
                  <span className="text-xs font-bold text-success shrink-0">
                    {area.accuracy}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Keep practicing</p>
          )}
        </div>
      </div>

      {/* All Categories - Compact Grid */}
      {stats.categoryMastery.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-foreground">All Categories</h3>
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
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {stats.categoryMastery.map((cat) => (
              <div key={cat.category} className="flex items-center gap-2">
                <div className="flex-1 min-w-0 flex items-center gap-1.5">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    cat.accuracy >= 70 ? "bg-success" :
                    cat.accuracy >= 50 ? "bg-warning" : "bg-destructive"
                  )} />
                  <span className="text-xs text-foreground truncate">{cat.shortName}</span>
                </div>
                <span className={cn(
                  "text-xs font-bold shrink-0",
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

      {/* Empty state */}
      {stats.totalAnswered === 0 && (
        <div className="text-center py-6">
          <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">No data yet</p>
          <p className="text-xs text-muted-foreground">Start practicing to see stats</p>
        </div>
      )}
    </div>
  );
}
