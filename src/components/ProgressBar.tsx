import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressBar({ current, total, className }: ProgressBarProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <div className={cn("progress-bar-track rounded-full", className)}>
      <div 
        className="progress-bar-fill rounded-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
