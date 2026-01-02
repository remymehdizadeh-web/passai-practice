import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Flame, BarChart3, BookOpen, ChevronRight, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ReadinessScoreHeroProps {
  readinessScore: number | null;
  statusText: string;
  statusColor: string;
  weeklyTrend: number | null;
  examDate: string | null;
  todayCount: number;
  dailyGoal: number;
  accuracyComponent: number;
  volumeComponent: number;
  consistencyComponent: number;
  coverageComponent: number;
}

export function ReadinessScoreHero({
  readinessScore,
  statusText,
  weeklyTrend,
  accuracyComponent,
  volumeComponent,
  consistencyComponent,
  coverageComponent,
}: ReadinessScoreHeroProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (readinessScore !== null) {
      const duration = 1000;
      const steps = 50;
      const increment = readinessScore / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= readinessScore) {
          setAnimatedScore(readinessScore);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.round(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [readinessScore]);

  const gaugeRadius = 54;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const progress = readinessScore !== null ? (animatedScore / 100) : 0;
  const strokeDashoffset = gaugeCircumference * (1 - progress);

  const getScoreColor = () => {
    if (readinessScore === null) return 'hsl(var(--muted-foreground))';
    if (readinessScore >= 80) return 'hsl(var(--success))';
    if (readinessScore >= 65) return 'hsl(var(--primary))';
    if (readinessScore >= 45) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const getStatusStyles = () => {
    if (readinessScore === null) return 'text-muted-foreground';
    if (readinessScore >= 80) return 'text-success';
    if (readinessScore >= 65) return 'text-primary';
    if (readinessScore >= 45) return 'text-warning';
    return 'text-destructive';
  };

  const breakdownItems = [
    { label: 'Accuracy', value: accuracyComponent, max: 60, color: 'bg-primary', icon: Target },
    { label: 'Volume', value: volumeComponent, max: 20, color: 'bg-accent', icon: BookOpen },
    { label: 'Streak', value: consistencyComponent, max: 10, color: 'bg-success', icon: Flame },
    { label: 'Coverage', value: coverageComponent, max: 10, color: 'bg-warning', icon: BarChart3 },
  ];

  // Find the weakest component for improvement tip
  const getImprovementTip = () => {
    const items = [
      { label: 'accuracy', value: accuracyComponent / 60, tip: 'Focus on understanding rationales to improve accuracy' },
      { label: 'volume', value: volumeComponent / 20, tip: 'Answer more questions to build experience' },
      { label: 'streak', value: consistencyComponent / 10, tip: 'Study daily to build your streak' },
      { label: 'coverage', value: coverageComponent / 10, tip: 'Practice all 8 NCLEX categories' },
    ];
    const weakest = items.sort((a, b) => a.value - b.value)[0];
    return weakest.tip;
  };

  return (
    <div 
      className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/40 transition-all duration-200 hover:shadow-lg"
      onClick={() => navigate('/', { state: { tab: 'practice' } })}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">Readiness Score</h3>
        {weeklyTrend !== null && weeklyTrend !== 0 && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
            weeklyTrend > 0 ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
          )}>
            {weeklyTrend > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {weeklyTrend > 0 ? '+' : ''}{weeklyTrend}%
          </div>
        )}
      </div>

      {/* Score Circle + Status */}
      <div className="flex items-center gap-6 mb-5">
        {/* Circular Progress */}
        <div className="relative flex-shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r={gaugeRadius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            {/* Progress arc */}
            <circle
              cx="60"
              cy="60"
              r={gaugeRadius}
              fill="none"
              stroke={getScoreColor()}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={gaugeCircumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
              style={{ 
                transform: 'rotate(-90deg)',
                transformOrigin: '60px 60px',
              }}
            />
          </svg>
          
          {/* Score in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-foreground leading-none">
              {readinessScore !== null ? animatedScore : '—'}
            </span>
            <span className="text-xs text-muted-foreground font-medium mt-0.5">of 100</span>
          </div>
        </div>

        {/* Status & Goal */}
        <div className="flex-1">
          <p className={cn("text-lg font-bold mb-1", getStatusStyles())}>
            {statusText}
          </p>
          
          {readinessScore !== null && readinessScore < 80 && (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{80 - readinessScore} points</span> to Exam Ready
            </p>
          )}
          {readinessScore !== null && readinessScore >= 80 && (
            <p className="text-sm text-success">
              You're ready for the exam!
            </p>
          )}
          {readinessScore === null && (
            <p className="text-sm text-muted-foreground">
              Answer 20+ questions to see your score
            </p>
          )}
          
          <p className="text-xs text-muted-foreground mt-2">
            Tap to practice →
          </p>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-4 gap-3 pt-4 border-t border-border">
        {breakdownItems.map((item) => {
          const Icon = item.icon;
          const percentage = Math.round((item.value / item.max) * 100);
          return (
            <div key={item.label} className="text-center">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5",
                `${item.color}/15`
              )}>
                <Icon className={cn("w-4 h-4", item.color.replace('bg-', 'text-'))} />
              </div>
              <p className="text-sm font-bold text-foreground">{item.value}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{item.label}</p>
            </div>
          );
        })}
      </div>

      {/* Improvement Tip */}
      {readinessScore !== null && readinessScore < 100 && (
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-0.5">How to improve</p>
            <p className="text-xs text-amber-900 dark:text-amber-100">{getImprovementTip()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
