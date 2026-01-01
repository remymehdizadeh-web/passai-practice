import { useMemo, useState, useEffect } from 'react';
import { useQuestions, useUserProgress } from '@/hooks/useQuestions';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import {
  Shield,
  Pill,
  Heart,
  Brain,
  Activity,
  AlertTriangle,
  Users,
  Stethoscope,
  BarChart3,
  Info,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NCLEX_CATEGORIES, NCLEX_SHORT_NAMES, type NclexCategory } from '@/lib/categories';
import { QuickWinsBar } from '@/components/stats/QuickWinsBar';
import { ReadinessScoreHero } from '@/components/stats/ReadinessScoreHero';
import { MasteredSection } from '@/components/stats/MasteredSection';
import { SmartInsightsBox } from '@/components/stats/SmartInsightsBox';
import { StudyStreakCalendar } from '@/components/stats/StudyStreakCalendar';
import { TimeInvestedCard } from '@/components/stats/TimeInvestedCard';
import { cn } from '@/lib/utils';

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
  const [showBars, setShowBars] = useState(false);

  // Trigger bar animations
  useEffect(() => {
    const timer = setTimeout(() => setShowBars(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    if (!progress || !questions) {
      return {
        totalAnswered: 0,
        accuracy: 0,
        readinessScore: null,
        statusText: 'Start Practicing',
        statusColor: 'text-muted-foreground',
        accuracyComponent: 0,
        consistencyComponent: 0,
        coverageComponent: 0,
        streakDays: profile?.streak_days || 0,
        categoryMastery: [],
        masteredAreas: [],
        weakestAreas: [],
        weeklyTrend: null as number | null,
        todayCount: 0,
        weekCount: 0,
        dailyGoal: profile?.study_goal_daily || 10,
        activityData: [] as { date: string; count: number }[],
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

    // This week's progress
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const weekCount = progress.filter(p => new Date(p.created_at) >= startOfWeek).length;

    // Activity data for calendar (last 30 days)
    const activityMap: Record<string, number> = {};
    progress.forEach(p => {
      const date = p.created_at.split('T')[0];
      activityMap[date] = (activityMap[date] || 0) + 1;
    });
    const activityData = Object.entries(activityMap).map(([date, count]) => ({ date, count }));

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
    // Mastery: 90%+ accuracy with at least 10 questions answered
    const masteredAreas = sortedByAccuracy.filter(c => c.accuracy >= 90 && c.total >= 10);

    // Weekly trend calculation
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

    // READINESS SCORE CALCULATION (matching home page)
    // Component 1: Accuracy (45% weight)
    const accuracyComponent = Math.round(accuracy * 0.45);
    
    // Component 2: Consistency (25% weight)
    const streakScore = Math.min(streakDays * 5, 50);
    const dailyProgress = Math.min((todayCount / dailyGoal) * 50, 50);
    const consistencyRaw = (streakScore + dailyProgress) / 100 * 100;
    const consistencyComponent = Math.round(consistencyRaw * 0.25);
    
    // Component 3: Coverage (20% weight)
    const categoriesPracticed = Object.keys(nclexCategoryStats).length;
    const coverageRaw = Math.min((categoriesPracticed / 8) * 100, 100);
    const coverageComponent = Math.round(coverageRaw * 0.2);

    let readinessScore: number | null = null;
    let statusText = 'Answer 10+ questions';
    let statusColor = 'text-muted-foreground';
    
    if (totalAnswered >= 10) {
      // Add velocity component (10%)
      const velocityComponent = Math.min(10, Math.round((todayCount / dailyGoal) * 10));
      readinessScore = Math.min(100, accuracyComponent + consistencyComponent + coverageComponent + velocityComponent);
      
      if (readinessScore >= 75) {
        statusText = 'Exam Ready';
        statusColor = 'text-success';
      } else if (readinessScore >= 60) {
        statusText = 'Almost There';
        statusColor = 'text-primary';
      } else if (readinessScore >= 40) {
        statusText = 'Building Momentum';
        statusColor = 'text-warning';
      } else {
        statusText = 'Focus Required';
        statusColor = 'text-destructive';
      }
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
      masteredAreas,
      weakestAreas,
      weeklyTrend,
      todayCount,
      weekCount,
      dailyGoal,
      activityData,
    };
  }, [questions, progress, profile]);

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

  return (
    <div className="px-4 pb-6 space-y-4">
      {/* 1. QUICK WINS BAR */}
      <QuickWinsBar
        streakDays={stats.streakDays}
        todayCount={stats.todayCount}
        weekCount={stats.weekCount}
      />

      {/* 2. STUDY STREAK CALENDAR - Above readiness */}
      <StudyStreakCalendar
        streakDays={stats.streakDays}
        activityData={stats.activityData}
      />

      {/* 3. HERO READINESS SCORE */}
      <ReadinessScoreHero
        readinessScore={stats.readinessScore}
        statusText={stats.statusText}
        statusColor={stats.statusColor}
        weeklyTrend={stats.weeklyTrend}
        examDate={profile?.exam_date || null}
        todayCount={stats.todayCount}
        dailyGoal={stats.dailyGoal}
        accuracyComponent={stats.accuracyComponent}
        consistencyComponent={stats.consistencyComponent}
        coverageComponent={stats.coverageComponent}
      />

      {/* 4. TIME INVESTED - Above AI Coach */}
      <TimeInvestedCard
        totalQuestions={stats.totalAnswered}
        weekQuestions={stats.weekCount}
      />

      {/* 5. AI COACH / SMART INSIGHTS - Starts collapsed */}
      <SmartInsightsBox
        readinessScore={stats.readinessScore}
        accuracy={stats.accuracy}
        streakDays={stats.streakDays}
        weakestCategory={stats.weakestAreas[0]?.shortName || null}
        todayCount={stats.todayCount}
        dailyGoal={stats.dailyGoal}
      />

      {/* 6. MASTERED AREAS - 90%+ with 10+ questions */}
      {stats.masteredAreas.length > 0 ? (
        <MasteredSection
          areas={stats.masteredAreas}
          onCategoryTap={handleCategoryTap}
        />
      ) : (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Mastered Areas</h3>
          </div>
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <Sparkles className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">No categories mastered yet</p>
            <div className="bg-background/50 rounded-lg p-3 text-left">
              <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary" />
                How to master a category:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-5">
                <li>• Answer at least 10 questions in a category</li>
                <li>• Achieve 90%+ accuracy in that category</li>
                <li>• Keep practicing to maintain mastery!</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {stats.totalAnswered === 0 && (
        <div className="text-center py-8 bg-card border border-border rounded-2xl">
          <p className="text-sm text-muted-foreground mb-2">No streak yet? Start one today! 🔥</p>
          <p className="text-xs text-muted-foreground">Complete your first question to unlock insights</p>
        </div>
      )}
    </div>
  );
}
