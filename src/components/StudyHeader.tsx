import { Flame, Calendar, ChevronRight } from 'lucide-react';
import { useProfile, calculateDaysUntilExam } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface StudyHeaderProps {
  onExamDateClick?: () => void;
}

export function StudyHeader({ onExamDateClick }: StudyHeaderProps) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  
  const daysUntilExam = calculateDaysUntilExam(profile?.exam_date || null);
  const streakDays = profile?.streak_days || 0;

  if (!user) return null;

  return (
    <div className="flex items-center justify-between mb-5">
      {/* Streak */}
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
          streakDays > 0 ? "bg-orange-500/10" : "bg-muted"
        )}>
          <Flame className={cn(
            "w-4 h-4",
            streakDays > 0 ? "text-orange-500" : "text-muted-foreground"
          )} />
          <span className={cn(
            "text-sm font-semibold",
            streakDays > 0 ? "text-orange-500" : "text-muted-foreground"
          )}>
            {streakDays}
          </span>
        </div>
        {streakDays > 0 && (
          <span className="text-xs text-muted-foreground">day streak</span>
        )}
      </div>
      
      {/* Exam Countdown */}
      <button
        onClick={onExamDateClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
      >
        <Calendar className="w-4 h-4 text-muted-foreground" />
        {daysUntilExam !== null ? (
          <>
            <span className={cn(
              "text-sm font-semibold",
              daysUntilExam <= 7 ? "text-destructive" : 
              daysUntilExam <= 30 ? "text-amber-500" : "text-foreground"
            )}>
              {daysUntilExam}
            </span>
            <span className="text-xs text-muted-foreground">days</span>
          </>
        ) : (
          <>
            <span className="text-xs text-muted-foreground">Set exam date</span>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          </>
        )}
      </button>
    </div>
  );
}