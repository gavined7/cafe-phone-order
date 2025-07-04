import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Phone } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const { signInWithPhone, verifyOtp } = useAuth();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Format phone number (simple validation)
    const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;
    
    const { error } = await signInWithPhone(formattedPhone);
    
    if (!error) {
      setStep('otp');
    }
    
    setLoading(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;
    const { error } = await verifyOtp(formattedPhone, otp);
    
    if (!error) {
      onOpenChange(false);
      setStep('phone');
      setPhone('');
      setOtp('');
    }
    
    setLoading(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep('phone');
    setPhone('');
    setOtp('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-coffee-dark flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Login with Phone</span>
          </DialogTitle>
        </DialogHeader>
        
        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="border-coffee-light/30 focus:border-coffee-medium"
              />
              <p className="text-xs text-muted-foreground">
                Enter your phone number to receive a verification code
              </p>
            </div>
            
            <Button 
              type="submit" 
              variant="coffee" 
              className="w-full"
              disabled={loading || !phone}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Verification Code'
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                className="border-coffee-light/30 focus:border-coffee-medium text-center text-lg tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code sent to {phone}
              </p>
            </div>
            
            <div className="space-y-2">
              <Button 
                type="submit" 
                variant="coffee" 
                className="w-full"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full"
                onClick={() => setStep('phone')}
              >
                Change Phone Number
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};