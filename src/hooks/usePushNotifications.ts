import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface ScheduledReminder {
  id: string;
  timeoutId: NodeJS.Timeout;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scheduledReminders = useRef<ScheduledReminder[]>([]);

  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      setIsSubscribed(Notification.permission === 'granted');
    }
    
    // Cleanup on unmount
    return () => {
      scheduledReminders.current.forEach(reminder => {
        clearTimeout(reminder.timeoutId);
      });
    };
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in your browser');
      return false;
    }

    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        setIsSubscribed(true);
        toast.success('Push notifications enabled! You\'ll receive study reminders.');
        
        new Notification('NCLEX Prep', {
          body: 'Study reminders are now enabled! 📚',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
        
        return true;
      } else if (permission === 'denied') {
        toast.error('Notification permission denied. Please enable in browser settings.');
        return false;
      } else {
        toast.info('Notification permission dismissed');
        return false;
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      toast.error('Failed to enable notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      // Clear all scheduled reminders
      scheduledReminders.current.forEach(reminder => {
        clearTimeout(reminder.timeoutId);
      });
      scheduledReminders.current = [];
      
      setIsSubscribed(false);
      toast.success('Push notifications disabled');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      toast.error('Failed to disable notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSubscribed || Notification.permission !== 'granted') return;
    
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }, [isSubscribed]);

  // Schedule a reminder based on daily goal and last study time
  const scheduleStudyReminder = useCallback((
    dailyGoal: number,
    todayCount: number,
    lastStudyDate: string | null
  ) => {
    if (!isSubscribed || Notification.permission !== 'granted') return;

    // Clear existing reminders
    scheduledReminders.current.forEach(reminder => {
      clearTimeout(reminder.timeoutId);
    });
    scheduledReminders.current = [];

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const questionsRemaining = Math.max(0, dailyGoal - todayCount);
    
    // Don't schedule if goal is already met
    if (questionsRemaining === 0) return;

    // Check if user hasn't studied today and it's past noon
    const lastStudyDay = lastStudyDate?.split('T')[0];
    const hasStudiedToday = lastStudyDay === today;
    const currentHour = now.getHours();

    // Schedule reminder messages
    const reminders: { delay: number; title: string; body: string }[] = [];

    if (!hasStudiedToday) {
      // If they haven't studied today
      if (currentHour >= 12 && currentHour < 18) {
        // Afternoon reminder - 30 minutes from now
        reminders.push({
          delay: 30 * 60 * 1000,
          title: '📚 Time to Study!',
          body: `You haven't started today. ${dailyGoal} questions to hit your goal!`
        });
      } else if (currentHour >= 18 && currentHour < 21) {
        // Evening reminder - 15 minutes from now
        reminders.push({
          delay: 15 * 60 * 1000,
          title: '⏰ Don\'t Break Your Streak!',
          body: `Quick! Complete ${dailyGoal} questions before the day ends.`
        });
      }
    } else if (questionsRemaining > 0) {
      // They've studied but haven't met goal
      if (currentHour >= 18 && currentHour < 22) {
        // Evening reminder to finish goal
        reminders.push({
          delay: 60 * 60 * 1000, // 1 hour from now
          title: '🎯 Almost There!',
          body: `Just ${questionsRemaining} more questions to hit your daily goal!`
        });
      }
    }

    // Schedule all reminders
    reminders.forEach((reminder, index) => {
      const timeoutId = setTimeout(() => {
        sendNotification(reminder.title, { body: reminder.body });
      }, reminder.delay);

      scheduledReminders.current.push({
        id: `reminder-${index}`,
        timeoutId
      });
    });

    console.log(`Scheduled ${reminders.length} study reminder(s)`);
  }, [isSubscribed, sendNotification]);

  // Immediate motivation notification based on progress
  const sendMotivationNotification = useCallback((
    todayCount: number,
    dailyGoal: number,
    streakDays: number
  ) => {
    if (!isSubscribed || Notification.permission !== 'granted') return;

    if (todayCount === dailyGoal) {
      sendNotification('🎉 Daily Goal Complete!', {
        body: `Amazing! You've completed ${dailyGoal} questions today. Keep the streak going!`
      });
    } else if (todayCount === Math.floor(dailyGoal / 2)) {
      sendNotification('🔥 Halfway There!', {
        body: `${dailyGoal - todayCount} more questions to hit your goal!`
      });
    } else if (streakDays === 7) {
      sendNotification('🏆 1 Week Streak!', {
        body: 'Incredible consistency! You\'ve studied 7 days in a row.'
      });
    } else if (streakDays === 30) {
      sendNotification('👑 30 Day Streak!', {
        body: 'You\'re unstoppable! A full month of consistent studying.'
      });
    }
  }, [isSubscribed, sendNotification]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    sendNotification,
    scheduleStudyReminder,
    sendMotivationNotification,
  };
}
