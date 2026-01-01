import { BookOpen, RotateCcw, Calendar, BarChart3, User, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Tab = 'home' | 'practice' | 'review' | 'plan' | 'stats' | 'account';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems = [
  { id: 'home' as Tab, label: 'Home', icon: Home },
  { id: 'practice' as Tab, label: 'Practice', icon: BookOpen },
  { id: 'review' as Tab, label: 'Review', icon: RotateCcw },
  { id: 'stats' as Tab, label: 'Stats', icon: BarChart3 },
  { id: 'account' as Tab, label: 'Account', icon: User },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto safe-bottom">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'relative flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {/* Active glow effect */}
              {isActive && (
                <div className="absolute inset-0 bg-primary/10 rounded-xl" />
              )}
              <div className="relative">
                <item.icon 
                  className={cn(
                    "w-5 h-5 transition-transform duration-200", 
                    isActive && "scale-110"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                {/* Glow dot */}
                {isActive && (
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_2px_hsl(var(--primary)/0.5)]" />
                )}
              </div>
              <span className={cn(
                "relative text-[10px] transition-all duration-200", 
                isActive ? "font-semibold" : "font-medium"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}