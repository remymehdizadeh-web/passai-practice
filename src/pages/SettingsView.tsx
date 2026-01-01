import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useUserProgress } from '@/hooks/useQuestions';
import { ExamDateModal } from '@/components/ExamDateModal';
import { GoalEditModal } from '@/components/GoalEditModal';
import { PaywallModal } from '@/components/PaywallModal';
import { ProfileEditModal } from '@/components/ProfileEditModal';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import logoIcon from '@/assets/logo-icon.png';
import { useTheme } from 'next-themes';
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
  Crown,
  Check,
  Flame,
  Moon,
  Sun,
  Monitor,
  Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { clearAllProgress } from '@/lib/session';
import { useNavigate } from 'react-router-dom';

interface SettingsViewProps {
  onNavigateToStats?: () => void;
}

export function SettingsView({ onNavigateToStats }: SettingsViewProps) {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: progress } = useUserProgress();
  const [showExamDate, setShowExamDate] = useState(false);
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const updateProfile = useUpdateProfile();

  const handleSignOut = async () => {
    if (confirm('Sign out? Your progress is saved in the cloud.')) {
      await signOut();
      toast.success('Signed out successfully');
    }
  };

  const handleResetProgress = async () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      try {
        // Clear local storage progress
        await clearAllProgress();
        
        // If user is authenticated, also reset their profile streak
        if (user?.id) {
          await supabase
            .from('profiles')
            .update({ streak_days: 0, last_study_date: null })
            .eq('id', user.id);
        }
        
        // Invalidate all relevant queries
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['user-progress'] });
        queryClient.invalidateQueries({ queryKey: ['review-queue'] });
        queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
        
        toast.success('Progress reset successfully');
        window.location.reload();
      } catch (error) {
        toast.error('Failed to reset progress');
      }
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
      <button
        onClick={() => user && setShowProfileEdit(true)}
        className="w-full bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-border rounded-2xl p-5 hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.99] text-left"
      >
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Avatar" 
              className="w-16 h-16 rounded-2xl object-cover shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">{initials}</span>
            </div>
          )}
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
          {user && (
            <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </button>

      {/* Progress Summary - Links to Stats */}
      <button
        onClick={onNavigateToStats}
        className="w-full bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.99] cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Your Progress</p>
              <p className="text-xs text-muted-foreground">
                {totalAnswered} answered · {accuracy}% accuracy
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(profile?.streak_days || 0) > 0 && (
              <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-bold rounded-lg flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {profile?.streak_days}
              </span>
            )}
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </button>

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

      {/* Appearance Section */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground px-1">
          Appearance
        </p>
        <ThemeToggle />
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

      <ProfileEditModal
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
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

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
          {theme === 'dark' ? (
            <Moon className="w-5 h-5 text-violet-500" />
          ) : theme === 'light' ? (
            <Sun className="w-5 h-5 text-violet-500" />
          ) : (
            <Monitor className="w-5 h-5 text-violet-500" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Theme</p>
          <p className="text-xs text-muted-foreground">Choose your preferred appearance</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                isActive 
                  ? "bg-primary/10 border-primary text-primary" 
                  : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
