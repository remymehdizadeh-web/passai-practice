import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookOpen, MessageCircle, Lightbulb, CheckCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const faqs = [
  {
    question: "How does the adaptive learning work?",
    answer: "Our app tracks your performance across all NCLEX categories and prioritizes questions where you need the most practice. The more you study, the smarter it gets at identifying your weak areas."
  },
  {
    question: "What is the Readiness Score?",
    answer: "Your Readiness Score is a comprehensive measure of your exam preparedness based on your accuracy (60%), question volume (20%), study consistency (10%), and category coverage (10%). Aim for 80+ to feel confident on exam day."
  },
  {
    question: "How do I reset my progress?",
    answer: "Go to Settings > Account Management > Reset Progress. Note that this action cannot be undone and will clear all your study history."
  },
  {
    question: "Can I study offline?",
    answer: "Currently, an internet connection is required to use the app. We're working on offline mode for a future update."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "Go to Settings > Subscription > Manage Subscription. You can cancel anytime, and you'll retain access until the end of your billing period."
  }
];

export function HelpCenterModal({ isOpen, onClose }: HelpCenterModalProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Help Center
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Quick Tips */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-warning" />
              Quick Tips
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span>Study daily to maintain your streak and build consistency</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span>Bookmark difficult questions to review them later</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span>Read rationales carefully—they're key to understanding</span>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              Frequently Asked Questions
            </h3>
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <button
                  key={index}
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full text-left bg-muted/50 rounded-xl p-3 transition-all hover:bg-muted"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{faq.question}</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-muted-foreground shrink-0 transition-transform",
                      expandedFaq === index && "rotate-180"
                    )} />
                  </div>
                  {expandedFaq === index && (
                    <p className="text-sm text-muted-foreground mt-2 pt-2 border-t border-border">
                      {faq.answer}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}