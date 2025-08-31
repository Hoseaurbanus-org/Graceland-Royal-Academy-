import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { DEMO_ADMIN_PASSWORD } from './constants';

interface SecurityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export function SecurityDialog({ isOpen, onClose, onVerified }: SecurityDialogProps) {
  const [securityPassword, setSecurityPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const verifyClassSecurity = () => {
    if (securityPassword === DEMO_ADMIN_PASSWORD) {
      onVerified();
      onClose();
      setSecurityPassword('');
      alert('Security verified! You can now manage classes.');
    } else {
      alert('Invalid password. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Verification Required
          </DialogTitle>
          <DialogDescription>
            Class management requires additional security verification to prevent unauthorized changes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Admin Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={securityPassword}
                onChange={(e) => setSecurityPassword(e.target.value)}
                placeholder="Enter admin password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Demo password: <code>admin123</code> (In production, use 2FA or stronger authentication)
            </AlertDescription>
          </Alert>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={verifyClassSecurity}>
              <Shield className="h-4 w-4 mr-2" />
              Verify
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}