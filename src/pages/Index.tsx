import { useState } from 'react';
import { SplashScreen } from '@/components/SplashScreen';
import { BottomNav } from '@/components/BottomNav';
import { HomeView } from '@/pages/HomeView';
import { PracticeView } from '@/pages/PracticeView';
import { ReviewView } from '@/pages/ReviewView';
import { SettingsView } from '@/pages/SettingsView';
import { hasSeenOnboarding, markOnboardingSeen } from '@/lib/session';
import { Helmet } from 'react-helmet';

type Tab = 'home' | 'practice' | 'review' | 'settings';

const Index = () => {
  const [showSplash, setShowSplash] = useState(!hasSeenOnboarding());
  const [activeTab, setActiveTab] = useState<Tab>('practice'); // Default to practice

  const handleStart = () => {
    markOnboardingSeen();
    setShowSplash(false);
  };

  const handleNavigate = (tab: 'practice' | 'review' | 'settings') => {
    setActiveTab(tab);
  };

  if (showSplash) {
    return (
      <>
        <Helmet>
          <title>NCLEX Go - Quick NCLEX-RN Practice</title>
          <meta name="description" content="Study anywhere, anytime. Quick NCLEX-RN practice questions designed for busy nursing students on the go." />
        </Helmet>
        <SplashScreen onStart={handleStart} />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>NCLEX Go - Practice</title>
        <meta name="description" content="Practice NCLEX-RN questions with detailed explanations. Study on the go with quick, focused sessions." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <main className="max-w-lg mx-auto px-4 pt-5 pb-20 safe-top">
          {activeTab === 'home' && <HomeView onNavigate={handleNavigate} />}
          {activeTab === 'practice' && <PracticeView />}
          {activeTab === 'review' && <ReviewView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </>
  );
};

export default Index;