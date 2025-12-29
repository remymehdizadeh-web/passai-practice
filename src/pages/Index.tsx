import { useState } from 'react';
import { SplashScreen } from '@/components/SplashScreen';
import { ExamTypeSelection } from '@/components/ExamTypeSelection';
import { BottomNav } from '@/components/BottomNav';
import { HomeView } from '@/pages/HomeView';
import { PracticeView } from '@/pages/PracticeView';
import { ReviewView } from '@/pages/ReviewView';
import { SettingsView } from '@/pages/SettingsView';
import { hasSeenOnboarding, markOnboardingSeen, getExamType, setExamType, ExamType } from '@/lib/session';
import { Helmet } from 'react-helmet';

type Tab = 'home' | 'practice' | 'review' | 'settings';
type ReviewFilter = 'bookmarked' | 'missed';

const Index = () => {
  const [showSplash, setShowSplash] = useState(!hasSeenOnboarding());
  const [examType, setExamTypeState] = useState<ExamType | null>(getExamType());
  const [activeTab, setActiveTab] = useState<Tab>('practice');
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('bookmarked');

  const handleStart = () => {
    markOnboardingSeen();
    setShowSplash(false);
  };

  const handleExamTypeSelect = (type: ExamType) => {
    setExamType(type);
    setExamTypeState(type);
  };

  const handleNavigate = (tab: 'practice' | 'review' | 'settings', filter?: ReviewFilter) => {
    setActiveTab(tab);
    if (tab === 'review' && filter) {
      setReviewFilter(filter);
    }
  };

  if (showSplash) {
    return (
      <>
        <Helmet>
          <title>NCLEX Go - Quick NCLEX Practice</title>
          <meta name="description" content="Study anywhere, anytime. Quick NCLEX practice questions designed for busy nursing students on the go." />
        </Helmet>
        <SplashScreen onStart={handleStart} />
      </>
    );
  }

  if (!examType) {
    return (
      <>
        <Helmet>
          <title>NCLEX Go - Select Your Exam</title>
          <meta name="description" content="Choose between NCLEX-RN and NCLEX-PN to get personalized practice questions." />
        </Helmet>
        <ExamTypeSelection onSelect={handleExamTypeSelect} />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>NCLEX Go - Practice</title>
        <meta name="description" content="Practice NCLEX questions with detailed explanations. Study on the go with quick, focused sessions." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <main className="max-w-lg mx-auto px-4 pt-5 pb-20 safe-top">
          {activeTab === 'home' && <HomeView onNavigate={handleNavigate} examType={examType} />}
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