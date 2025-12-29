import { useState } from 'react';
import { SplashScreen } from '@/components/SplashScreen';
import { BottomNav } from '@/components/BottomNav';
import { HomeView } from '@/pages/HomeView';
import { PracticeView } from '@/pages/PracticeView';
import { ReviewView } from '@/pages/ReviewView';
import { SettingsView } from '@/pages/SettingsView';
import { hasSeenOnboarding, markOnboardingSeen } from '@/lib/session';
import { Helmet } from 'react-helmet';
import logoIcon from '@/assets/logo-icon.png';

type Tab = 'home' | 'practice' | 'review' | 'settings';
type ReviewFilter = 'bookmarked' | 'missed';

const Index = () => {
  const [showSplash, setShowSplash] = useState(!hasSeenOnboarding());
  const [activeTab, setActiveTab] = useState<Tab>('practice');
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('bookmarked');

  const handleStart = () => {
    markOnboardingSeen();
    setShowSplash(false);
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

  return (
    <>
      <Helmet>
        <title>NCLEX RN Pro - Practice</title>
        <meta name="description" content="Practice NCLEX-RN questions with detailed explanations. Master your nursing exam with expert-crafted content." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <img src={logoIcon} alt="NCLEX RN Pro" className="w-8 h-8 rounded-lg" />
              <span className="font-semibold text-foreground">NCLEX RN Pro</span>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 pt-4 pb-20">
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
