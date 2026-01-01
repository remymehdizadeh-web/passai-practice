import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Brain, Clock, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartInsightsBoxProps {
  readinessScore: number | null;
  accuracy: number;
  streakDays: number;
  weakestCategory: string | null;
  todayCount: number;
  dailyGoal: number;
}

export function SmartInsightsBox({
  readinessScore,
  accuracy,
  streakDays,
  weakestCategory,
  todayCount,
  dailyGoal,
}: SmartInsightsBoxProps) {
  // Start collapsed by default
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show if score is below 70 or user needs guidance
  if (readinessScore !== null && readinessScore >= 70) return null;

  // Generate personalized insights
  const insights: { icon: React.ElementType; text: string; type: 'tip' | 'encourage' | 'action' }[] = [];

  if (accuracy < 70) {
    insights.push({
      icon: Brain,
      text: 'Students who review explanations after each question score 40% higher. Take your time!',
      type: 'tip',
    });
  }

  if (streakDays >= 3) {
    insights.push({
      icon: TrendingUp,
      text: `Amazing ${streakDays}-day streak! Consistency beats intensity. Keep it up!`,
      type: 'encourage',
    });
  } else if (streakDays === 0) {
    insights.push({
      icon: Clock,
      text: 'Start your streak today! Just 10 questions a day builds lasting confidence.',
      type: 'action',
    });
  }

  if (weakestCategory) {
    insights.push({
      icon: Target,
      text: `Focus on ${weakestCategory} — targeted practice boosts overall readiness 2x faster.`,
      type: 'action',
    });
  }

  if (todayCount > 0 && todayCount < dailyGoal) {
    const remaining = dailyGoal - todayCount;
    insights.push({
      icon: Sparkles,
      text: `Just ${remaining} more question${remaining > 1 ? 's' : ''} to hit your goal. You've got this!`,
      type: 'encourage',
    });
  }

  if (insights.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <span className="text-sm font-semibold text-foreground">AI Coach</span>
            <span className="text-xs text-muted-foreground ml-2">{insights.length} tips</span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-96" : "max-h-0"
      )}>
        <div className="px-4 pb-4 space-y-2">
          {insights.slice(0, 3).map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl",
                  insight.type === 'action' && "bg-primary/5 border border-primary/10",
                  insight.type === 'tip' && "bg-warning/5 border border-warning/10",
                  insight.type === 'encourage' && "bg-success/5 border border-success/10"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4 mt-0.5 shrink-0",
                  insight.type === 'action' && "text-primary",
                  insight.type === 'tip' && "text-warning",
                  insight.type === 'encourage' && "text-success"
                )} />
                <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
