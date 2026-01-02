import { BookOpen, RotateCcw, Calendar, BarChart3, User, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Tab = 'home' | 'practice' | 'review' | 'plan' | 'stats' | 'account';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems = [
  { id: 'home' as Tab, label: 'Home', icon: Home, color: 'text-primary' },
  { id: 'practice' as Tab, label: 'Practice', icon: BookOpen, color: 'text-teal-500' },
  { id: 'review' as Tab, label: 'Review', icon: RotateCcw, color: 'text-orange-500' },
  { id: 'stats' as Tab, label: 'Stats', icon: BarChart3, color: 'text-violet-500' },
  { id: 'account' as Tab, label: 'Account', icon: User, color: 'text-blue-500' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]"
      style={{ 
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex items-center justify-around py-1.5 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 py-2.5 px-4 rounded-xl transition-all duration-200',
                'min-h-[52px] min-w-[52px]', // Touch target size
                'active:scale-95 will-change-transform', // GPU-accelerated press feedback
                isActive
                  ? item.color
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {/* Active glow effect */}
              {isActive && (
                <div className={cn(
                  "absolute inset-0 rounded-xl opacity-15 will-change-opacity transition-opacity",
                  item.id === 'home' && "bg-primary",
                  item.id === 'practice' && "bg-teal-500",
                  item.id === 'review' && "bg-orange-500",
                  item.id === 'stats' && "bg-violet-500",
                  item.id === 'account' && "bg-blue-500"
                )} />
              )}
              <div className="relative">
                <item.icon 
                  className={cn(
                    "w-5 h-5 transition-transform duration-200 will-change-transform", 
                    isActive && "scale-110"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                {/* Glow dot */}
                {isActive && (
                  <div className={cn(
                    "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full shadow-lg",
                    item.id === 'home' && "bg-primary",
                    item.id === 'practice' && "bg-teal-500",
                    item.id === 'review' && "bg-orange-500",
                    item.id === 'stats' && "bg-violet-500",
                    item.id === 'account' && "bg-blue-500"
                  )} />
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