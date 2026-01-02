import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, Lock, Eye, Database, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Privacy Policy
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 pt-2 text-sm">
            {/* Last updated */}
            <p className="text-xs text-muted-foreground">Last updated: January 2025</p>

            {/* Introduction */}
            <section className="space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                What We Collect
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We collect only the information necessary to provide you with the best study experience:
              </p>
              <ul className="space-y-1 text-muted-foreground list-disc pl-5">
                <li>Email address (for account creation)</li>
                <li>Study progress and performance data</li>
                <li>App usage analytics (anonymized)</li>
              </ul>
            </section>

            {/* How we use data */}
            <section className="space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                How We Use Your Data
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Your data is used to:
              </p>
              <ul className="space-y-1 text-muted-foreground list-disc pl-5">
                <li>Personalize your learning experience</li>
                <li>Track your progress and provide insights</li>
                <li>Send study reminders (if enabled)</li>
                <li>Improve our question bank and features</li>
              </ul>
            </section>

            {/* Data security */}
            <section className="space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Data Security
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We take your privacy seriously:
              </p>
              <ul className="space-y-1 text-muted-foreground list-disc pl-5">
                <li>All data is encrypted in transit and at rest</li>
                <li>We never sell your personal information</li>
                <li>We don't share data with third parties for marketing</li>
                <li>Our servers use industry-standard security practices</li>
              </ul>
            </section>

            {/* Your rights */}
            <section className="space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-primary" />
                Your Rights
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to:
              </p>
              <ul className="space-y-1 text-muted-foreground list-disc pl-5">
                <li>Access your personal data</li>
                <li>Request deletion of your account and data</li>
                <li>Export your study progress</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            {/* Contact */}
            <section className="space-y-2 pb-4">
              <h3 className="font-semibold text-foreground">Questions?</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about our privacy practices, please contact us at{' '}
                <a 
                  href="mailto:remymehdizadeh@gmail.com" 
                  className="text-primary hover:underline"
                >
                  remymehdizadeh@gmail.com
                </a>
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}