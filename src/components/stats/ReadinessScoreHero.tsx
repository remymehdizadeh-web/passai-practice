import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Target, Flame, BarChart3, BookOpen, Sparkles, Zap } from 'lucide-react';
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
  const gaugeRadius = 70;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const progress = readinessScore !== null ? (animatedScore / 100) : 0;
  const strokeDashoffset = gaugeCircumference * (1 - progress);

  // Get color based on score
  const getScoreColor = () => {
    if (readinessScore === null) return 'hsl(var(--muted-foreground))';
    if (readinessScore >= 80) return 'hsl(var(--success))';
    if (readinessScore >= 65) return 'hsl(var(--primary))';
    if (readinessScore >= 45) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  // Status badge colors
  const getStatusBadgeStyles = () => {
    if (readinessScore === null) return 'bg-muted text-muted-foreground';
    if (readinessScore >= 80) return 'bg-success/20 text-success border border-success/30';
    if (readinessScore >= 65) return 'bg-primary/20 text-primary border border-primary/30';
    if (readinessScore >= 45) return 'bg-warning/20 text-warning border border-warning/30';
    return 'bg-destructive/20 text-destructive border border-destructive/30';
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
        "relative overflow-hidden rounded-2xl transition-all duration-300",
        isExpanded && "shadow-xl"
      )}
    >
      {/* Gradient background with animated glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
      
      {/* Animated sparkle effect */}
      <div className="absolute top-4 right-4 opacity-50">
        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
      </div>
      
      {/* Border glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-2xl border-2 transition-all duration-300",
        readinessScore !== null && readinessScore >= 80 
          ? "border-success/40 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
          : readinessScore !== null && readinessScore >= 65
          ? "border-primary/40 shadow-[0_0_30px_rgba(var(--primary),0.2)]"
          : readinessScore !== null && readinessScore >= 45
          ? "border-warning/40 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
          : "border-border"
      )} />

      <div className="relative p-6">
        <div 
          className="cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex flex-col items-center text-center">
            {/* Large Circular Progress Ring */}
            <div className="relative mb-4">
              <svg width="160" height="160" viewBox="0 0 160 160">
                {/* Outer decorative ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="76"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.5"
                />
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r={gaugeRadius}
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="10"
                />
                {/* Progress arc with gradient effect */}
                <circle
                  cx="80"
                  cy="80"
                  r={gaugeRadius}
                  fill="none"
                  stroke={getScoreColor()}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={gaugeCircumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out drop-shadow-lg"
                  style={{ 
                    transform: 'rotate(-90deg)',
                    transformOrigin: '80px 80px',
                    filter: `drop-shadow(0 0 8px ${getScoreColor()})`,
                  }}
                />
                {/* Inner glow circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="55"
                  fill="hsl(var(--background))"
                  opacity="0.8"
                />
              </svg>
              
              {/* Score in center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-5xl font-black text-foreground tracking-tight">
                    {readinessScore !== null ? animatedScore : '—'}
                  </span>
                  {readinessScore !== null && (
                    <span className="text-lg font-bold text-muted-foreground">%</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Readiness
                </span>
              </div>
            </div>

            {/* Status Badge - Larger and more prominent */}
            <div className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold mb-3",
              getStatusBadgeStyles()
            )}>
              <Zap className="w-4 h-4" />
              {statusText}
            </div>

            {/* Weekly trend */}
            {weeklyTrend !== null && weeklyTrend !== 0 && (
              <div className={cn(
                "flex items-center gap-1.5 text-sm font-semibold mb-3",
                weeklyTrend > 0 ? "text-success" : "text-destructive"
              )}>
                {weeklyTrend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{weeklyTrend > 0 ? '+' : ''}{weeklyTrend}% vs last week</span>
              </div>
            )}

            {/* Quick insights */}
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {daysUntilExam !== null && daysUntilExam > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-warning/10 rounded-full">
                  <span className="text-warning">⏰</span>
                  <span className="text-xs font-medium text-warning">{daysUntilExam} days until exam</span>
                </div>
              )}
              {questionsToGoal > 0 ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full">
                  <span className="text-primary">🎯</span>
                  <span className="text-xs font-medium text-primary">{questionsToGoal} more to hit goal</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 rounded-full">
                  <span>✅</span>
                  <span className="text-xs font-medium text-success">Daily goal complete!</span>
                </div>
              )}
            </div>

            {/* Expand indicator */}
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1 px-3 rounded-full bg-muted/50 hover:bg-muted">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{isExpanded ? 'Hide' : 'See'} breakdown</span>
            </button>
          </div>
        </div>

        {/* Expandable breakdown */}
        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          isExpanded ? "max-h-72 opacity-100 mt-5" : "max-h-0 opacity-0"
        )}>
          <div className="pt-4 border-t border-border space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Score Breakdown</h4>
            
            <div className="space-y-3">
              {breakdownItems.map((item) => {
                const Icon = item.icon;
                const percentage = (item.value / item.max) * 100;
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", `${item.color}/20`)}>
                          <Icon className={cn("w-3.5 h-3.5", item.color.replace('bg-', 'text-'))} />
                        </div>
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                        <span className="text-xs text-muted-foreground">({item.max}%)</span>
                      </div>
                      <span className="text-sm font-bold text-foreground">{item.value}/{item.max}</span>
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
    </div>
  );
}
