import { Home, BookOpen, RotateCcw, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'home' | 'practice' | 'review' | 'settings';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems = [
  { id: 'home' as Tab, label: 'Home', icon: Home },
  { id: 'practice' as Tab, label: 'Practice', icon: BookOpen },
  { id: 'review' as Tab, label: 'Review', icon: RotateCcw },
  { id: 'settings' as Tab, label: 'Settings', icon: Settings },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
      <div className="flex items-center justify-around py-2 px-6 max-w-lg mx-auto safe-bottom">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-5 rounded-xl transition-all duration-150',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
