import { useState, useRef } from 'react';
import { Share2, Download, CheckCircle2, TrendingUp, Flame, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ShareProgressCardProps {
  category: string;
  previousAccuracy: number;
  currentAccuracy: number;
  questionsCompleted: number;
  streakDays: number;
}

export function ShareProgressCard({
  category,
  previousAccuracy,
  currentAccuracy,
  questionsCompleted,
  streakDays,
}: ShareProgressCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const improvement = currentAccuracy - previousAccuracy;

  const handleShare = async () => {
    const shareData = {
      title: 'My NCLEX Progress',
      text: `I improved my ${category} accuracy from ${previousAccuracy}% to ${currentAccuracy}%! 📚 ${questionsCompleted} questions completed. #NCLEXPrep`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // User cancelled sharing
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareData.text);
      toast.success('Copied to clipboard!');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share Progress
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Share Your Progress</DialogTitle>
        </DialogHeader>
        
        {/* Shareable Card */}
        <div 
          ref={cardRef}
          className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-2xl p-6 text-primary-foreground"
        >
          <div className="text-center mb-6">
            <p className="text-sm opacity-80 mb-1">I improved my</p>
            <h3 className="text-xl font-bold">{category}</h3>
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold opacity-60">{previousAccuracy}%</p>
              <p className="text-xs opacity-60">Before</p>
            </div>
            <TrendingUp className="w-8 h-8" />
            <div className="text-center">
              <p className="text-3xl font-bold">{currentAccuracy}%</p>
              <p className="text-xs opacity-80">Now</p>
            </div>
          </div>

          <div className={cn(
            "text-center py-2 px-4 rounded-xl mb-4",
            improvement > 0 ? "bg-white/20" : "bg-white/10"
          )}>
            <p className="text-2xl font-bold">
              {improvement > 0 ? '+' : ''}{improvement}% improvement
            </p>
          </div>

          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 opacity-80" />
              <span>{questionsCompleted} questions</span>
            </div>
            {streakDays > 0 && (
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 opacity-80" />
                <span>{streakDays} day streak</span>
              </div>
            )}
          </div>

          <div className="text-center mt-4 pt-4 border-t border-white/20">
            <p className="text-xs opacity-60">NCLEX RN Pro</p>
          </div>
        </div>

        <Button onClick={handleShare} className="w-full gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DialogContent>
    </Dialog>
  );
}