import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useUserProgress } from '@/hooks/useQuestions';
import { useSubscription } from '@/hooks/useSubscription';
import { ExamDateModal } from '@/components/ExamDateModal';
import { GoalEditModal } from '@/components/GoalEditModal';
import { PaywallModal } from '@/components/PaywallModal';
import { ProfileEditModal } from '@/components/ProfileEditModal';
import { HelpCenterModal } from '@/components/HelpCenterModal';
import { ContactSupportModal } from '@/components/ContactSupportModal';
import { PrivacyPolicyModal } from '@/components/PrivacyPolicyModal';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { 
  Calendar, 
  Target, 
  HelpCircle, 
  MessageSquare, 
  Star,
  LogOut,
  ChevronRight,
  Shield,
  Crown,
  Moon,
  Sun,
  Monitor,
  Pencil,
  CreditCard,
  Bell,
  Clock,
  Mail,
  Lock,
  Download,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SettingsViewProps {
  onNavigateToStats?: () => void;
}

export function SettingsView({ onNavigateToStats }: SettingsViewProps) {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: progress } = useUserProgress();
  const { subscribed, tier, subscriptionEnd, isTrialing, trialDaysRemaining, manageSubscription } = useSubscription();
  const [showExamDate, setShowExamDate] = useState(false);
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showContactSupport, setShowContactSupport] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isSupported, isSubscribed: pushSubscribed, isLoading: pushLoading, subscribe, unsubscribe } = usePushNotifications();

  const [emailNotifications, setEmailNotifications] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    setShowSignOutDialog(false);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be signed in to delete your account');
        setIsDeleting(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Delete account error:', error);
        toast.error('Failed to delete account. Please try again.');
        setIsDeleting(false);
        return;
      }

      toast.success('Account deleted successfully');
      setShowDeleteDialog(false);
      await signOut();
      navigate('/auth');
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportData = async () => {
    if (!progress) {
      toast.error('No data to export');
      return;
    }
    
    const data = {
      exportDate: new Date().toISOString(),
      totalQuestions: progress.length,
      progress: progress
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nclex-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleRateApp = () => {
    // Detect platform and open appropriate store
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    if (isIOS) {
      // Replace with your actual App Store URL when published
      window.open('https://apps.apple.com/app/id123456789', '_blank');
    } else if (isAndroid) {
      // Replace with your actual Play Store URL when published
      window.open('https://play.google.com/store/apps/details?id=app.lovable.nclexgo', '_blank');
    } else {
      toast.info('Rate us on the App Store or Google Play!');
    }
  };

  const handlePushToggle = async () => {
    if (pushSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const daysUntilExam = profile?.exam_date 
    ? Math.max(0, Math.ceil((new Date(profile.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Student';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="pb-24 space-y-6">
      {/* Profile Header */}
      <button
        onClick={() => user && setShowProfileEdit(true)}
        className="w-full bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-shadow duration-200 active:scale-[0.99] will-change-transform text-left"
      >
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Avatar" 
              className="w-14 h-14 rounded-full object-cover shadow-md"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <span className="text-lg font-bold text-white">{initials}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground truncate">
                {displayName}
              </p>
              {subscribed ? (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 text-[10px] font-bold rounded-full">
                  PRO
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-medium rounded-full">
                  Free
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {user?.email || 'Not signed in'}
            </p>
          </div>
          {user && (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </button>

      {/* Exam Preparation Section */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground px-1">
          Exam Preparation
        </p>
        <div className="space-y-2">
          <SettingsCard
            icon={Calendar}
            iconBg="bg-teal-500/10"
            iconColor="text-teal-500"
            title="Exam Date"
            subtitle={profile?.exam_date 
              ? `${new Date(profile.exam_date).toLocaleDateString()} (${daysUntilExam} days)`
              : 'Set your exam date'
            }
            onClick={() => setShowExamDate(true)}
          />
          <SettingsCard
            icon={Target}
            iconBg="bg-orange-500/10"
            iconColor="text-orange-500"
            title="Daily Goal"
            subtitle={`${profile?.study_goal_daily || 15} questions per day`}
            hint="Tap to adjust"
            onClick={() => setShowGoalEdit(true)}
          />
        </div>
      </div>

      {/* Subscription Section */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground px-1">
          Subscription
        </p>
        
        {subscribed ? (
          <div className="space-y-2">
            <div className={cn(
              "border rounded-xl p-4",
              isTrialing 
                ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-amber-500/30"
                : "bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-500/30"
            )}>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  isTrialing ? "bg-amber-500/20" : "bg-emerald-500/20"
                )}>
                  <Crown className={cn("w-5 h-5", isTrialing ? "text-amber-600" : "text-emerald-600")} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">Pro {tier === 'weekly' ? 'Weekly' : 'Monthly'}</p>
                    {isTrialing ? (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-600 text-[10px] font-bold rounded-full">
                        FREE TRIAL
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 text-[10px] font-bold rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  {isTrialing && trialDaysRemaining !== null ? (
                    <p className="text-xs text-amber-600 font-medium">
                      {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} remaining in trial
                    </p>
                  ) : subscriptionEnd && (
                    <p className="text-xs text-muted-foreground">
                      Renews {new Date(subscriptionEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <SettingsCard
              icon={CreditCard}
              iconBg="bg-muted"
              iconColor="text-muted-foreground"
              title="Manage Subscription"
              subtitle="Manage in App Store or Play Store"
              onClick={() => manageSubscription()}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowPaywall(true)}
            className="w-full bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 rounded-xl p-5 hover:shadow-xl transition-shadow duration-200 active:scale-[0.99] will-change-transform relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-900/20 text-amber-900 text-[9px] font-bold rounded-full">
              3-DAY FREE TRIAL
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/30 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-900" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-amber-900">Upgrade to Pro</p>
                  <p className="text-xs text-amber-800">Unlock your full potential</p>
                </div>
              </div>
              
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-900" />
                  <span className="text-xs font-medium text-amber-900">Unlimited Questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-900" />
                  <span className="text-xs font-medium text-amber-900">AI Tutor 24/7 Help</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-900" />
                  <span className="text-xs font-medium text-amber-900">Smart Review</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 bg-amber-900/20 rounded-lg py-2">
                <span className="text-sm font-bold text-amber-900">See All Features</span>
                <ChevronRight className="w-4 h-4 text-amber-900" />
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Notifications Section */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground px-1">
          Notifications
        </p>
        <div className="space-y-2">
          {isSupported && (
            <SettingsToggle
              icon={Bell}
              iconBg={pushSubscribed ? "bg-success/10" : "bg-muted"}
              iconColor={pushSubscribed ? "text-success" : "text-muted-foreground"}
              title="Push Notifications"
              subtitle={pushSubscribed ? 'Enabled - Get study reminders' : 'Enable to get study reminders'}
              checked={pushSubscribed}
              onCheckedChange={handlePushToggle}
              disabled={pushLoading}
            />
          )}
          <SettingsCard
            icon={Clock}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-500"
            title="Daily Reminder Time"
            subtitle="8:00 PM"
            onClick={() => toast.info('Reminder time settings coming soon')}
          />
          <SettingsToggle
            icon={Mail}
            iconBg="bg-purple-500/10"
            iconColor="text-purple-500"
            title="Email Notifications"
            subtitle="Get study tips and updates via email"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>
      </div>

      {/* Appearance Section */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground px-1">
          Appearance
        </p>
        <ThemeToggle />
      </div>

      {/* Support Section */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground px-1">
          Support
        </p>
        <div className="space-y-2">
          <SettingsCard
            icon={HelpCircle}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-500"
            title="Help Center"
            subtitle="FAQs and guides"
            onClick={() => setShowHelpCenter(true)}
          />
          <SettingsCard
            icon={MessageSquare}
            iconBg="bg-purple-500/10"
            iconColor="text-purple-500"
            title="Contact Support"
            subtitle="Get help from our team"
            onClick={() => setShowContactSupport(true)}
          />
          <SettingsCard
            icon={Shield}
            iconBg="bg-gray-500/10"
            iconColor="text-gray-500"
            title="Privacy Policy"
            subtitle="How we protect your data"
            onClick={() => setShowPrivacyPolicy(true)}
          />
          <SettingsCard
            icon={Star}
            iconBg="bg-yellow-500/10"
            iconColor="text-yellow-500"
            title="Rate the App"
            subtitle="Share your feedback on the App Store"
            onClick={handleRateApp}
          />
        </div>
      </div>

      {/* Account Management Section */}
      {user && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground px-1">
            Account Management
          </p>
          <div className="space-y-2">
            <SettingsCard
              icon={Lock}
              iconBg="bg-gray-500/10"
              iconColor="text-gray-500"
              title="Change Password"
              subtitle="Update your account password"
              onClick={() => toast.info('Password change coming soon')}
            />
            <SettingsCard
              icon={Mail}
              iconBg="bg-blue-500/10"
              iconColor="text-blue-500"
              title="Change Email"
              subtitle="Update your email address"
              onClick={() => toast.info('Email change coming soon')}
            />
            <SettingsCard
              icon={Download}
              iconBg="bg-green-500/10"
              iconColor="text-green-500"
              title="Export My Data"
              subtitle="Download your practice history"
              onClick={handleExportData}
            />
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full bg-card border border-border border-l-4 border-l-destructive rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow duration-200 active:scale-[0.99] will-change-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground">Delete Account</p>
                <p className="text-xs text-muted-foreground">Permanently remove your account</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
            </button>
            
            <button
              onClick={() => setShowSignOutDialog(true)}
              className="w-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow duration-200 active:scale-[0.99] will-change-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground">Sign Out</p>
                <p className="text-xs text-muted-foreground">Your progress is safely saved</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
            </button>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress is safely saved and will be available when you sign back in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => {
        if (!isDeleting) {
          setShowDeleteDialog(open);
          if (!open) setDeleteConfirmText('');
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">
                This action cannot be undone. All your progress will be permanently lost.
              </span>
              <span className="block font-medium text-foreground">
                Type <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-destructive">DELETE</span> to confirm:
              </span>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/50"
                disabled={isDeleting}
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              disabled={isDeleting || deleteConfirmText !== 'DELETE'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
      <HelpCenterModal
        isOpen={showHelpCenter}
        onClose={() => setShowHelpCenter(false)}
      />
      <ContactSupportModal
        isOpen={showContactSupport}
        onClose={() => setShowContactSupport(false)}
      />
      <PrivacyPolicyModal
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />
    </div>
  );
}

// Settings Card Component
interface SettingsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  hint?: string;
  onClick?: () => void;
}

function SettingsCard({ icon: Icon, iconBg, iconColor, title, subtitle, hint, onClick }: SettingsCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow duration-200 active:scale-[0.99] will-change-transform"
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        {hint && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{hint}</p>}
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
    </button>
  );
}

// Settings Toggle Component
interface SettingsToggleProps {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

function SettingsToggle({ icon: Icon, iconBg, iconColor, title, subtitle, checked, onCheckedChange, disabled }: SettingsToggleProps) {
  return (
    <div className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <Switch 
        checked={checked} 
        onCheckedChange={onCheckedChange} 
        disabled={disabled}
      />
    </div>
  );
}

// Theme Toggle Component
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
        <div className="w-10 h-10 rounded-xl bg-gray-500/10 flex items-center justify-center">
          <Monitor className="w-5 h-5 text-gray-500" />
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
                "flex items-center justify-center gap-2 py-2.5 px-3 rounded-full border transition-colors duration-200",
                isActive 
                  ? "border-primary bg-primary text-primary-foreground" 
                  : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
