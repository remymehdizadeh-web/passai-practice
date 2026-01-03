import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { SplashScreen } from '@/components/SplashScreen';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { BottomNav, type Tab } from '@/components/BottomNav';
import { HomeView } from '@/pages/HomeView';
import { PracticeView } from '@/pages/PracticeView';
import { ReviewView } from '@/pages/ReviewView';
import { StatsView } from '@/pages/StatsView';
import { SettingsView } from '@/pages/SettingsView';
import { WeakAreaMode } from '@/components/WeakAreaMode';
import { SmartReminderBanner } from '@/components/SmartReminderBanner';
import { PageTransition } from '@/components/ui/page-transition';
import { hasSeenOnboarding, markOnboardingSeen } from '@/lib/session';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useSmartReminders } from '@/hooks/useSmartReminders';

type ReviewFilter = 'bookmarked' | 'missed';

const Index = () => {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(!hasSeenOnboarding());
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWeakAreaMode, setShowWeakAreaMode] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('bookmarked');
  
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { reminder, dismissReminder } = useSmartReminders();

  // Scroll to top whenever active tab changes
  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);

  // Handle navigation from location state (e.g., from ReadinessGauge click)
  useEffect(() => {
    const state = location.state as { tab?: Tab } | null;
    if (state?.tab) {
      setActiveTab(state.tab);
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Check if new user needs onboarding (signed in but no exam_date or goal set)
  useEffect(() => {
    if (user && !profileLoading && profile) {
      const needsOnboarding = !profile.exam_date && profile.study_goal_daily === 10;
      if (needsOnboarding && !showSplash) {
        setShowOnboarding(true);
      }
    }
  }, [user, profile, profileLoading, showSplash]);

  const handleStart = () => {
    markOnboardingSeen();
    setShowSplash(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleNavigate = (tab: 'practice' | 'review', filter?: ReviewFilter) => {
    setActiveTab(tab);
    if (tab === 'review' && filter) {
      setReviewFilter(filter);
    }
  };

  const handleOpenWeakArea = () => {
    setShowWeakAreaMode(true);
  };

  const handleReminderPractice = () => {
    dismissReminder();
    setActiveTab('practice');
  };

  if (showSplash) {
    return <SplashScreen onStart={handleStart} />;
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <>
      {/* Smart Reminder Banner */}
      {reminder?.shouldRemind && reminder.message && (
        <SmartReminderBanner
          message={reminder.message}
          onDismiss={dismissReminder}
          onStartPractice={handleReminderPractice}
        />
      )}
      
      <div className="flex flex-col h-[100dvh] bg-background overflow-hidden">
        <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-none max-w-lg mx-auto w-full px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-28">
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === 'home' && (
              <PageTransition key="home">
                <HomeView 
                  onNavigate={handleNavigate} 
                  onOpenWeakArea={handleOpenWeakArea}
                />
              </PageTransition>
            )}
            {activeTab === 'practice' && (
              <PageTransition key="practice">
                <PracticeView />
              </PageTransition>
            )}
            {activeTab === 'review' && (
              <PageTransition key="review">
                <ReviewView initialFilter={reviewFilter} />
              </PageTransition>
            )}
            {activeTab === 'stats' && (
              <PageTransition key="stats">
                <StatsView />
              </PageTransition>
            )}
            {activeTab === 'account' && (
              <PageTransition key="account">
                <SettingsView onNavigateToStats={() => setActiveTab('stats')} />
              </PageTransition>
            )}
          </AnimatePresence>
        </main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Weak Area Mode Overlay */}
        <AnimatePresence>
          {showWeakAreaMode && (
            <WeakAreaMode onClose={() => setShowWeakAreaMode(false)} />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Index;
