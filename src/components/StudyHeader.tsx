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
    <div className="flex items-center gap-2">
      {/* Streak */}
      <div className={cn(
        "flex items-center gap-1 px-2.5 py-1.5 rounded-lg",
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
      
      {/* Exam Countdown */}
      {daysUntilExam !== null && (
        <button
          onClick={onExamDateClick}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
        >
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span className={cn(
            "text-sm font-semibold",
            daysUntilExam <= 7 ? "text-destructive" : 
            daysUntilExam <= 30 ? "text-amber-500" : "text-foreground"
          )}>
            {daysUntilExam}d
          </span>
        </button>
      )}
    </div>
  );
}