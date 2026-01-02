import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, MessageSquare, Clock, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactSupportModal({ isOpen, onClose }: ContactSupportModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!email || !message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    
    // Open email client with pre-filled content
    const mailtoLink = `mailto:remymehdizadeh@gmail.com?subject=${encodeURIComponent(subject || 'NCLEX Prep Support Request')}&body=${encodeURIComponent(`From: ${email}\n\n${message}`)}`;
    window.location.href = mailtoLink;
    
    setTimeout(() => {
      setIsSending(false);
      toast.success('Opening email client...');
      setSubject('');
      setMessage('');
      onClose();
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Contact Support
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Response time notice */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              We typically respond within 24 hours
            </p>
          </div>

          {/* Email input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Your Email *</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-muted/50"
            />
          </div>

          {/* Subject input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Subject</label>
            <Input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What do you need help with?"
              className="bg-muted/50"
            />
          </div>

          {/* Message textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Message *</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue or question..."
              className="bg-muted/50 min-h-[120px] resize-none"
            />
          </div>

          {/* Send button */}
          <Button 
            onClick={handleSend} 
            disabled={isSending || !email || !message}
            className="w-full gap-2"
          >
            <Send className="w-4 h-4" />
            {isSending ? 'Opening...' : 'Send Message'}
          </Button>

          {/* Direct email option */}
          <p className="text-xs text-center text-muted-foreground">
            Or email us directly at{' '}
            <a 
              href="mailto:remymehdizadeh@gmail.com" 
              className="text-primary hover:underline"
            >
              remymehdizadeh@gmail.com
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}