import { useMemo } from 'react';
import { useQuestions, useUserProgress, useMissedQuestions, useConfidenceTrend } from '@/hooks/useQuestions';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { ShareProgressCard } from '@/components/ShareProgressCard';
import {
  TrendingUp, 
  TrendingDown,
  Target,
  Clock,
  Flame,
  Award,
  BarChart3,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { NCLEX_CATEGORIES, NCLEX_SHORT_NAMES, type NclexCategory } from '@/lib/categories';

export function StatsView() {
  const { data: questions } = useQuestions();
  const { data: progress } = useUserProgress();
  const { data: missedQuestions } = useMissedQuestions();
  const { data: confidenceTrend } = useConfidenceTrend();
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    if (!progress || !questions) {
      return {
        totalAnswered: 0,
        correctAnswers: 0,
        accuracy: 0,
        readinessScore: null,
        trend: 'stable' as const,
        categoryMastery: [],
        weakestAreas: [],
        strongestAreas: [],
        accuracyTrend: [],
        avgTimePerQuestion: 0,
        difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
        streakDays: profile?.streak_days || 0,
      };
    }

    const totalAnswered = progress.length;
    const correctAnswers = progress.filter(p => p.is_correct).length;
    const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

    // Category stats using NCLEX categories for analytics
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

    // Accuracy trend (last 7 days)
    const days = 7;
    const accuracyTrend = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayProgress = progress.filter(p => p.created_at.split('T')[0] === dateStr);
      const dayCorrect = dayProgress.filter(p => p.is_correct).length;
      const dayAccuracy = dayProgress.length > 0 ? Math.round((dayCorrect / dayProgress.length) * 100) : null;
      accuracyTrend.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        accuracy: dayAccuracy,
        count: dayProgress.length,
      });
    }

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

    // Difficulty breakdown
    const difficultyBreakdown = { easy: 0, medium: 0, hard: 0 };
    const difficultyCorrect = { easy: 0, medium: 0, hard: 0 };
    progress.forEach((p) => {
      const q = questions.find((q) => q.id === p.question_id);
      if (q) {
        const diff = q.difficulty as 'easy' | 'medium' | 'hard';
        difficultyBreakdown[diff]++;
        if (p.is_correct) difficultyCorrect[diff]++;
      }
    });

    const difficultyAccuracy = {
      easy: difficultyBreakdown.easy > 0 ? Math.round((difficultyCorrect.easy / difficultyBreakdown.easy) * 100) : 0,
      medium: difficultyBreakdown.medium > 0 ? Math.round((difficultyCorrect.medium / difficultyBreakdown.medium) * 100) : 0,
      hard: difficultyBreakdown.hard > 0 ? Math.round((difficultyCorrect.hard / difficultyBreakdown.hard) * 100) : 0,
    };

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
      accuracy,
      readinessScore,
      trend,
      categoryMastery,
      weakestAreas,
      strongestAreas,
      accuracyTrend,
      avgTimePerQuestion: 1.5, // placeholder - would need timing data
      difficultyBreakdown,
      difficultyAccuracy,
      streakDays: profile?.streak_days || 0,
    };
  }, [questions, progress, profile]);

  if (!user) {
    return (
      <div className="pb-6 flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Sign in to see your stats</h2>
        <p className="text-sm text-muted-foreground mb-4">Track your progress and see detailed analytics</p>
        <button 
          onClick={() => navigate('/auth')}
          className="btn-premium px-6 py-3"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="pb-6 space-y-5">
      {/* Header with Share */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Statistics</h1>
          <p className="text-sm text-muted-foreground">Your performance analytics</p>
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

      {/* Confidence Trend */}
      {confidenceTrend && confidenceTrend.totalWithConfidence >= 5 && (
        <div className="card-organic p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {confidenceTrend.isImproving ? '📈' : '📊'}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {confidenceTrend.isImproving 
                    ? 'Confidence is improving!' 
                    : 'Building confidence...'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Based on your recent {confidenceTrend.totalWithConfidence} answers
                </p>
              </div>
            </div>
            <div className={cn(
              "text-sm font-bold px-2 py-1 rounded-lg",
              confidenceTrend.isImproving ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
            )}>
              {confidenceTrend.recentAverage >= 2.5 ? 'High' : 
               confidenceTrend.recentAverage >= 1.5 ? 'Medium' : 'Building'}
            </div>
          </div>
        </div>
      )}

      {/* Readiness Score */}
      {stats.readinessScore !== null && (
        <div className="card-organic p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                stats.readinessScore >= 70 ? "bg-success/10" :
                stats.readinessScore >= 50 ? "bg-warning/10" : "bg-destructive/10"
              )}>
                <Award className={cn(
                  "w-6 h-6",
                  stats.readinessScore >= 70 ? "text-success" :
                  stats.readinessScore >= 50 ? "text-warning" : "text-destructive"
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Readiness Score</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-foreground">{stats.readinessScore}</p>
                  {stats.trend === 'up' && <TrendingUp className="w-5 h-5 text-success" />}
                  {stats.trend === 'down' && <TrendingDown className="w-5 h-5 text-destructive" />}
                </div>
              </div>
            </div>
            <p className={cn(
              "text-sm font-medium px-3 py-1 rounded-full",
              stats.readinessScore >= 70 ? "bg-success/10 text-success" :
              stats.readinessScore >= 50 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
            )}>
              {stats.readinessScore >= 70 ? 'On Track' :
               stats.readinessScore >= 50 ? 'Needs Work' : 'At Risk'}
            </p>
          </div>
          <Progress 
            value={stats.readinessScore} 
            className="h-2"
          />
        </div>
      )}

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-organic p-4 text-center">
          <Target className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.totalAnswered}</p>
          <p className="text-xs text-muted-foreground">Questions Done</p>
        </div>
        <div className="card-organic p-4 text-center">
          <div className={cn(
            "w-5 h-5 mx-auto mb-2",
            stats.accuracy >= 70 ? "text-success" :
            stats.accuracy >= 50 ? "text-warning" : "text-destructive"
          )}>
            <BarChart3 className="w-5 h-5" />
          </div>
          <p className={cn(
            "text-2xl font-bold",
            stats.accuracy >= 70 ? "text-success" :
            stats.accuracy >= 50 ? "text-warning" : "text-destructive"
          )}>{stats.accuracy}%</p>
          <p className="text-xs text-muted-foreground">Accuracy</p>
        </div>
        <div className="card-organic p-4 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.streakDays}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
        <div className="card-organic p-4 text-center">
          <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">~{stats.avgTimePerQuestion}m</p>
          <p className="text-xs text-muted-foreground">Avg per Question</p>
        </div>
      </div>

      {/* Accuracy Trend Chart */}
      {stats.accuracyTrend.some(d => d.accuracy !== null) && (
        <div className="card-organic p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            7-Day Accuracy Trend
          </h2>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.accuracyTrend}>
                <defs>
                  <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return data.accuracy !== null ? (
                        <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                          <p className="text-sm font-medium">{data.accuracy}%</p>
                          <p className="text-xs text-muted-foreground">{data.count} questions</p>
                        </div>
                      ) : null;
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#accuracyGradient)"
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Weakest Areas */}
      {stats.weakestAreas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h2 className="font-semibold text-foreground">Weakest Topics</h2>
          </div>
          <div className="space-y-2">
            {stats.weakestAreas.map((area) => (
              <div key={area.category} className="card-organic p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">{area.category}</p>
                  <span className={cn(
                    "text-sm font-bold",
                    area.accuracy >= 70 ? "text-success" :
                    area.accuracy >= 50 ? "text-warning" : "text-destructive"
                  )}>{area.accuracy}%</span>
                </div>
                <Progress 
                  value={area.accuracy} 
                  className="h-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {area.correct}/{area.total} correct
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Difficulty Breakdown */}
      {stats.totalAnswered > 0 && (
        <div className="card-organic p-5">
          <h2 className="font-semibold text-foreground mb-4">Accuracy by Difficulty</h2>
          <div className="space-y-3">
            {(['easy', 'medium', 'hard'] as const).map((diff) => {
              const accuracy = stats.difficultyAccuracy?.[diff] || 0;
              const count = stats.difficultyBreakdown[diff];
              return (
                <div key={diff} className="flex items-center gap-3">
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded capitalize w-16 text-center",
                    diff === 'easy' ? "bg-success/10 text-success" :
                    diff === 'medium' ? "bg-warning/10 text-warning" :
                    "bg-destructive/10 text-destructive"
                  )}>{diff}</span>
                  <div className="flex-1">
                    <Progress value={accuracy} className="h-2" />
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">{accuracy}%</span>
                  <span className="text-xs text-muted-foreground w-8">({count})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Mastery */}
      {stats.categoryMastery.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground">All Categories</h2>
          <div className="space-y-2">
            {stats.categoryMastery.map((cat) => (
              <div key={cat.category} className="card-organic p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground truncate flex-1">{cat.category}</p>
                  <span className={cn(
                    "text-sm font-bold ml-2",
                    cat.accuracy >= 70 ? "text-success" :
                    cat.accuracy >= 50 ? "text-warning" : "text-destructive"
                  )}>{cat.accuracy}%</span>
                </div>
                <Progress 
                  value={cat.accuracy} 
                  className="h-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {cat.correct}/{cat.total} correct
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}