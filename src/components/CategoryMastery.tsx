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
}

type ConfidenceLevel = 'strong' | 'solid' | 'building' | 'low' | 'none';

function getConfidenceLevel(accuracy: number, total: number): ConfidenceLevel {
  if (total === 0) return 'none';
  if (total < 5) return 'building'; // Not enough data
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

export function CategoryMastery({ categories, onCategoryClick }: CategoryMasteryProps) {
  // Sort by confidence level - weakest first for focus
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

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Category Mastery</p>
          {weakAreas.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {weakAreas.length} area{weakAreas.length !== 1 ? 's' : ''} to focus on
            </span>
          )}
        </div>
      </div>

      <div className="divide-y divide-border">
        {sortedCategories.map(({ category, accuracy, total }) => {
          const level = getConfidenceLevel(accuracy, total);
          
          return (
            <button
              key={category}
              onClick={() => onCategoryClick?.(category)}
              className="w-full p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left"
            >
              <ConfidenceIcon level={level} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground truncate pr-2">
                    {category}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn("text-xs font-medium", getConfidenceColor(level))}>
                      {getConfidenceLabel(level)}
                    </span>
                    {total > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {accuracy}%
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      getBarColor(level)
                    )}
                    style={{ width: total === 0 ? '0%' : `${Math.max(accuracy, 5)}%` }}
                  />
                </div>
                
                {total > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {total} questions · {Math.round((total / (categories.reduce((sum, c) => sum + c.total, 0) || 1)) * 100)}% of practice
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
