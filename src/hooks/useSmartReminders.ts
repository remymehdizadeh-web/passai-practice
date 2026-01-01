import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ReminderState {
  shouldRemind: boolean;
  message: string | null;
  isTypicalStudyDay: boolean;
  typicalStudyHour: number;
}

export function useSmartReminders() {
  const { user } = useAuth();
  const [reminder, setReminder] = useState<ReminderState | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  // Check for missed session reminder
  useEffect(() => {
    if (!user || hasChecked) return;

    const checkReminder = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('smart-reminders', {
          body: {
            user_id: user.id,
            action: 'check_missed_session'
          }
        });

        if (!error && data?.shouldRemind) {
          setReminder({
            shouldRemind: true,
            message: data.message,
            isTypicalStudyDay: data.isTypicalStudyDay,
            typicalStudyHour: data.typicalStudyHour,
          });
        }
        setHasChecked(true);
      } catch (err) {
        console.error('Failed to check reminders:', err);
        setHasChecked(true);
      }
    };

    // Check after a short delay to not block initial load
    const timer = setTimeout(checkReminder, 3000);
    return () => clearTimeout(timer);
  }, [user, hasChecked]);

  // Track study session
  const trackSession = async (questionsCompleted: number) => {
    if (!user) return;

    try {
      await supabase.functions.invoke('smart-reminders', {
        body: {
          user_id: user.id,
          action: 'track_session',
          session_data: { questions_completed: questionsCompleted }
        }
      });
    } catch (err) {
      console.error('Failed to track session:', err);
    }
  };

  const dismissReminder = () => {
    setReminder(null);
  };

  return {
    reminder,
    trackSession,
    dismissReminder,
  };
}
