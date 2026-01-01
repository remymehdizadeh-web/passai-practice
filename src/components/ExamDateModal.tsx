import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, X, ChevronRight, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useUpdateProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

interface ExamDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate?: string | null;
}

export function ExamDateModal({ isOpen, onClose, currentDate }: ExamDateModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    currentDate ? new Date(currentDate) : undefined
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const updateProfile = useUpdateProfile();

  const quickOptions = useMemo(() => {
    const today = new Date();
    return [
      { label: '2 weeks', date: addWeeks(today, 2) },
      { label: '1 month', date: addMonths(today, 1) },
      { label: '2 months', date: addMonths(today, 2) },
      { label: '3 months', date: addMonths(today, 3) },
      { label: '6 months', date: addMonths(today, 6) },
    ];
  }, []);

  const handleSave = async () => {
    if (!selectedDate) return;
    
    try {
      await updateProfile.mutateAsync({ 
        exam_date: format(selectedDate, 'yyyy-MM-dd')
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
      setSelectedDate(undefined);
      toast.success('Exam date cleared');
      onClose();
    } catch (error) {
      toast.error('Failed to clear exam date');
    }
  };

  const handleQuickSelect = (date: Date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const isQuickOptionSelected = (optionDate: Date) => {
    if (!selectedDate) return false;
    return format(selectedDate, 'yyyy-MM-dd') === format(optionDate, 'yyyy-MM-dd');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground text-lg">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p>Set Exam Date</p>
              <p className="text-sm font-normal text-muted-foreground">When is your NCLEX?</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* Quick select options */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Select</p>
            <div className="grid grid-cols-3 gap-2">
              {quickOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleQuickSelect(option.date)}
                  className={cn(
                    "p-3 rounded-xl border text-center transition-all active:scale-95",
                    isQuickOptionSelected(option.date)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background hover:border-primary/50"
                  )}
                >
                  <p className="text-sm font-semibold">{option.label}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(option.date, 'MMM d')}
                  </p>
                </button>
              ))}
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className={cn(
                  "p-3 rounded-xl border text-center transition-all active:scale-95",
                  showCalendar
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background hover:border-primary/50"
                )}
              >
                <Calendar className="w-4 h-4 mx-auto mb-0.5" />
                <p className="text-[10px] text-muted-foreground">Pick date</p>
              </button>
            </div>
          </div>

          {/* Calendar picker */}
          {showCalendar && (
            <div className="border border-border rounded-xl p-2 bg-background">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  if (date) setShowCalendar(false);
                }}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </div>
          )}

          {/* Selected date display */}
          {selectedDate && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Selected date</p>
                  <p className="text-lg font-bold text-foreground">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                <Check className="w-5 h-5 text-primary" />
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={!selectedDate || updateProfile.isPending}
              className="w-full h-12 text-base"
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
