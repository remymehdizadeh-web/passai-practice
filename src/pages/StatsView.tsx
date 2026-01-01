import { useMemo, useState } from 'react';
import { useQuestions, useUserProgress } from '@/hooks/useQuestions';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import {
  TrendingUp,
  Flame,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { NCLEX_CATEGORIES, NCLEX_SHORT_NAMES, type NclexCategory } from '@/lib/categories';

export function StatsView() {
  const { data: questions } = useQuestions();
  const { data: progress } = useUserProgress();
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAllCategories, setShowAllCategories] = useState(false);

  const stats = useMemo(() => {
    if (!progress || !questions) {
      return {
        totalAnswered: 0,
        accuracy: 0,
        readinessScore: null,
        readinessLabel: 'Not enough data',
        trend: null as number | null,
        categoryMastery: [],
        weakestAreas: [],
        strongestAreas: [],
        streakDays: profile?.streak_days || 0,
        weekCount: 0,
      };
    }

    const totalAnswered = progress.length;
    const correctAnswers = progress.filter(p => p.is_correct).length;
    const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

    // This week's count
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekCount = progress.filter(p => new Date(p.created_at) >= weekStart).length;

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
      };
    }).filter(c => c.total > 0);

    const sortedByAccuracy = [...categoryMastery].sort((a, b) => a.accuracy - b.accuracy);
    const weakestAreas = sortedByAccuracy.slice(0, 2);
    const strongestAreas = sortedByAccuracy.slice(-2).reverse();

    // Trend calculation (compare last 2 weeks)
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - 7);
    
    const thisWeekProgress = progress.filter(p => new Date(p.created_at) >= lastWeekStart);
    const lastWeekProgress = progress.filter(p => {
      const date = new Date(p.created_at);
      return date >= twoWeeksAgo && date < lastWeekStart;
    });
    
    let trend: number | null = null;
    if (thisWeekProgress.length >= 5 && lastWeekProgress.length >= 5) {
      const thisWeekAcc = thisWeekProgress.filter(p => p.is_correct).length / thisWeekProgress.length;
      const lastWeekAcc = lastWeekProgress.filter(p => p.is_correct).length / lastWeekProgress.length;
      trend = Math.round((thisWeekAcc - lastWeekAcc) * 100);
    }

    // Readiness score
    let readinessScore: number | null = null;
    let readinessLabel = 'Answer 10+ questions';
    
    if (totalAnswered >= 10) {
      const completionRate = Math.min(100, Math.round((totalAnswered / questions.length) * 100));
      const accuracyWeight = accuracy * 0.75;
      const completionWeight = completionRate * 0.15;
      const streakWeight = Math.min((profile?.streak_days || 0) * 2, 10);
      readinessScore = Math.round(accuracyWeight + completionWeight + streakWeight);
      
      if (readinessScore >= 70) {
        readinessLabel = 'On track';
      } else if (readinessScore >= 50) {
        readinessLabel = 'Borderline';
      } else {
        readinessLabel = 'Needs work';
      }
    }

    return {
      totalAnswered,
      accuracy,
      readinessScore,
      readinessLabel,
      trend,
      categoryMastery,
      weakestAreas,
      strongestAreas,
      streakDays: profile?.streak_days || 0,
      weekCount,
    };
  }, [questions, progress, profile]);

  const handleCategoryTap = (category: string) => {
    // Navigate to practice with category filter
    navigate('/', { state: { tab: 'practice', category } });
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">Track Your Progress</h2>
        <p className="text-sm text-muted-foreground mb-4">Sign in to see your stats</p>
        <button 
          onClick={() => navigate('/auth')}
          className="btn-premium px-6 py-2.5 text-sm text-primary-foreground"
        >
          Get Started
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4 space-y-4">
      {/* 1. HERO - Readiness Score */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-accent p-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.1),transparent_50%)]" />
        
        <div className="relative">
          {stats.readinessScore !== null ? (
            <>
              <div className="flex items-center justify-center gap-2">
                <span className="text-6xl font-black text-primary-foreground tracking-tight">
                  {stats.readinessScore}
                </span>
                {stats.trend !== null && stats.trend !== 0 && (
                  <div className={cn(
                    "flex items-center gap-0.5 px-2 py-1 rounded-full text-xs font-semibold",
                    stats.trend > 0 
                      ? "bg-white/20 text-white" 
                      : "bg-black/20 text-white/80"
                  )}>
                    <TrendingUp className={cn("w-3 h-3", stats.trend < 0 && "rotate-180")} />
                    {stats.trend > 0 ? '+' : ''}{stats.trend}%
                  </div>
                )}
              </div>
              <p className="text-primary-foreground/80 text-sm font-medium mt-1">
                {stats.readinessLabel}
              </p>
            </>
          ) : (
            <>
              <span className="text-5xl font-black text-primary-foreground/60">—</span>
              <p className="text-primary-foreground/60 text-sm mt-1">{stats.readinessLabel}</p>
            </>
          )}
        </div>
      </div>

      {/* 2. QUICK STATS - Single row, 3 items */}
      <div className="grid grid-cols-3 gap-3">
        <button className="bg-card border border-border rounded-xl p-3 text-center active:scale-95 transition-transform">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xl font-black text-foreground">{stats.streakDays}</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium">Streak</p>
        </button>
        
        <button className="bg-card border border-border rounded-xl p-3 text-center active:scale-95 transition-transform">
          <span className="text-xl font-black text-foreground block mb-1">{stats.weekCount}</span>
          <p className="text-[11px] text-muted-foreground font-medium">This week</p>
        </button>
        
        <button className="bg-card border border-border rounded-xl p-3 text-center active:scale-95 transition-transform">
          <span className="text-xl font-black text-foreground block mb-1">{stats.accuracy}%</span>
          <p className="text-[11px] text-muted-foreground font-medium">Accuracy</p>
        </button>
      </div>

      {/* 3. FOCUS vs STRENGTHS */}
      <div className="grid grid-cols-2 gap-3">
        {/* Focus Next */}
        <div className="bg-card border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <h3 className="text-xs font-semibold text-foreground">Focus next</h3>
          </div>
          {stats.weakestAreas.length > 0 ? (
            <div className="space-y-2">
              {stats.weakestAreas.map((area) => (
                <button
                  key={area.category}
                  onClick={() => handleCategoryTap(area.category)}
                  className="w-full text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground group-active:text-primary transition-colors truncate pr-2">
                      {area.shortName}
                    </span>
                    <span className={cn(
                      "text-xs font-bold shrink-0",
                      area.accuracy >= 50 ? "text-warning" : "text-destructive"
                    )}>
                      {area.accuracy}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Start practicing</p>
          )}
        </div>

        {/* Strong Areas */}
        <div className="bg-card border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-success" />
            <h3 className="text-xs font-semibold text-foreground">Strong areas</h3>
          </div>
          {stats.strongestAreas.length > 0 && stats.strongestAreas[0].accuracy > 0 ? (
            <div className="space-y-2">
              {stats.strongestAreas.map((area) => (
                <button
                  key={area.category}
                  onClick={() => handleCategoryTap(area.category)}
                  className="w-full text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground group-active:text-primary transition-colors truncate pr-2">
                      {area.shortName}
                    </span>
                    <span className="text-xs font-bold text-success shrink-0">
                      {area.accuracy}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Keep practicing</p>
          )}
        </div>
      </div>

      {/* 4. ALL CATEGORIES - Collapsed by default */}
      {stats.categoryMastery.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <button 
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="w-full flex items-center justify-between p-3 active:bg-muted/50 transition-colors"
          >
            <span className="text-sm font-medium text-foreground">View all NCLEX categories</span>
            {showAllCategories ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          
          {showAllCategories && (
            <div className="px-3 pb-3 space-y-2 border-t border-border pt-3">
              {stats.categoryMastery.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => handleCategoryTap(cat.category)}
                  className="w-full flex items-center justify-between py-1.5 group"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      cat.accuracy >= 70 ? "bg-success" :
                      cat.accuracy >= 50 ? "bg-warning" : "bg-destructive"
                    )} />
                    <span className="text-sm text-foreground truncate group-active:text-primary transition-colors">
                      {cat.shortName}
                    </span>
                  </div>
                  <span className={cn(
                    "text-xs font-bold shrink-0 ml-2",
                    cat.accuracy >= 70 ? "text-success" :
                    cat.accuracy >= 50 ? "text-warning" : "text-destructive"
                  )}>
                    {cat.accuracy}%
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {stats.totalAnswered === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Start practicing to see your stats</p>
        </div>
      )}
    </div>
  );
}
