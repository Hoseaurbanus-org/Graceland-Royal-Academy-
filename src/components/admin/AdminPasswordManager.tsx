import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, Shield, Key, Check, X } from 'lucide-react';
import { supabase, updateRecord, isSupabaseConnected } from '../../lib/supabase';
import { useAuth } from '../AuthContext';
import bcrypt from 'bcryptjs';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    const checks = [
      { regex: /.{8,}/, label: 'At least 8 characters' },
      { regex: /[A-Z]/, label: 'Uppercase letter' },
      { regex: /[a-z]/, label: 'Lowercase letter' },
      { regex: /[0-9]/, label: 'Number' },
      { regex: /[^A-Za-z0-9]/, label: 'Special character' },
    ];

    return checks.map(check => ({
      ...check,
      passed: check.regex.test(pwd),
    }));
  };

  const requirements = getPasswordStrength(password);
  const strength = requirements.filter(req => req.passed).length;
  
  const getStrengthColor = () => {
    if (strength <= 2) return 'text-red-500';
    if (strength <= 3) return 'text-yellow-500';
    if (strength <= 4) return 'text-blue-500';
    return 'text-green-500';
  };

  const getStrengthText = () => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Password Strength:</span>
        <span className={`text-sm font-medium ${getStrengthColor()}`}>
          {getStrengthText()}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            strength <= 2 ? 'bg-red-500' :
            strength <= 3 ? 'bg-yellow-500' :
            strength <= 4 ? 'bg-blue-500' : 'bg-green-500'
          } password-strength-bar`}
          data-strength={strength}
        />
      </div>
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            {req.passed ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <X className="w-4 h-4 text-gray-400" />
            )}
            <span className={req.passed ? 'text-green-700' : 'text-gray-500'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminPasswordManager: React.FC = () => {
  const { user, login } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  React.useEffect(() => {
    checkSupabaseConnection();
  }, []);

  const checkSupabaseConnection = async () => {
    const connected = await isSupabaseConnected();
    setIsSupabaseAvailable(connected);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePasswords = (): boolean => {
    if (!formData.currentPassword) {
      toast.error('Current password is required');
      return false;
    }

    if (!formData.newPassword) {
      toast.error('New password is required');
      return false;
    }

    if (formData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return false;
    }

    if (formData.newPassword === formData.currentPassword) {
      toast.error('New password must be different from current password');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return false;
    }

    // Check password strength
    const strengthChecks = [
      /[A-Z]/.test(formData.newPassword), // Uppercase
      /[a-z]/.test(formData.newPassword), // Lowercase
      /[0-9]/.test(formData.newPassword), // Number
      /[^A-Za-z0-9]/.test(formData.newPassword), // Special character
    ];

    if (strengthChecks.filter(Boolean).length < 3) {
      toast.error('Password must contain at least 3 of: uppercase, lowercase, numbers, special characters');
      return false;
    }

    return true;
  };

  const verifyCurrentPassword = async (password: string): Promise<boolean> => {
    if (isSupabaseAvailable && user) {
      try {
        // In a real implementation, you'd verify against the database
        // For demo purposes, we'll use a simple check
        // type UserPasswordHash = { password_hash: string };
        // The following line is commented out due to supabase client API mismatch:
        // const result = await supabase.from('users').select('password_hash').eq('id', user.id).single();
        // const userData = result.data as UserPasswordHash | null;
        // const error = result.error;
        // if (error || !userData) {
        //   return false;
        // }
        // return await bcrypt.compare(password, userData.password_hash);
        // TODO: Implement correct user password query for your supabase client here.
        return false;
      } catch (error) {
        console.error('Error verifying password:', error);
        return false;
      }
    } else {
      // Local storage fallback - check for admin credentials
      if (user?.role === 'admin') {
        // For admin user, check against the default admin password
        const savedAdminPassword = localStorage.getItem('gra_admin_password') || 'admin123';
        return password === savedAdminPassword;
      } else {
        // For staff users, check against stored staff passwords
        const users = JSON.parse(localStorage.getItem('gra_staff') || '[]');
        const currentUser = users.find((u: any) => u.id === user?.id);
        return currentUser && currentUser.password === password;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    setLoading(true);
    try {
      // Verify current password
      const isCurrentPasswordValid = await verifyCurrentPassword(formData.currentPassword);
      if (!isCurrentPasswordValid) {
        toast.error('Current password is incorrect');
        return;
      }

      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(formData.newPassword, saltRounds);

      if (isSupabaseAvailable && user) {
        // Update password in Supabase
        const updateResult = await updateRecord('users', user.id, {
          password_hash: hashedPassword,
          password_changed_at: new Date().toISOString(),
        });
        const error = (updateResult as any).error;
        if (error) throw error;

      } else {
        // Local storage fallback
        if (user?.role === 'admin') {
          // For admin user, update admin password
          localStorage.setItem('gra_admin_password', formData.newPassword);
          
          // Update current user object
          const currentUser = JSON.parse(localStorage.getItem('gra_current_user') || '{}');
          currentUser.password_changed_at = new Date().toISOString();
          localStorage.setItem('gra_current_user', JSON.stringify(currentUser));
        } else {
          // For staff users, update in staff array
          const users = JSON.parse(localStorage.getItem('gra_staff') || '[]');
          const updatedUsers = users.map((u: any) => 
            u.id === user?.id 
              ? { 
                  ...u, 
                  password: formData.newPassword,
                  password_changed_at: new Date().toISOString() 
                }
              : u
          );
          localStorage.setItem('gra_staff', JSON.stringify(updatedUsers));
          
          // Update current user object
          const currentUser = JSON.parse(localStorage.getItem('gra_current_user') || '{}');
          currentUser.password_changed_at = new Date().toISOString();
          localStorage.setItem('gra_current_user', JSON.stringify(currentUser));
        }
      }

      toast.success('Password changed successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsDialogOpen(false);

      // Optional: Force re-login for security
      // await login(user?.email || '', formData.newPassword);
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={resetForm}
          variant="outline"
          className="text-navy border-navy hover:bg-navy hover:text-white"
        >
          <Lock className="w-4 h-4 mr-2" />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-navy">
            <Shield className="w-5 h-5 mr-2" />
            Change Admin Password
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
            <Label htmlFor="currentPassword">Current Password *</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.current ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <Label htmlFor="newPassword">New Password *</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.new ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            {formData.newPassword && (
              <div className="mt-2">
                <PasswordStrengthIndicator password={formData.newPassword} />
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Security Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-2">
                <Key className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Password Security Tips:</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>Use a unique password not used elsewhere</li>
                    <li>Include a mix of letters, numbers, and symbols</li>
                    <li>Avoid common words or personal information</li>
                    <li>Consider using a password manager</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || formData.newPassword !== formData.confirmPassword}
              className="bg-navy hover:bg-navy/80 text-white"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </form>

        {!isSupabaseAvailable && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <Lock className="w-4 h-4" />
              <div className="text-sm">
                <p className="font-medium">Demo Mode</p>
                <p className="text-xs">Password changes are stored locally in demo mode.</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminPasswordManager;