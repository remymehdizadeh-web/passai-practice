import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useUserProgress } from '@/hooks/useQuestions';
import { ExamDateModal } from '@/components/ExamDateModal';
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
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { clearProgress } from '@/lib/session';

export function SettingsView() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: progress } = useUserProgress();
  const [showExamDate, setShowExamDate] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  const handleResetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      clearProgress();
      window.location.reload();
    }
  };

  const totalAnswered = progress?.length || 0;
  const correctAnswers = progress?.filter(p => p.is_correct).length || 0;
  const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

  const daysUntilExam = profile?.exam_date 
    ? Math.max(0, Math.ceil((new Date(profile.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="pb-6 space-y-6">
      {/* App Branding */}
      <div className="flex items-center gap-3">
        <img src={logoIcon} alt="NCLEX RN Pro" className="w-12 h-12 rounded-xl shadow-lg" />
        <div>
          <h1 className="text-xl font-bold text-foreground">NCLEX RN Pro</h1>
          <p className="text-sm text-muted-foreground">Settings & Account</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {profile?.display_name || user?.email?.split('@')[0] || 'Student'}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {user?.email || 'Not signed in'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <p className="text-lg font-bold text-foreground">{totalAnswered}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-foreground">{accuracy}%</p>
          <p className="text-xs text-muted-foreground">Accuracy</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-foreground">{profile?.streak_days || 0}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
      </div>

      {/* Exam Date */}
      <button
        onClick={() => setShowExamDate(true)}
        className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:bg-muted/30 transition-all active:scale-[0.99]"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-foreground">Exam Date</p>
          <p className="text-xs text-muted-foreground">
            {profile?.exam_date 
              ? `${new Date(profile.exam_date).toLocaleDateString()} (${daysUntilExam} days)`
              : 'Set your exam date'
            }
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Settings List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
        <SettingsItem 
          icon={Star} 
          label="Upgrade to Pro" 
          description="Unlock all questions"
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          onClick={() => toast.info('Coming soon!')}
        />
        <SettingsItem 
          icon={HelpCircle} 
          label="Help Center" 
          description="FAQs and guides"
          onClick={() => toast.info('Coming soon!')}
        />
        <SettingsItem 
          icon={MessageSquare} 
          label="Contact Support" 
          description="Get help from our team"
          onClick={() => toast.info('Coming soon!')}
        />
        <SettingsItem 
          icon={Shield} 
          label="Privacy Policy" 
          description="How we protect your data"
          onClick={() => toast.info('Coming soon!')}
        />
        <SettingsItem 
          icon={RotateCcw} 
          label="Reset Progress" 
          description="Clear all your data"
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
          onClick={handleResetProgress}
        />
      </div>

      {/* Sign Out */}
      {user && (
        <button
          onClick={handleSignOut}
          className="w-full bg-destructive/10 text-destructive rounded-xl p-4 flex items-center justify-center gap-2 font-medium hover:bg-destructive/20 transition-all active:scale-[0.99]"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      )}

      <ExamDateModal 
        isOpen={showExamDate} 
        onClose={() => setShowExamDate(false)} 
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
      className="w-full p-4 flex items-center gap-4 hover:bg-muted/30 transition-all"
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );
}
