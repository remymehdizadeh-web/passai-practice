import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Target, Flame, BarChart3, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateDaysUntilExam } from '@/hooks/useProfile';

interface ReadinessScoreHeroProps {
  readinessScore: number | null;
  statusText: string;
  statusColor: string;
  weeklyTrend: number | null;
  examDate: string | null;
  todayCount: number;
  dailyGoal: number;
  accuracyComponent: number;
  consistencyComponent: number;
  coverageComponent: number;
}

export function ReadinessScoreHero({
  readinessScore,
  statusText,
  statusColor,
  weeklyTrend,
  examDate,
  todayCount,
  dailyGoal,
  accuracyComponent,
  consistencyComponent,
  coverageComponent,
}: ReadinessScoreHeroProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBars, setShowBars] = useState(false);

  const daysUntilExam = calculateDaysUntilExam(examDate);
  const questionsToGoal = Math.max(0, dailyGoal - todayCount);

  // Animate score
  useEffect(() => {
    if (readinessScore !== null) {
      const duration = 1200;
      const steps = 60;
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

  // Trigger bar animations
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => setShowBars(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowBars(false);
    }
  }, [isExpanded]);

  // Calculate gauge path
  const gaugeRadius = 70;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const progress = readinessScore !== null ? (animatedScore / 100) : 0;
  const strokeDashoffset = gaugeCircumference * (1 - progress * 0.75); // 270 degrees = 0.75 of circle

  // Status badge colors
  const getStatusBadgeStyles = () => {
    if (readinessScore === null) return 'bg-muted text-muted-foreground';
    if (readinessScore >= 75) return 'bg-success/15 text-success border border-success/30';
    if (readinessScore >= 55) return 'bg-primary/15 text-primary border border-primary/30';
    if (readinessScore >= 35) return 'bg-warning/15 text-warning border border-warning/30';
    return 'bg-destructive/15 text-destructive border border-destructive/30';
  };

  // Velocity component (10% weight) - calculate from todayCount
  const velocityComponent = Math.min(10, Math.round((todayCount / dailyGoal) * 10));

  const breakdownItems = [
    { label: 'Accuracy', value: accuracyComponent, max: 45, color: 'bg-primary', icon: Target },
    { label: 'Consistency', value: consistencyComponent, max: 25, color: 'bg-accent', icon: Flame },
    { label: 'Coverage', value: coverageComponent, max: 20, color: 'bg-success', icon: BarChart3 },
    { label: 'Velocity', value: velocityComponent, max: 10, color: 'bg-warning', icon: Zap },
  ];

  return (
    <div 
      className={cn(
        "bg-card border border-border rounded-3xl shadow-lg overflow-hidden transition-all duration-300",
        isExpanded && "shadow-xl"
      )}
    >
      <div 
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-4">
          {/* Circular Progress Ring */}
          <div className="relative shrink-0">
            <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-[135deg]">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r={gaugeRadius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={gaugeCircumference * 0.75}
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(0, 72%, 51%)" />
                  <stop offset="40%" stopColor="hsl(38, 92%, 50%)" />
                  <stop offset="70%" stopColor="hsl(45, 93%, 47%)" />
                  <stop offset="100%" stopColor="hsl(160, 60%, 45%)" />
                </linearGradient>
              </defs>
              {/* Progress arc */}
              <circle
                cx="80"
                cy="80"
                r={gaugeRadius}
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={gaugeCircumference * 0.75}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
                style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.4))' }}
              />
            </svg>
            
            {/* Score in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-foreground tracking-tight animate-fade-in">
                {readinessScore !== null ? animatedScore : '—'}
              </span>
              <span className="text-xs text-muted-foreground font-medium mt-1">
                Your Readiness
              </span>
            </div>
            
            {/* Pulse animation ring */}
            {readinessScore !== null && readinessScore >= 75 && (
              <div className="absolute inset-0 rounded-full border-2 border-success/30 animate-pulse-ring" />
            )}
          </div>

          {/* Right side - Status and insights */}
          <div className="flex-1 pt-2 space-y-3">
            {/* Status Badge */}
            <div className={cn("inline-flex px-3 py-1.5 rounded-full text-xs font-semibold", getStatusBadgeStyles())}>
              {statusText}
            </div>

            {/* Weekly trend */}
            {weeklyTrend !== null && weeklyTrend !== 0 && (
              <div className={cn(
                "flex items-center gap-1.5 text-sm font-medium",
                weeklyTrend > 0 ? "text-success" : "text-destructive"
              )}>
                {weeklyTrend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{weeklyTrend > 0 ? '+' : ''}{weeklyTrend}% vs last week</span>
              </div>
            )}

            {/* Quick insights */}
            <div className="space-y-1.5">
              {questionsToGoal > 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-primary" />
                  {questionsToGoal} more to hit daily goal
                </p>
              )}
              {questionsToGoal === 0 && (
                <p className="text-xs text-success flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  Daily goal complete! 🎉
                </p>
              )}
              {daysUntilExam !== null && daysUntilExam > 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-warning" />
                  {daysUntilExam} days until exam
                </p>
              )}
            </div>

            {/* Expand indicator */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{isExpanded ? 'Hide breakdown' : 'Tap to see breakdown'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable breakdown */}
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-out",
        isExpanded ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-6 pb-6 pt-2 border-t border-border space-y-4">
          <h4 className="text-sm font-semibold text-foreground">How your score is calculated</h4>
          
          <div className="space-y-3">
            {breakdownItems.map((item) => {
              const Icon = item.icon;
              const percentage = (item.value / item.max) * 100;
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{item.label} ({item.max}%)</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{item.value}/{item.max}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-700 ease-out", item.color)}
                      style={{ width: showBars ? `${percentage}%` : '0%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
