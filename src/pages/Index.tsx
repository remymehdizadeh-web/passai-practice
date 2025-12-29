import { useState, useEffect } from 'react';
import { SplashScreen } from '@/components/SplashScreen';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { BottomNav } from '@/components/BottomNav';
import { HomeView } from '@/pages/HomeView';
import { PracticeView } from '@/pages/PracticeView';
import { ReviewView } from '@/pages/ReviewView';
import { SettingsView } from '@/pages/SettingsView';
import { hasSeenOnboarding, markOnboardingSeen } from '@/lib/session';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Helmet } from 'react-helmet';

type Tab = 'home' | 'practice' | 'review' | 'settings';
type ReviewFilter = 'bookmarked' | 'missed';

const Index = () => {
  const [showSplash, setShowSplash] = useState(!hasSeenOnboarding());
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('practice');
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('bookmarked');
  
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

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

  if (showSplash) {
    return (
      <>
        <Helmet>
          <title>NCLEX RN Pro - Master Your NCLEX-RN Exam</title>
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
          <title>Welcome - NCLEX RN Pro</title>
          <meta name="description" content="Set up your NCLEX study plan" />
        </Helmet>
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>NCLEX RN Pro - Practice</title>
        <meta name="description" content="Practice NCLEX-RN questions with detailed explanations. Master your nursing exam with expert-crafted content." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <main className="max-w-lg mx-auto px-4 pt-6 pb-20">
          {activeTab === 'home' && <HomeView onNavigate={handleNavigate} />}
          {activeTab === 'practice' && <PracticeView />}
          {activeTab === 'review' && <ReviewView initialFilter={reviewFilter} />}
          {activeTab === 'settings' && <SettingsView />}
        </main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </>
  );
};

export default Index;
