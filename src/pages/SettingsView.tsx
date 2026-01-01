import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useUserProgress } from '@/hooks/useQuestions';
import { ExamDateModal } from '@/components/ExamDateModal';
import { GoalEditModal } from '@/components/GoalEditModal';
import { PaywallModal } from '@/components/PaywallModal';
import logoIcon from '@/assets/logo-icon.png';
import { 
  User, 
  Calendar, 
  Target, 
  Trophy, 
  HelpCircle, 
  MessageSquare, 
  Star,
  LogOut,
  ChevronRight,
  Sparkles,
  Shield,
  RotateCcw,
  Crown,
  Check,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { clearAllProgress } from '@/lib/session';
import { useNavigate } from 'react-router-dom';

export function SettingsView() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: progress } = useUserProgress();
  const [showExamDate, setShowExamDate] = useState(false);
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (confirm('Sign out? Your progress is saved in the cloud.')) {
      await signOut();
      toast.success('Signed out successfully');
    }
  };

  const handleResetProgress = async () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      await clearAllProgress();
      toast.success('Progress reset successfully');
      window.location.reload();
    }
  };

  const totalAnswered = progress?.length || 0;
  const correctAnswers = progress?.filter(p => p.is_correct).length || 0;
  const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

  const daysUntilExam = profile?.exam_date 
    ? Math.max(0, Math.ceil((new Date(profile.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  // Get initials for avatar
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Student';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="pb-6 space-y-6">
      {/* Profile Section */}
      <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-border rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <span className="text-xl font-bold text-white">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-lg text-foreground truncate">
                {displayName}
              </p>
              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-medium rounded-full">
                Free
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {user?.email || 'Not signed in'}
            </p>
          </div>
          <img src={logoIcon} alt="NCLEX RN Go" className="w-10 h-10 rounded-xl opacity-50" />
        </div>
      </div>

      {/* Stats Overview - Enhanced */}
      <div className="grid grid-cols-3 gap-3">
        <button 
          onClick={() => navigate('/', { state: { tab: 'stats' } })}
          className="bg-sky-50 dark:bg-sky-500/10 border border-sky-200/50 dark:border-sky-500/20 rounded-xl p-3 text-center hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center mx-auto mb-2">
            <Target className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalAnswered}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">This Week</p>
        </button>
        
        <button 
          onClick={() => navigate('/', { state: { tab: 'stats' } })}
          className={cn(
            "border rounded-xl p-3 text-center hover:shadow-md transition-all active:scale-[0.98]",
            accuracy >= 70 
              ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-500/20"
              : "bg-amber-50 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-500/20"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2",
            accuracy >= 70 ? "bg-emerald-500/20" : "bg-amber-500/20"
          )}>
            <Trophy className={cn(
              "w-4 h-4",
              accuracy >= 70 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
            )} />
          </div>
          <p className="text-2xl font-bold text-foreground">{accuracy}%</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Accuracy</p>
        </button>
        
        <button 
          onClick={() => navigate('/', { state: { tab: 'stats' } })}
          className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 rounded-xl p-3 text-center hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center mx-auto mb-2">
            <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{profile?.streak_days || 0} 🔥</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Day Streak</p>
        </button>
      </div>

      {/* Your Progress Section */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground px-1">
          Your Progress
        </p>
        <div className="space-y-2">
          <button
            onClick={() => setShowExamDate(true)}
            className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-teal-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">Exam Date</p>
              <p className="text-xs text-muted-foreground">
                {profile?.exam_date 
                  ? `${new Date(profile.exam_date).toLocaleDateString()} (${daysUntilExam} days)`
                  : 'Set your exam date'
                }
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
          </button>

          <button
            onClick={() => setShowGoalEdit(true)}
            className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">Daily Goal</p>
              <p className="text-xs text-muted-foreground">
                {profile?.study_goal_daily || 15} questions per day
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
          </button>
        </div>
      </div>

      {/* Account Section */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground px-1">
          Account
        </p>
        
        {/* Premium Upgrade Card */}
        <button
          onClick={() => setShowPaywall(true)}
          className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 rounded-xl p-4 flex items-center gap-4 hover:shadow-lg transition-all active:scale-[0.99] relative overflow-hidden group"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          
          <div className="w-10 h-10 rounded-xl bg-white/30 flex items-center justify-center relative z-10">
            <Crown className="w-5 h-5 text-amber-900" />
          </div>
          <div className="flex-1 text-left relative z-10">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-amber-900">Upgrade to Pro</p>
              <span className="px-1.5 py-0.5 bg-amber-900/20 text-amber-900 text-[10px] font-bold rounded">
                POPULAR
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-amber-800 flex items-center gap-1">
                <Check className="w-3 h-3" /> Unlimited
              </span>
              <span className="text-[10px] text-amber-800 flex items-center gap-1">
                <Check className="w-3 h-3" /> AI Coach
              </span>
              <span className="text-[10px] text-amber-800 flex items-center gap-1">
                <Check className="w-3 h-3" /> Smart Review
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-900 relative z-10" />
        </button>
      </div>

      {/* Support Section */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground px-1">
          Support
        </p>
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
          <SettingsItem 
            icon={HelpCircle} 
            label="Help Center" 
            description="FAQs and guides"
            iconBg="bg-blue-500/10"
            iconColor="text-blue-500"
            onClick={() => toast.info('Coming soon!')}
          />
          <SettingsItem 
            icon={MessageSquare} 
            label="Contact Support" 
            description="Get help from our team"
            iconBg="bg-purple-500/10"
            iconColor="text-purple-500"
            onClick={() => toast.info('Coming soon!')}
          />
          <SettingsItem 
            icon={Shield} 
            label="Privacy Policy" 
            description="How we protect your data"
            iconBg="bg-gray-500/10"
            iconColor="text-gray-500"
            onClick={() => toast.info('Coming soon!')}
          />
        </div>
      </div>

      {/* Account Management Section */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground px-1">
          Account Management
        </p>
        <div className="space-y-2">
          <button
            onClick={handleResetProgress}
            className="w-full bg-card border border-border border-l-4 border-l-destructive rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">Reset Progress</p>
              <p className="text-xs text-muted-foreground">Clear all your study data</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
          </button>

          {user && (
            <button
              onClick={handleSignOut}
              className="w-full bg-card border border-border border-l-4 border-l-destructive rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground">Sign Out</p>
                <p className="text-xs text-muted-foreground">Your progress is safely saved</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <ExamDateModal 
        isOpen={showExamDate} 
        onClose={() => setShowExamDate(false)} 
      />

      <GoalEditModal
        isOpen={showGoalEdit}
        onClose={() => setShowGoalEdit(false)}
        currentGoal={profile?.study_goal_daily || 15}
      />

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </div>
  );
}

interface SettingsItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  iconBg?: string;
  iconColor?: string;
  onClick?: () => void;
}

function SettingsItem({ 
  icon: Icon, 
  label, 
  description, 
  iconBg = 'bg-muted', 
  iconColor = 'text-muted-foreground',
  onClick 
}: SettingsItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 flex items-center gap-4 hover:bg-muted/30 transition-all active:scale-[0.99]"
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
    </button>
  );
}
