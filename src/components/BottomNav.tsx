import { BookOpen, RotateCcw, Calendar, BarChart3, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Tab = 'practice' | 'review' | 'plan' | 'stats' | 'account';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems = [
  { id: 'practice' as Tab, label: 'Practice', icon: BookOpen },
  { id: 'review' as Tab, label: 'Review', icon: RotateCcw },
  { id: 'plan' as Tab, label: 'Plan', icon: Calendar },
  { id: 'stats' as Tab, label: 'Stats', icon: BarChart3 },
  { id: 'account' as Tab, label: 'Account', icon: User },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border">
      <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto safe-bottom">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-150',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-[10px]", isActive ? "font-semibold" : "font-medium")}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}