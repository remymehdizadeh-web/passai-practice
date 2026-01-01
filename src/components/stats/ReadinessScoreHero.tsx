import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Target, Flame, BarChart3, BookOpen } from 'lucide-react';
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
  volumeComponent: number;
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
  volumeComponent,
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

  // Calculate gauge path - full circle
  const gaugeRadius = 56;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const progress = readinessScore !== null ? (animatedScore / 100) : 0;
  const strokeDashoffset = gaugeCircumference * (1 - progress);

  // Status badge colors
  const getStatusBadgeStyles = () => {
    if (readinessScore === null) return 'bg-muted text-muted-foreground';
    if (readinessScore >= 80) return 'bg-success/15 text-success';
    if (readinessScore >= 65) return 'bg-primary/15 text-primary';
    if (readinessScore >= 45) return 'bg-warning/15 text-warning';
    return 'bg-destructive/15 text-destructive';
  };

  const breakdownItems = [
    { label: 'Accuracy', value: accuracyComponent, max: 60, color: 'bg-primary', icon: Target },
    { label: 'Volume', value: volumeComponent, max: 20, color: 'bg-accent', icon: BookOpen },
    { label: 'Consistency', value: consistencyComponent, max: 10, color: 'bg-success', icon: Flame },
    { label: 'Coverage', value: coverageComponent, max: 10, color: 'bg-warning', icon: BarChart3 },
  ];

  return (
    <div 
      className={cn(
        "bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-2 border-primary/20 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm",
        isExpanded && "shadow-lg border-primary/30"
      )}
    >
      <div 
        className="p-5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-5">
          {/* Circular Progress Ring - Cleaner design */}
          <div className="relative shrink-0">
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
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={gaugeCircumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
                style={{ 
                  transform: 'rotate(-90deg)',
                  transformOrigin: '60px 60px',
                }}
              />
            </svg>
            
            {/* Score in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-foreground tracking-tight">
                {readinessScore !== null ? animatedScore : '—'}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Readiness
              </span>
            </div>
          </div>

          {/* Right side - Status and insights */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Status Badge */}
            <div className={cn("inline-flex px-2.5 py-1 rounded-full text-xs font-semibold", getStatusBadgeStyles())}>
              {statusText}
            </div>

            {/* Weekly trend */}
            {weeklyTrend !== null && weeklyTrend !== 0 && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                weeklyTrend > 0 ? "text-success" : "text-destructive"
              )}>
                {weeklyTrend > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{weeklyTrend > 0 ? '+' : ''}{weeklyTrend}% vs last week</span>
              </div>
            )}

            {/* Quick insights */}
            <div className="space-y-1">
              {daysUntilExam !== null && daysUntilExam > 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="text-warning">⏰</span>
                  {daysUntilExam} days until exam
                </p>
              )}
              {questionsToGoal > 0 ? (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="text-primary">🎯</span>
                  {questionsToGoal} more to hit daily goal
                </p>
              ) : (
                <p className="text-xs text-success flex items-center gap-1.5">
                  <span>✅</span>
                  Daily goal complete!
                </p>
              )}
            </div>

            {/* Expand indicator */}
            <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{isExpanded ? 'Hide' : 'See'} breakdown</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable breakdown */}
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-out",
        isExpanded ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-5 pb-5 pt-2 border-t border-border space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Score Breakdown</h4>
          
          <div className="space-y-2.5">
            {breakdownItems.map((item) => {
              const Icon = item.icon;
              const percentage = (item.value / item.max) * 100;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-foreground">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground">({item.max}%)</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{item.value}/{item.max}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
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
