import { useState } from 'react';
import { useUpdateProfile } from '@/hooks/useProfile';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Calendar, BookOpen, Clock, ChevronRight, 
  Sparkles, GraduationCap, Zap, Brain, CheckCircle2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const GOALS = [
  { id: 'first-time', label: 'Pass First Time', icon: Target, description: 'Taking NCLEX for the first time' },
  { id: 'retake', label: 'Retake & Pass', icon: Zap, description: 'Preparing to retake the exam' },
  { id: 'refresh', label: 'Refresh Skills', icon: Brain, description: 'Keeping knowledge current' },
];

const EXPERIENCE = [
  { id: 'student', label: 'Nursing Student', icon: GraduationCap },
  { id: 'graduate', label: 'Recent Graduate', icon: BookOpen },
  { id: 'working', label: 'Working Nurse', icon: Target },
];

const DAILY_GOALS = [
  { value: 10, label: '10', time: '~15 min', level: 'Light' },
  { value: 20, label: '20', time: '~30 min', level: 'Moderate' },
  { value: 30, label: '30', time: '~45 min', level: 'Focused' },
  { value: 50, label: '50', time: '~1 hr', level: 'Intensive' },
];

const STUDY_TIMES = [
  { id: 'morning', label: 'Morning', emoji: '🌅', time: '6am - 12pm' },
  { id: 'afternoon', label: 'Afternoon', emoji: '☀️', time: '12pm - 6pm' },
  { id: 'evening', label: 'Evening', emoji: '🌙', time: '6pm - 12am' },
  { id: 'flexible', label: 'Flexible', emoji: '⚡', time: 'Anytime' },
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('first-time');
  const [experience, setExperience] = useState('graduate');
  const [examDate, setExamDate] = useState('');
  const [dailyGoal, setDailyGoal] = useState(20);
  const [studyTime, setStudyTime] = useState('flexible');
  const updateProfile = useUpdateProfile();

  const totalSteps = 5;

  const handleComplete = async () => {
    try {
      await updateProfile.mutateAsync({
        exam_date: examDate || null,
        study_goal_daily: dailyGoal,
      });
      toast.success('Your study plan is ready!');
      onComplete();
    } catch {
      toast.error('Failed to save preferences');
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Progress bar */}
      <div className="px-6 pt-6">
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-300',
                i < step ? 'bg-primary' : i === step ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <motion.div
              key="welcome"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col items-center justify-center px-8 text-center"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-lg">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-black text-foreground mb-3">
                Welcome to NCLEX RN Go
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
                Let's personalize your study plan to help you pass the NCLEX on your first try.
              </p>
            </motion.div>
          )}

          {/* Step 1: What's your goal */}
          {step === 1 && (
            <motion.div
              key="goal"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col px-6 pt-8"
            >
              <h2 className="text-2xl font-bold text-center mb-2">What's your goal?</h2>
              <p className="text-muted-foreground text-center mb-8">We'll tailor your experience</p>
              <div className="space-y-3">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={cn(
                      'w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all',
                      goal === g.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/30'
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      goal === g.id ? 'bg-primary/10' : 'bg-muted'
                    )}>
                      <g.icon className={cn('w-6 h-6', goal === g.id ? 'text-primary' : 'text-muted-foreground')} />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-foreground">{g.label}</p>
                      <p className="text-sm text-muted-foreground">{g.description}</p>
                    </div>
                    {goal === g.id && <CheckCircle2 className="w-6 h-6 text-primary" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Experience level */}
          {step === 2 && (
            <motion.div
              key="experience"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col px-6 pt-8"
            >
              <h2 className="text-2xl font-bold text-center mb-2">Your background</h2>
              <p className="text-muted-foreground text-center mb-8">Helps us adjust difficulty</p>
              <div className="space-y-3">
                {EXPERIENCE.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setExperience(e.id)}
                    className={cn(
                      'w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all',
                      experience === e.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/30'
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      experience === e.id ? 'bg-primary/10' : 'bg-muted'
                    )}>
                      <e.icon className={cn('w-6 h-6', experience === e.id ? 'text-primary' : 'text-muted-foreground')} />
                    </div>
                    <p className="font-semibold text-foreground flex-1 text-left">{e.label}</p>
                    {experience === e.id && <CheckCircle2 className="w-6 h-6 text-primary" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Exam date */}
          {step === 3 && (
            <motion.div
              key="examdate"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col px-6 pt-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">When is your exam?</h2>
              <p className="text-muted-foreground text-center mb-8">We'll create a countdown & study timeline</p>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-card border-2 border-border rounded-2xl px-4 py-4 text-foreground text-center text-lg focus:outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={nextStep}
                className="mt-4 text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                I don't know yet → Skip
              </button>
            </motion.div>
          )}

          {/* Step 4: Daily goal */}
          {step === 4 && (
            <motion.div
              key="dailygoal"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col px-6 pt-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Daily question goal</h2>
              <p className="text-muted-foreground text-center mb-6">How much time can you commit?</p>
              <div className="grid grid-cols-2 gap-3">
                {DAILY_GOALS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setDailyGoal(g.value)}
                    className={cn(
                      'p-4 rounded-2xl border-2 text-center transition-all',
                      dailyGoal === g.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/30'
                    )}
                  >
                    <p className="text-3xl font-black text-foreground">{g.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{g.time}</p>
                    <p className={cn(
                      'text-xs font-medium mt-1',
                      dailyGoal === g.value ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {g.level}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 5: Study time preference (final) - auto-complete */}
          {step === 5 && (
            <motion.div
              key="studytime"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col px-6 pt-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Best time to study?</h2>
              <p className="text-muted-foreground text-center mb-6">We'll remind you at the right time</p>
              <div className="grid grid-cols-2 gap-3">
                {STUDY_TIMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setStudyTime(t.id)}
                    className={cn(
                      'p-4 rounded-2xl border-2 text-center transition-all',
                      studyTime === t.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/30'
                    )}
                  >
                    <span className="text-2xl">{t.emoji}</span>
                    <p className="font-semibold text-foreground mt-2">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.time}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="px-6 pb-8 pt-4 space-y-3">
        {step === 0 ? (
          <button
            onClick={nextStep}
            className="w-full btn-premium text-primary-foreground py-4 text-lg flex items-center justify-center gap-2"
          >
            Get Started
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : step < 5 ? (
          <button
            onClick={nextStep}
            className="w-full btn-premium text-primary-foreground py-4 text-lg"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={updateProfile.isPending}
            className="w-full btn-premium text-primary-foreground py-4 text-lg flex items-center justify-center gap-2"
          >
            {updateProfile.isPending ? 'Setting up...' : 'Start Learning'}
            <Sparkles className="w-5 h-5" />
          </button>
        )}

        {step > 0 && (
          <button
            onClick={prevStep}
            className="w-full text-muted-foreground text-sm py-2 hover:text-foreground transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
