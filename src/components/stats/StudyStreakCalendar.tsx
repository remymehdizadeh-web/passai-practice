import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DayActivity {
  date: string;
  count: number;
}

interface StudyStreakCalendarProps {
  streakDays: number;
  activityData: DayActivity[];
}

export function StudyStreakCalendar({ streakDays, activityData }: StudyStreakCalendarProps) {
  // Generate last 30 days
  const last30Days: { date: string; count: number; dayOfWeek: number }[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const activity = activityData.find(a => a.date === dateStr);
    last30Days.push({
      date: dateStr,
      count: activity?.count || 0,
      dayOfWeek: date.getDay(),
    });
  }

  // Get intensity class based on count
  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-muted';
    if (count <= 5) return 'bg-success/30';
    if (count <= 10) return 'bg-success/50';
    if (count <= 20) return 'bg-success/70';
    return 'bg-success';
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-foreground">Study Activity</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-accent/10 rounded-full">
          <span className="text-xs font-bold text-accent">{streakDays}</span>
          <span className="text-xs text-muted-foreground">day streak</span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="space-y-1.5">
        <div className="grid grid-cols-10 gap-1">
          {last30Days.map((day, index) => (
            <div
              key={day.date}
              className={cn(
                "aspect-square rounded-sm transition-all duration-200 hover:ring-2 hover:ring-primary/30",
                getIntensityClass(day.count)
              )}
              title={`${day.date}: ${day.count} questions`}
            />
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] text-muted-foreground">30 days ago</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">Less</span>
            <div className="flex gap-0.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-muted" />
              <div className="w-2.5 h-2.5 rounded-sm bg-success/30" />
              <div className="w-2.5 h-2.5 rounded-sm bg-success/50" />
              <div className="w-2.5 h-2.5 rounded-sm bg-success/70" />
              <div className="w-2.5 h-2.5 rounded-sm bg-success" />
            </div>
            <span className="text-[10px] text-muted-foreground">More</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Today</span>
        </div>
      </div>
    </div>
  );
}
