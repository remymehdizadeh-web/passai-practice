import { useAchievements } from '@/hooks/useAchievements';
import { cn } from '@/lib/utils';
import { Award } from 'lucide-react';

interface FullAchievementsProps {
  compact?: boolean;
}

export function FullAchievements({ compact }: FullAchievementsProps) {
  const { all, unlockedCount, totalCount } = useAchievements();

  const displayAchievements = compact ? all.slice(0, 6) : all;

  return (
    <div className="card-organic p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <p className="font-semibold text-sm text-foreground">Achievements</p>
        </div>
        <span className="text-xs text-muted-foreground">
          {unlockedCount}/{totalCount} unlocked
        </span>
      </div>
      
      <div className={cn("grid gap-2", compact ? "grid-cols-3" : "grid-cols-3")}>
        {displayAchievements.map((achievement) => {
          const Icon = achievement.icon;
          const progressPercent = achievement.total 
            ? Math.round((achievement.progress || 0) / achievement.total * 100)
            : 0;
          
          return (
            <div
              key={achievement.id}
              className={cn(
                "relative p-3 rounded-xl text-center transition-all",
                achievement.unlocked 
                  ? "bg-primary/5 border border-primary/20" 
                  : "bg-muted/30 opacity-60"
              )}
            >
              {/* Tier indicator */}
              {achievement.unlocked && achievement.tier && (
                <div className={cn(
                  "absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold",
                  achievement.tier === 'gold' && "bg-yellow-500 text-yellow-950",
                  achievement.tier === 'silver' && "bg-slate-400 text-slate-950",
                  achievement.tier === 'bronze' && "bg-amber-600 text-amber-950"
                )}>
                  {achievement.tier === 'gold' ? '★' : achievement.tier === 'silver' ? '◆' : '●'}
                </div>
              )}
              
              <div className={cn(
                "w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center",
                achievement.unlocked ? "bg-primary/10" : "bg-muted"
              )}>
                <Icon className={cn(
                  "w-4 h-4",
                  achievement.unlocked ? achievement.color : "text-muted-foreground"
                )} />
              </div>
              <p className="text-[10px] font-medium text-foreground truncate">
                {achievement.title}
              </p>
              <p className="text-[8px] text-muted-foreground truncate mt-0.5">
                {achievement.description}
              </p>
              {!achievement.unlocked && achievement.total && (
                <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary/50 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
