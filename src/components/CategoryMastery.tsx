import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface CategoryData {
  category: string;
  accuracy: number;
  total: number;
  correct: number;
}

interface CategoryMasteryProps {
  categories: CategoryData[];
  onCategoryClick?: (category: string) => void;
  compact?: boolean;
}

type ConfidenceLevel = 'strong' | 'solid' | 'building' | 'low' | 'none';

function getConfidenceLevel(accuracy: number, total: number): ConfidenceLevel {
  if (total === 0) return 'none';
  if (total < 5) return 'building';
  if (accuracy >= 85) return 'strong';
  if (accuracy >= 70) return 'solid';
  if (accuracy >= 55) return 'building';
  return 'low';
}

function getConfidenceLabel(level: ConfidenceLevel): string {
  switch (level) {
    case 'strong': return 'Strong';
    case 'solid': return 'Solid';
    case 'building': return 'Building';
    case 'low': return 'Needs Work';
    case 'none': return 'Not Started';
  }
}

function getConfidenceColor(level: ConfidenceLevel): string {
  switch (level) {
    case 'strong': return 'text-emerald-500';
    case 'solid': return 'text-blue-500';
    case 'building': return 'text-amber-500';
    case 'low': return 'text-destructive';
    case 'none': return 'text-muted-foreground';
  }
}

function getBarColor(level: ConfidenceLevel): string {
  switch (level) {
    case 'strong': return 'bg-emerald-500';
    case 'solid': return 'bg-blue-500';
    case 'building': return 'bg-amber-500';
    case 'low': return 'bg-destructive';
    case 'none': return 'bg-muted';
  }
}

function ConfidenceIcon({ level }: { level: ConfidenceLevel }) {
  if (level === 'strong' || level === 'solid') {
    return <CheckCircle2 className={cn("w-4 h-4", getConfidenceColor(level))} />;
  }
  if (level === 'low') {
    return <AlertCircle className="w-4 h-4 text-destructive" />;
  }
  return <Circle className="w-4 h-4 text-muted-foreground" />;
}

export function CategoryMastery({ categories, onCategoryClick, compact = false }: CategoryMasteryProps) {
  const sortedCategories = [...categories].sort((a, b) => {
    const levelOrder: Record<ConfidenceLevel, number> = {
      'low': 0, 'building': 1, 'none': 2, 'solid': 3, 'strong': 4
    };
    const levelA = getConfidenceLevel(a.accuracy, a.total);
    const levelB = getConfidenceLevel(b.accuracy, b.total);
    return levelOrder[levelA] - levelOrder[levelB];
  });

  const weakAreas = sortedCategories.filter(c => {
    const level = getConfidenceLevel(c.accuracy, c.total);
    return level === 'low' || level === 'building';
  });

  const displayCategories = compact ? sortedCategories.slice(0, 4) : sortedCategories;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className={cn("border-b border-border", compact ? "p-3" : "p-4")}>
        <div className="flex items-center justify-between">
          <p className={cn("font-semibold text-foreground", compact ? "text-xs" : "text-sm")}>
            Category Mastery
          </p>
          {weakAreas.length > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {weakAreas.length} to focus
            </span>
          )}
        </div>
      </div>

      <div className="divide-y divide-border">
        {displayCategories.map(({ category, accuracy, total }) => {
          const level = getConfidenceLevel(accuracy, total);
          
          return (
            <button
              key={category}
              onClick={() => onCategoryClick?.(category)}
              className={cn(
                "w-full flex items-center gap-2 hover:bg-muted/30 transition-colors text-left",
                compact ? "p-2.5" : "p-4"
              )}
            >
              <ConfidenceIcon level={level} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "font-medium text-foreground truncate pr-2",
                    compact ? "text-xs" : "text-sm"
                  )}>
                    {compact ? category.split(' ').slice(0, 2).join(' ') : category}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={cn("text-[10px] font-medium", getConfidenceColor(level))}>
                      {getConfidenceLabel(level)}
                    </span>
                    {total > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {accuracy}%
                      </span>
                    )}
                  </div>
                </div>
                
                <div className={cn("bg-muted rounded-full overflow-hidden", compact ? "h-1" : "h-1.5")}>
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      getBarColor(level)
                    )}
                    style={{ width: total === 0 ? '0%' : `${Math.max(accuracy, 5)}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {compact && sortedCategories.length > 4 && (
        <div className="p-2 text-center border-t border-border">
          <span className="text-[10px] text-muted-foreground">
            +{sortedCategories.length - 4} more in Review
          </span>
        </div>
      )}
    </div>
  );
}
