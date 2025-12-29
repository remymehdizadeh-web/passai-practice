import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PointsDisplayProps {
  points: number;
  className?: string;
}

export function PointsDisplay({ points, className }: PointsDisplayProps) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10",
      className
    )}>
      <Zap className="w-4 h-4 text-primary fill-primary" />
      <span className="text-sm font-bold text-primary">{points.toLocaleString()}</span>
    </div>
  );
}