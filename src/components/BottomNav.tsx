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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
      <div className="flex items-center justify-around py-3 px-6 max-w-lg mx-auto safe-bottom">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center gap-1.5 py-1.5 px-4 transition-colors duration-150',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn(
                'w-5 h-5',
                isActive && 'text-primary'
              )} />
              <span className={cn(
                'text-[11px] font-medium tracking-wide',
                isActive && 'text-primary'
              )}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}