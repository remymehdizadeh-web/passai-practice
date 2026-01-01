import { X, Bell, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartReminderBannerProps {
  message: string;
  onDismiss: () => void;
  onStartPractice: () => void;
}

export function SmartReminderBanner({ message, onDismiss, onStartPractice }: SmartReminderBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="max-w-lg mx-auto p-3">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-primary-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary-foreground mb-2">
                {message}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={onStartPractice}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-xs font-medium text-primary-foreground"
                >
                  <Play className="w-3 h-3" />
                  Start Now
                </button>
                <button
                  onClick={onDismiss}
                  className="px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-xs text-primary-foreground/80"
                >
                  Later
                </button>
              </div>
            </div>

            <button
              onClick={onDismiss}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-primary-foreground/60" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
