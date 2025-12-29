import { useState } from 'react';
import { useUpdateProfile } from '@/hooks/useProfile';
import { Calendar, Target, Brain, ChevronRight, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const GOAL_OPTIONS = [
  { value: 10, label: '10', description: 'Light study' },
  { value: 15, label: '15', description: 'Steady pace' },
  { value: 25, label: '25', description: 'Focused prep' },
  { value: 40, label: '40', description: 'Intensive' },
];

const STUDY_PREFERENCES = [
  { id: 'morning', label: 'Morning', icon: '🌅', description: '6am - 12pm' },
  { id: 'afternoon', label: 'Afternoon', icon: '☀️', description: '12pm - 6pm' },
  { id: 'evening', label: 'Evening', icon: '🌙', description: '6pm - 12am' },
  { id: 'flexible', label: 'Flexible', icon: '🔄', description: 'Any time' },
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [examDate, setExamDate] = useState('');
  const [dailyGoal, setDailyGoal] = useState(15);
  const [studyTime, setStudyTime] = useState('flexible');
  const updateProfile = useUpdateProfile();

  const handleComplete = async () => {
    try {
      await updateProfile.mutateAsync({
        exam_date: examDate || null,
        study_goal_daily: dailyGoal,
      });
      toast.success('Welcome! Your study plan is ready.');
      onComplete();
    } catch {
      toast.error('Failed to save preferences');
    }
  };

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="text-center px-6">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
        <Sparkles className="w-10 h-10 text-primary-foreground" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-3">
        Welcome to NCLEX RN Pro
      </h1>
      <p className="text-muted-foreground mb-8 leading-relaxed">
        Let's personalize your study experience to help you pass the NCLEX on your first attempt.
      </p>
      <button
        onClick={() => setStep(1)}
        className="btn-premium text-primary-foreground w-full py-4"
      >
        Get Started
        <ChevronRight className="w-5 h-5 ml-2" />
      </button>
    </div>,

    // Step 1: Exam Date
    <div key="exam-date" className="px-6">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-7 h-7 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-foreground text-center mb-2">
        When is your exam?
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        We'll create a personalized study timeline for you
      </p>
      
      <input
        type="date"
        value={examDate}
        onChange={(e) => setExamDate(e.target.value)}
        min={new Date().toISOString().split('T')[0]}
        className="w-full bg-card border border-border rounded-xl px-4 py-4 text-foreground text-center text-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      
      <div className="flex gap-3">
        <button
          onClick={() => setStep(2)}
          className="flex-1 bg-muted text-muted-foreground rounded-xl py-3 font-medium hover:bg-muted/80 transition-colors"
        >
          Skip
        </button>
        <button
          onClick={() => setStep(2)}
          className="flex-1 btn-premium text-primary-foreground py-3"
          disabled={!examDate}
        >
          Continue
        </button>
      </div>
    </div>,

    // Step 2: Daily Goal
    <div key="daily-goal" className="px-6">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Target className="w-7 h-7 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-foreground text-center mb-2">
        Daily question goal
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        How many questions do you want to answer daily?
      </p>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        {GOAL_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setDailyGoal(option.value)}
            className={cn(
              "p-4 rounded-xl border-2 text-center transition-all",
              dailyGoal === option.value
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <p className="text-2xl font-bold text-foreground mb-1">{option.label}</p>
            <p className="text-xs text-muted-foreground">{option.description}</p>
            {dailyGoal === option.value && (
              <Check className="w-4 h-4 text-primary mx-auto mt-2" />
            )}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => setStep(3)}
        className="w-full btn-premium text-primary-foreground py-3"
      >
        Continue
      </button>
    </div>,

    // Step 3: Study Preferences
    <div key="study-time" className="px-6">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Brain className="w-7 h-7 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-foreground text-center mb-2">
        Best time to study?
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        We'll send reminders at your preferred time
      </p>
      
      <div className="space-y-3 mb-6">
        {STUDY_PREFERENCES.map((pref) => (
          <button
            key={pref.id}
            onClick={() => setStudyTime(pref.id)}
            className={cn(
              "w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all",
              studyTime === pref.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <span className="text-2xl">{pref.icon}</span>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">{pref.label}</p>
              <p className="text-xs text-muted-foreground">{pref.description}</p>
            </div>
            {studyTime === pref.id && (
              <Check className="w-5 h-5 text-primary" />
            )}
          </button>
        ))}
      </div>
      
      <button
        onClick={handleComplete}
        disabled={updateProfile.isPending}
        className="w-full btn-premium text-primary-foreground py-3"
      >
        {updateProfile.isPending ? 'Saving...' : 'Start Learning'}
        <Sparkles className="w-4 h-4 ml-2" />
      </button>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress indicator */}
      <div className="flex gap-2 px-6 pt-6 pb-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i <= step ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-sm">
          {steps[step]}
        </div>
      </div>

      {/* Back button */}
      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mx-6 mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
