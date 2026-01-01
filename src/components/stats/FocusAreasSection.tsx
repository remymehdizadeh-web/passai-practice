import { AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryData {
  category: string;
  shortName: string;
  accuracy: number;
  icon: React.ElementType;
}

interface FocusAreasSectionProps {
  areas: CategoryData[];
  onCategoryTap: (category: string) => void;
  showBars: boolean;
}

export function FocusAreasSection({ areas, onCategoryTap, showBars }: FocusAreasSectionProps) {
  if (areas.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        <h3 className="text-sm font-semibold text-foreground">Focus Areas</h3>
        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
      </div>
      
      <div className="bg-destructive/5 border border-destructive/20 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-2 gap-px bg-destructive/10">
          {areas.slice(0, 4).map((area) => {
            const Icon = area.icon;
            return (
              <button
                key={area.category}
                onClick={() => onCategoryTap(area.category)}
                className="bg-card hover:bg-destructive/5 active:bg-destructive/10 transition-all duration-200 p-4 group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-destructive" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground text-left truncate">
                    {area.shortName}
                  </p>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Mastery</span>
                      <span className={cn(
                        "text-xs font-bold",
                        area.accuracy < 50 ? "text-destructive" : "text-warning"
                      )}>
                        {area.accuracy}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-destructive to-warning rounded-full transition-all duration-1000 ease-out"
                        style={{ width: showBars ? `${area.accuracy}%` : '0%' }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
