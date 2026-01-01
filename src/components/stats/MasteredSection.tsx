import { CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryData {
  category: string;
  shortName: string;
  accuracy: number;
  icon: React.ElementType;
}

interface MasteredSectionProps {
  areas: CategoryData[];
  onCategoryTap: (category: string) => void;
}

export function MasteredSection({ areas, onCategoryTap }: MasteredSectionProps) {
  if (areas.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <CheckCircle2 className="w-4 h-4 text-success" />
        <h3 className="text-sm font-semibold text-foreground">Mastered</h3>
        <Sparkles className="w-3 h-3 text-warning" />
      </div>
      
      <div className="bg-gradient-to-br from-success/10 via-success/5 to-primary/10 border border-success/20 rounded-2xl p-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {areas.map((area) => {
            const Icon = area.icon;
            return (
              <button
                key={area.category}
                onClick={() => onCategoryTap(area.category)}
                className={cn(
                  "shrink-0 bg-card hover:bg-success/10 border border-success/30",
                  "rounded-xl p-3 min-w-[100px] transition-all duration-200",
                  "active:scale-[0.98] group"
                )}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center group-hover:bg-success/25 transition-colors">
                    <Icon className="w-5 h-5 text-success" />
                  </div>
                  <p className="text-xs font-medium text-foreground text-center truncate max-w-full">
                    {area.shortName}
                  </p>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-success/20 rounded-full">
                    <span className="text-[10px] font-bold text-success">{area.accuracy}%</span>
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
