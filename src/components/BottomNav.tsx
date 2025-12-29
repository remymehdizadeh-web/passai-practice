import { Play, BookMarked, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'practice' | 'review' | 'settings';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems = [
  { id: 'practice' as Tab, label: 'Practice', icon: Play },
  { id: 'review' as Tab, label: 'Review', icon: BookMarked },
  { id: 'settings' as Tab, label: 'Settings', icon: Settings },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-t border-border safe-bottom">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-5 rounded-xl transition-all duration-150',
                isActive
                  ? 'text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'p-2 rounded-xl transition-all duration-150',
                isActive && 'bg-accent/10'
              )}>
                <item.icon className={cn(
                  'w-5 h-5 transition-transform duration-150',
                  isActive && 'scale-110'
                )} />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
