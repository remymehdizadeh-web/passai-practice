import { useState } from 'react';
import { useUpdateProfile } from '@/hooks/useProfile';
import { Target, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface GoalEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: number;
}

const GOAL_OPTIONS = [
  { value: 5, label: '5', description: 'Light' },
  { value: 10, label: '10', description: 'Casual' },
  { value: 15, label: '15', description: 'Steady' },
  { value: 25, label: '25', description: 'Focused' },
  { value: 40, label: '40', description: 'Intensive' },
  { value: 50, label: '50', description: 'Maximum' },
];

export function GoalEditModal({ isOpen, onClose, currentGoal }: GoalEditModalProps) {
  const [selectedGoal, setSelectedGoal] = useState(currentGoal);
  const updateProfile = useUpdateProfile();

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ study_goal_daily: selectedGoal });
      toast.success(`Daily goal updated to ${selectedGoal} questions`);
      onClose();
    } catch {
      toast.error('Failed to update goal');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Daily Study Goal
          </DialogTitle>
        </DialogHeader>
        
        <p className="text-sm text-muted-foreground mb-4">
          Choose how many questions you want to complete each day
        </p>
        
        <div className="grid grid-cols-3 gap-2 mb-6">
          {GOAL_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedGoal(option.value)}
              className={cn(
                "p-3 rounded-xl border-2 text-center transition-all",
                selectedGoal === option.value
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <p className="text-xl font-bold text-foreground">{option.label}</p>
              <p className="text-[10px] text-muted-foreground">{option.description}</p>
            </button>
          ))}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-muted text-muted-foreground rounded-xl py-3 font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateProfile.isPending || selectedGoal === currentGoal}
            className="flex-1 btn-premium text-primary-foreground py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {updateProfile.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
