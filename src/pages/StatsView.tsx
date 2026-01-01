import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuestions, useUserProgress } from '@/hooks/useQuestions';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonStats } from '@/components/ui/skeleton-card';
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
  Flame,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [showCalendarModal, setShowCalendarModal] = useState(false);

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

    // READINESS SCORE CALCULATION
    // This should reflect true exam readiness - accuracy is king
    // 100 = fully prepared, requires high accuracy + volume + consistency
    
    // Component 1: Accuracy (60% weight) - This is the most important
    const accuracyComponent = Math.round(accuracy * 0.60);
    
    // Component 2: Volume/Experience (20% weight) - Need to practice enough questions
    // Require at least 200 questions for full marks, scale linearly
    const volumeRaw = Math.min((totalAnswered / 200) * 100, 100);
    const volumeComponent = Math.round(volumeRaw * 0.20);
    
    // Component 3: Consistency (10% weight) - Streak matters but less
    const streakScore = Math.min(streakDays * 10, 100); // 10 day streak = full marks
    const consistencyComponent = Math.round(streakScore * 0.10);
    
    // Component 4: Coverage (10% weight) - Practiced all categories
    const categoriesPracticed = Object.keys(nclexCategoryStats).length;
    const coverageRaw = Math.min((categoriesPracticed / 8) * 100, 100);
    const coverageComponent = Math.round(coverageRaw * 0.10);

    let readinessScore: number | null = null;
    let statusText = 'Answer 20+ questions';
    let statusColor = 'text-muted-foreground';
    
    // Require at least 20 questions for a score to appear
    if (totalAnswered >= 20) {
      readinessScore = Math.min(100, accuracyComponent + volumeComponent + consistencyComponent + coverageComponent);
      
      if (readinessScore >= 80) {
        statusText = 'Exam Ready';
        statusColor = 'text-success';
      } else if (readinessScore >= 65) {
        statusText = 'Almost There';
        statusColor = 'text-primary';
      } else if (readinessScore >= 45) {
        statusText = 'Building Momentum';
        statusColor = 'text-warning';
      } else {
        statusText = 'Keep Practicing';
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
      volumeComponent,
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
      {/* Header - Same style as Review page */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Stats</h1>
        <p className="text-sm text-muted-foreground">Track your exam readiness</p>
      </div>

      {/* 1. QUICK WINS BAR - Streak is now clickable */}
      <QuickWinsBar
        streakDays={stats.streakDays}
        todayCount={stats.todayCount}
        weekCount={stats.weekCount}
        onStreakClick={() => setShowCalendarModal(true)}
      />

      {/* 2. HERO READINESS SCORE */}
      <ReadinessScoreHero
        readinessScore={stats.readinessScore}
        statusText={stats.statusText}
        statusColor={stats.statusColor}
        weeklyTrend={stats.weeklyTrend}
        examDate={profile?.exam_date || null}
        todayCount={stats.todayCount}
        dailyGoal={stats.dailyGoal}
        accuracyComponent={stats.accuracyComponent}
        volumeComponent={stats.volumeComponent}
        consistencyComponent={stats.consistencyComponent}
        coverageComponent={stats.coverageComponent}
      />

      {/* 3. TIME INVESTED - Above AI Coach */}
      <TimeInvestedCard
        totalQuestions={stats.totalAnswered}
        weekQuestions={stats.weekCount}
      />

      {/* 4. AI COACH / SMART INSIGHTS - Starts collapsed */}
      <SmartInsightsBox
        readinessScore={stats.readinessScore}
        accuracy={stats.accuracy}
        streakDays={stats.streakDays}
        weakestCategory={stats.weakestAreas[0]?.shortName || null}
        todayCount={stats.todayCount}
        dailyGoal={stats.dailyGoal}
      />

      {/* 5. MASTERED AREAS - 90%+ with 10+ questions */}
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

      {/* Study Activity Calendar Modal */}
      <Dialog open={showCalendarModal} onOpenChange={setShowCalendarModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-accent" />
              Study Activity
            </DialogTitle>
          </DialogHeader>
          <StudyStreakCalendar
            streakDays={stats.streakDays}
            activityData={stats.activityData}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
