import { useState, useEffect } from 'react';
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
import { hasSeenOnboarding, markOnboardingSeen } from '@/lib/session';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useSmartReminders } from '@/hooks/useSmartReminders';
import { Helmet } from 'react-helmet';

type ReviewFilter = 'bookmarked' | 'missed';

const Index = () => {
  const [showSplash, setShowSplash] = useState(!hasSeenOnboarding());
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWeakAreaMode, setShowWeakAreaMode] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('bookmarked');
  
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { reminder, dismissReminder } = useSmartReminders();

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
    return (
      <>
        <Helmet>
          <title>NCLEX RN Go - Master Your NCLEX-RN Exam</title>
          <meta name="description" content="Comprehensive NCLEX-RN practice for nursing students. Study with confidence using expert-crafted questions." />
        </Helmet>
        <SplashScreen onStart={handleStart} />
      </>
    );
  }

  if (showOnboarding) {
    return (
      <>
        <Helmet>
          <title>Welcome - NCLEX RN Go</title>
          <meta name="description" content="Set up your NCLEX study plan" />
        </Helmet>
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>NCLEX RN Go - Practice</title>
        <meta name="description" content="Practice NCLEX-RN questions with detailed explanations. Master your nursing exam with expert-crafted content." />
      </Helmet>
      
      {/* Smart Reminder Banner */}
      {reminder?.shouldRemind && reminder.message && (
        <SmartReminderBanner
          message={reminder.message}
          onDismiss={dismissReminder}
          onStartPractice={handleReminderPractice}
        />
      )}
      
      <div className="min-h-screen bg-background">
        <main className="max-w-lg mx-auto px-4 pt-6 pb-20">
          {activeTab === 'home' && (
            <HomeView 
              onNavigate={handleNavigate} 
              onOpenWeakArea={handleOpenWeakArea}
            />
          )}
          {activeTab === 'practice' && <PracticeView />}
          {activeTab === 'review' && <ReviewView initialFilter={reviewFilter} />}
          {activeTab === 'stats' && <StatsView />}
          {activeTab === 'account' && <SettingsView onNavigateToStats={() => setActiveTab('stats')} />}
        </main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Weak Area Mode Overlay */}
        {showWeakAreaMode && (
          <WeakAreaMode onClose={() => setShowWeakAreaMode(false)} />
        )}
      </div>
    </>
  );
};

export default Index;