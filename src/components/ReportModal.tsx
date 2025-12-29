import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useReportIssue } from '@/hooks/useQuestions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
}

const reportTypes = [
  { value: 'wrong_answer', label: 'Wrong Answer', emoji: '❌' },
  { value: 'unclear', label: 'Unclear', emoji: '❓' },
  { value: 'typo', label: 'Typo', emoji: '✏️' },
  { value: 'not_nclex_style', label: 'Not NCLEX Style', emoji: '📋' },
  { value: 'other', label: 'Other', emoji: '💬' },
] as const;

export function ReportModal({ isOpen, onClose, questionId }: ReportModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const reportIssue = useReportIssue();

  const handleSubmit = async () => {
    if (!selectedType) return;

    try {
      await reportIssue.mutateAsync({
        questionId,
        reportType: selectedType,
        description: description || undefined,
      });
      toast.success('Issue reported successfully');
      onClose();
      setSelectedType(null);
      setDescription('');
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Report an Issue</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Report Type Selection */}
          <div className="grid grid-cols-2 gap-2">
            {reportTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all',
                  selectedType === type.value
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-secondary/50 text-muted-foreground hover:border-muted-foreground/50'
                )}
              >
                <span className="text-lg mr-2">{type.emoji}</span>
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            ))}
          </div>

          {/* Optional Description */}
          <Textarea
            placeholder="Additional details (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-secondary border-border resize-none"
            rows={3}
          />

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={!selectedType || reportIssue.isPending}
              className="flex-1"
            >
              {reportIssue.isPending ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
