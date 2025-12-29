import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, X, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUpdateProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

interface ExamDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate?: string | null;
}

export function ExamDateModal({ isOpen, onClose, currentDate }: ExamDateModalProps) {
  const [examDate, setExamDate] = useState(currentDate || '');
  const updateProfile = useUpdateProfile();

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ 
        exam_date: examDate || null 
      });
      toast.success('Exam date saved');
      onClose();
    } catch (error) {
      toast.error('Failed to save exam date');
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleClear = async () => {
    try {
      await updateProfile.mutateAsync({ exam_date: null });
      setExamDate('');
      toast.success('Exam date cleared');
      onClose();
    } catch (error) {
      toast.error('Failed to clear exam date');
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground text-base">
            <Calendar className="w-4 h-4 text-primary" />
            When is your NCLEX exam?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Set your exam date to see a countdown and track your progress toward test day.
          </p>
          
          <Input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            min={today}
            className="w-full"
          />
          
          <div className="space-y-2">
            <Button
              onClick={handleSave}
              disabled={!examDate || updateProfile.isPending}
              className="w-full"
            >
              Save Exam Date
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            
            {currentDate && (
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={updateProfile.isPending}
                className="w-full text-muted-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Clear Date
              </Button>
            )}
            
            {!currentDate && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="w-full text-muted-foreground"
              >
                I don't have a date yet
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}