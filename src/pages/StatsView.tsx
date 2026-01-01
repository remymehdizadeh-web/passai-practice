import { useMemo, useState, useEffect } from 'react';
import { useQuestions, useUserProgress } from '@/hooks/useQuestions';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Pill,
  Heart,
  Brain,
  Activity,
  AlertTriangle,
  Users,
  Stethoscope,
  ChevronRight,
  BarChart3,
  Lightbulb,
  Target,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { NCLEX_CATEGORIES, NCLEX_SHORT_NAMES, type NclexCategory } from '@/lib/categories';

// Icon mapping for NCLEX categories
const CATEGORY_ICONS: Record<NclexCategory, React.ElementType> = {
  'Management of Care': Users,
  'Safety and Infection Control': Shield,
  'Health Promotion and Maintenance': Heart,
  'Psychosocial Integrity': Brain,
  'Basic Care and Comfort': Stethoscope,
  'Pharmacological and Parenteral Therapies': Pill,
  'Reduction of Risk Potential': AlertTriangle,
  'Physiological Adaptation': Activity,
};

export function StatsView() {
  const { data: questions } = useQuestions();
  const { data: progress } = useUserProgress();
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showBars, setShowBars] = useState(false);

  const stats = useMemo(() => {
    if (!progress || !questions) {
      return {
        totalAnswered: 0,
        accuracy: 0,
        readinessScore: null,
        statusText: 'Start Practicing',
        statusColor: 'text-muted-foreground',
        // Score breakdown components
        accuracyComponent: 0,
        consistencyComponent: 0,
        coverageComponent: 0,
        streakDays: profile?.streak_days || 0,
        categoryMastery: [],
        weakestAreas: [],
        strongestAreas: [],
        improvementTips: [] as { icon: React.ElementType; text: string; priority: 'high' | 'medium' | 'low' }[],
        weeklyTrend: null as number | null,
        todayCount: 0,
        dailyGoal: profile?.study_goal_daily || 10,
      };
    }

    const totalAnswered = progress.length;
    const correctAnswers = progress.filter(p => p.is_correct).length;
    const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

    // Today's progress
    const today = new Date().toISOString().split('T')[0];
    const todayCount = progress.filter(p => p.created_at.split('T')[0] === today).length;
    const dailyGoal = profile?.study_goal_daily || 10;
    const streakDays = profile?.streak_days || 0;

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
        shortName: NCLEX_SHORT_NAMES[category as NclexCategory] || category,
        accuracy: stats ? Math.round((stats.correct / stats.total) * 100) : 0,
        total: stats?.total || 0,
        icon: CATEGORY_ICONS[category as NclexCategory],
      };
    }).filter(c => c.total > 0);

    const sortedByAccuracy = [...categoryMastery].sort((a, b) => a.accuracy - b.accuracy);
    const weakestAreas = sortedByAccuracy.filter(c => c.accuracy < 70).slice(0, 4);
    const strongestAreas = sortedByAccuracy.filter(c => c.accuracy >= 70).slice(-4).reverse();

    // Weekly trend calculation
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);
    
    const thisWeekProgress = progress.filter(p => new Date(p.created_at) >= oneWeekAgo);
    const lastWeekProgress = progress.filter(p => {
      const date = new Date(p.created_at);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    });
    
    let weeklyTrend: number | null = null;
    if (thisWeekProgress.length >= 5 && lastWeekProgress.length >= 5) {
      const thisWeekAcc = thisWeekProgress.filter(p => p.is_correct).length / thisWeekProgress.length;
      const lastWeekAcc = lastWeekProgress.filter(p => p.is_correct).length / lastWeekProgress.length;
      weeklyTrend = Math.round((thisWeekAcc - lastWeekAcc) * 100);
    }

    // READINESS SCORE CALCULATION
    // Component 1: Accuracy (50% weight) - How correct are your answers?
    const accuracyComponent = Math.round(accuracy * 0.5);
    
    // Component 2: Consistency (30% weight) - Based on streak and daily practice
    const streakScore = Math.min(streakDays * 5, 50); // Max 50 points from 10+ day streak
    const dailyProgress = Math.min((todayCount / dailyGoal) * 50, 50); // Max 50 points from hitting goal
    const consistencyRaw = (streakScore + dailyProgress) / 100 * 100;
    const consistencyComponent = Math.round(consistencyRaw * 0.3);
    
    // Component 3: Coverage (20% weight) - How many categories have you practiced?
    const categoriesPracticed = Object.keys(nclexCategoryStats).length;
    const coverageRaw = Math.min((categoriesPracticed / 8) * 100, 100);
    const coverageComponent = Math.round(coverageRaw * 0.2);

    let readinessScore: number | null = null;
    let statusText = 'Answer 10+ questions';
    let statusColor = 'text-muted-foreground';
    
    if (totalAnswered >= 10) {
      readinessScore = Math.min(100, accuracyComponent + consistencyComponent + coverageComponent);
      
      if (readinessScore >= 75) {
        statusText = 'Likely to Pass';
        statusColor = 'text-success';
      } else if (readinessScore >= 55) {
        statusText = 'On Track';
        statusColor = 'text-warning';
      } else {
        statusText = 'Focus Required';
        statusColor = 'text-destructive';
      }
    }

    // Generate improvement tips based on weak areas
    const improvementTips: { icon: React.ElementType; text: string; priority: 'high' | 'medium' | 'low' }[] = [];
    
    if (accuracy < 70) {
      improvementTips.push({
        icon: Target,
        text: 'Focus on accuracy — review explanations after each question',
        priority: 'high'
      });
    }
    
    if (streakDays < 3) {
      improvementTips.push({
        icon: Flame,
        text: 'Build a study streak — practice daily to boost your score',
        priority: streakDays === 0 ? 'high' : 'medium'
      });
    }
    
    if (todayCount < dailyGoal) {
      improvementTips.push({
        icon: CheckCircle2,
        text: `Complete ${dailyGoal - todayCount} more questions to hit your daily goal`,
        priority: 'medium'
      });
    }
    
    if (categoriesPracticed < 6) {
      improvementTips.push({
        icon: BarChart3,
        text: `Practice more categories — you've covered ${categoriesPracticed}/8 NCLEX areas`,
        priority: 'medium'
      });
    }
    
    if (weakestAreas.length > 0) {
      improvementTips.push({
        icon: Lightbulb,
        text: `Strengthen "${weakestAreas[0].shortName}" — your lowest category`,
        priority: 'high'
      });
    }

    return {
      totalAnswered,
      accuracy,
      readinessScore,
      statusText,
      statusColor,
      accuracyComponent,
      consistencyComponent,
      coverageComponent,
      streakDays,
      categoryMastery,
      weakestAreas,
      strongestAreas,
      improvementTips: improvementTips.slice(0, 3),
      weeklyTrend,
      todayCount,
      dailyGoal,
    };
  }, [questions, progress, profile]);

  // Animate score on mount
  useEffect(() => {
    if (stats.readinessScore !== null) {
      const duration = 1500;
      const steps = 60;
      const increment = stats.readinessScore / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= stats.readinessScore!) {
          setAnimatedScore(stats.readinessScore!);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.round(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [stats.readinessScore]);

  // Trigger progress bar animation
  useEffect(() => {
    const timer = setTimeout(() => setShowBars(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleCategoryTap = (category: string) => {
    navigate('/', { state: { tab: 'practice', category } });
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">Readiness Dashboard</h2>
        <p className="text-sm text-muted-foreground mb-4">Sign in to track your progress</p>
        <button 
          onClick={() => navigate('/auth')}
          className="btn-premium px-6 py-2.5 text-sm text-primary-foreground"
        >
          Get Started
        </button>
      </div>
    );
  }

  // Calculate gauge path
  const gaugeRadius = 80;
  const gaugeCircumference = Math.PI * gaugeRadius;
  const gaugeProgress = stats.readinessScore !== null 
    ? (animatedScore / 100) * gaugeCircumference 
    : 0;

  return (
    <div className="px-4 pb-6 space-y-5">
      {/* 1. HERO - Circular Gauge */}
      <div className="relative bg-card border border-border rounded-3xl p-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-warning/5 to-success/5" />
        
        <div className="relative flex flex-col items-center">
          <div className="relative">
            <svg width="180" height="100" viewBox="0 0 180 100" className="overflow-visible">
              <path
                d="M 10 90 A 80 80 0 0 1 170 90"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(0, 72%, 51%)" />
                  <stop offset="50%" stopColor="hsl(38, 92%, 50%)" />
                  <stop offset="100%" stopColor="hsl(160, 60%, 45%)" />
                </linearGradient>
              </defs>
              <path
                d="M 10 90 A 80 80 0 0 1 170 90"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={gaugeCircumference}
                strokeDashoffset={gaugeCircumference - gaugeProgress}
                className="transition-all duration-1000 ease-out"
                style={{ filter: 'drop-shadow(0 0 8px hsl(38, 92%, 50%, 0.4))' }}
              />
              {stats.readinessScore !== null && (
                <circle
                  cx={90 + 80 * Math.cos(Math.PI - (animatedScore / 100) * Math.PI)}
                  cy={90 - 80 * Math.sin(Math.PI - (animatedScore / 100) * Math.PI)}
                  r="6"
                  fill="hsl(var(--background))"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="3"
                  className="animate-pulse"
                />
              )}
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
              <div className="flex items-center gap-2">
                <span className="text-5xl font-black text-foreground tracking-tight">
                  {stats.readinessScore !== null ? animatedScore : '—'}
                </span>
                {stats.weeklyTrend !== null && stats.weeklyTrend !== 0 && (
                  <div className={cn(
                    "flex items-center gap-0.5 text-xs font-semibold",
                    stats.weeklyTrend > 0 ? "text-success" : "text-destructive"
                  )}>
                    {stats.weeklyTrend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stats.weeklyTrend > 0 ? '+' : ''}{stats.weeklyTrend}%
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <p className={cn("text-sm font-semibold mt-2", stats.statusColor)}>
            {stats.statusText}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Readiness Score</p>
        </div>
      </div>

      {/* 2. SCORE BREAKDOWN - How it's calculated */}
      {stats.readinessScore !== null && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">How your score is calculated</h3>
          
          <div className="space-y-3">
            {/* Accuracy */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Accuracy (50%)</span>
                <span className="text-xs font-semibold text-foreground">{stats.accuracyComponent}/50</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: showBars ? `${(stats.accuracyComponent / 50) * 100}%` : '0%' }}
                />
              </div>
            </div>
            
            {/* Consistency */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Consistency (30%)</span>
                <span className="text-xs font-semibold text-foreground">{stats.consistencyComponent}/30</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent rounded-full transition-all duration-1000"
                  style={{ width: showBars ? `${(stats.consistencyComponent / 30) * 100}%` : '0%' }}
                />
              </div>
            </div>
            
            {/* Coverage */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Category Coverage (20%)</span>
                <span className="text-xs font-semibold text-foreground">{stats.coverageComponent}/20</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success rounded-full transition-all duration-1000"
                  style={{ width: showBars ? `${(stats.coverageComponent / 20) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. IMPROVEMENT TIPS */}
      {stats.improvementTips.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-semibold text-foreground">How to improve</h3>
          </div>
          
          <div className="space-y-2">
            {stats.improvementTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div 
                  key={index}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl",
                    tip.priority === 'high' ? "bg-warning/10 border border-warning/20" :
                    "bg-muted/50"
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4 mt-0.5 shrink-0",
                    tip.priority === 'high' ? "text-warning" : "text-muted-foreground"
                  )} />
                  <span className="text-sm text-foreground">{tip.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. CRITICAL WEAKNESSES */}
      {stats.weakestAreas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <h3 className="text-sm font-semibold text-foreground">Critical Weaknesses</h3>
          </div>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {stats.weakestAreas.map((area) => {
              const Icon = area.icon;
              return (
                <button
                  key={area.category}
                  onClick={() => handleCategoryTap(area.category)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 active:bg-muted transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground truncate">{area.shortName}</span>
                      <span className="text-xs font-bold text-destructive">{area.accuracy}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-destructive to-warning rounded-full transition-all duration-1000 ease-out"
                        style={{ width: showBars ? `${area.accuracy}%` : '0%' }}
                      />
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. MASTERED AREAS */}
      {stats.strongestAreas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <h3 className="text-sm font-semibold text-foreground">Mastered Areas</h3>
          </div>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
            {stats.strongestAreas.map((area) => {
              const Icon = area.icon;
              return (
                <button
                  key={area.category}
                  onClick={() => handleCategoryTap(area.category)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 active:bg-muted transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground truncate">{area.shortName}</span>
                      <span className="text-xs font-bold text-success">{area.accuracy}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-1000 ease-out"
                        style={{ width: showBars ? `${area.accuracy}%` : '0%' }}
                      />
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {stats.totalAnswered === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Start practicing to see your readiness dashboard</p>
        </div>
      )}
    </div>
  );
}
