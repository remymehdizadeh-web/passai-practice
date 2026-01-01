import { useMemo, useState, useEffect } from 'react';
import { useQuestions, useUserProgress } from '@/hooks/useQuestions';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import {
  TrendingUp,
  Trophy,
  Calendar,
  Target,
  Lock,
  Sparkles,
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
        categoryMastery: [],
        weakestAreas: [],
        strongestAreas: [],
        questionsToMastery: 0,
        projectedDate: null as Date | null,
        globalRank: null as number | null,
      };
    }

    const totalAnswered = progress.length;
    const correctAnswers = progress.filter(p => p.is_correct).length;
    const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

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

    // Readiness score calculation
    let readinessScore: number | null = null;
    let statusText = 'Answer 10+ questions';
    let statusColor = 'text-muted-foreground';
    
    if (totalAnswered >= 10) {
      const completionRate = Math.min(100, Math.round((totalAnswered / questions.length) * 100));
      const accuracyWeight = accuracy * 0.75;
      const completionWeight = completionRate * 0.15;
      const streakWeight = Math.min((profile?.streak_days || 0) * 2, 10);
      readinessScore = Math.min(100, Math.round(accuracyWeight + completionWeight + streakWeight));
      
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

    // Simulated metrics
    const questionsToMastery = Math.max(0, 500 - totalAnswered);
    const projectedDate = profile?.exam_date ? new Date(profile.exam_date) : null;
    const globalRank = totalAnswered >= 10 ? Math.floor(Math.random() * 5000) + 1000 : null;

    return {
      totalAnswered,
      accuracy,
      readinessScore,
      statusText,
      statusColor,
      categoryMastery,
      weakestAreas,
      strongestAreas,
      questionsToMastery,
      projectedDate,
      globalRank,
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
        {/* Background gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-warning/5 to-success/5" />
        
        {/* Gauge */}
        <div className="relative flex flex-col items-center">
          <div className="relative">
            <svg width="180" height="100" viewBox="0 0 180 100" className="overflow-visible">
              {/* Background arc */}
              <path
                d="M 10 90 A 80 80 0 0 1 170 90"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Progress arc with gradient */}
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
              {/* Pulse dot at end */}
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
            
            {/* Score in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
              <span className="text-5xl font-black text-foreground tracking-tight">
                {stats.readinessScore !== null ? animatedScore : '—'}
              </span>
            </div>
          </div>
          
          {/* Status text */}
          <p className={cn("text-sm font-semibold mt-2", stats.statusColor)}>
            {stats.statusText}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Readiness Score</p>
        </div>
      </div>

      {/* 2. GOLD NUGGET ROW - Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {/* Global Rank */}
        <div className="flex-shrink-0 w-32 bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
          <div className="relative">
            <Trophy className="w-5 h-5 text-amber-500 mb-2" />
            <p className="text-2xl font-black text-foreground">
              {stats.globalRank ? `#${stats.globalRank.toLocaleString()}` : '—'}
            </p>
            <p className="text-[11px] text-muted-foreground font-medium">Global Rank</p>
          </div>
        </div>

        {/* Projected Exam Date */}
        <div className="flex-shrink-0 w-32 bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          <div className="relative">
            <Calendar className="w-5 h-5 text-primary mb-2" />
            <p className="text-lg font-black text-foreground">
              {stats.projectedDate 
                ? stats.projectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'Not set'}
            </p>
            <p className="text-[11px] text-muted-foreground font-medium">Exam Date</p>
          </div>
        </div>

        {/* Questions to Mastery */}
        <div className="flex-shrink-0 w-32 bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
          <div className="relative">
            <Target className="w-5 h-5 text-accent mb-2" />
            <p className="text-2xl font-black text-foreground">{stats.questionsToMastery}</p>
            <p className="text-[11px] text-muted-foreground font-medium">To Mastery</p>
          </div>
        </div>
      </div>

      {/* 3. CRITICAL WEAKNESSES */}
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

      {/* 4. MASTERED AREAS */}
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

      {/* 5. PREDICTIVE ANALYSIS - Monetization Hook */}
      <div className="relative bg-card border border-border rounded-2xl p-5 overflow-hidden">
        {/* Blur overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 backdrop-blur-[2px]" />
        
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-foreground">Predictive Analysis</h3>
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">AI-powered exam prediction & personalized study plan</p>
          </div>
        </div>
        
        <button className="mt-4 w-full btn-premium py-2.5 text-sm text-primary-foreground flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          Unlock AI Prediction
        </button>
      </div>

      {/* Empty state */}
      {stats.totalAnswered === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Start practicing to see your readiness dashboard</p>
        </div>
      )}
    </div>
  );
}
