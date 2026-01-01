import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Flame, BarChart3, BookOpen, ChevronRight } from 'lucide-react';
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

  // Animate score
  useEffect(() => {
    if (readinessScore !== null) {
      const duration = 800;
      const steps = 40;
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

  // Calculate arc for semi-circle gauge
  const gaugeRadius = 50;
  const gaugeCircumference = Math.PI * gaugeRadius; // Half circle
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

  const getStatusBadgeStyles = () => {
    if (readinessScore === null) return 'bg-muted text-muted-foreground';
    if (readinessScore >= 80) return 'bg-success/15 text-success';
    if (readinessScore >= 65) return 'bg-primary/15 text-primary';
    if (readinessScore >= 45) return 'bg-warning/15 text-warning';
    return 'bg-destructive/15 text-destructive';
  };

  const breakdownItems = [
    { label: 'Accuracy', value: accuracyComponent, max: 60, color: 'bg-primary' },
    { label: 'Volume', value: volumeComponent, max: 20, color: 'bg-accent' },
    { label: 'Streak', value: consistencyComponent, max: 10, color: 'bg-success' },
    { label: 'Coverage', value: coverageComponent, max: 10, color: 'bg-warning' },
  ];

  return (
    <div 
      className="relative bg-card border border-border rounded-2xl p-4 cursor-pointer hover:border-primary/30 transition-colors"
      onClick={() => navigate('/', { state: { tab: 'practice' } })}
    >
      <div className="flex items-center gap-4">
        {/* Compact Semi-Circle Gauge */}
        <div className="relative flex-shrink-0">
          <svg width="100" height="60" viewBox="0 0 120 70">
            {/* Background arc */}
            <path
              d="M 10 60 A 50 50 0 0 1 110 60"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <path
              d="M 10 60 A 50 50 0 0 1 110 60"
              fill="none"
              stroke={getScoreColor()}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={gaugeCircumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
              style={{
                filter: `drop-shadow(0 0 6px ${getScoreColor()})`,
              }}
            />
            {/* Score text */}
            <text
              x="60"
              y="50"
              textAnchor="middle"
              className="fill-foreground font-black"
              style={{ fontSize: '24px' }}
            >
              {readinessScore !== null ? animatedScore : '—'}
            </text>
            <text
              x="60"
              y="65"
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              / 100
            </text>
          </svg>
        </div>

        {/* Right side content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-foreground">Readiness Score</h3>
            <span className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              getStatusBadgeStyles()
            )}>
              {statusText}
            </span>
          </div>
          
          {/* Trend indicator */}
          {weeklyTrend !== null && weeklyTrend !== 0 && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium mb-2",
              weeklyTrend > 0 ? "text-success" : "text-destructive"
            )}>
              {weeklyTrend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{weeklyTrend > 0 ? '+' : ''}{weeklyTrend}% this week</span>
            </div>
          )}

          {/* Compact breakdown bars */}
          <div className="flex gap-1">
            {breakdownItems.map((item) => {
              const percentage = (item.value / item.max) * 100;
              return (
                <div key={item.label} className="flex-1">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-500", item.color)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-1 mt-1">
            {breakdownItems.map((item) => (
              <span key={item.label} className="flex-1 text-[9px] text-muted-foreground text-center truncate">
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Arrow indicator */}
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </div>

      {/* Goal message */}
      {readinessScore !== null && readinessScore < 80 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            🎯 <span className="font-medium text-foreground">{80 - readinessScore} points</span> to Exam Ready status
          </p>
        </div>
      )}
      {readinessScore !== null && readinessScore >= 80 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-success text-center font-medium">
            ✨ You're exam ready! Keep practicing to maintain your score.
          </p>
        </div>
      )}
    </div>
  );
}
