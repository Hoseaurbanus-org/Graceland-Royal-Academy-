import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Lock, 
  Key, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  User, 
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { supabase, changePassword, resetUserPassword } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface StaffPasswordReset {
  staffId: string;
  newPassword: string;
  confirmPassword: string;
}

export function PasswordManagement() {
  const { user, staff } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [resetForm, setResetForm] = useState<StaffPasswordReset>({
    staffId: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(user!.id, passwordForm.newPassword);
      
      if (result.success) {
        toast.success('Password changed successfully');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(result.error || 'Failed to change password');
      }
    } catch (error) {
      toast.error('An error occurred while changing password');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffPasswordReset = async () => {
    if (!resetForm.staffId || !resetForm.newPassword || !resetForm.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (resetForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      // Find the user record for this staff member
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', selectedStaff?.email)
        .single();

      if (userError || !userData) {
        toast.error('Staff user account not found');
        return;
      }

      const result = await resetUserPassword(userData.id, resetForm.newPassword);
      
      if (result.success) {
        toast.success(`Password reset for ${selectedStaff?.name}`);
        setShowResetDialog(false);
        setResetForm({
          staffId: '',
          newPassword: '',
          confirmPassword: ''
        });
        setSelectedStaff(null);
      } else {
        toast.error(result.error || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('An error occurred while resetting password');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setResetForm(prev => ({
      ...prev,
      newPassword,
      confirmPassword: newPassword
    }));
  };

  const openResetDialog = (staffMember: any) => {
    setSelectedStaff(staffMember);
    setResetForm({
      staffId: staffMember.id,
      newPassword: '',
      confirmPassword: ''
    });
    setShowResetDialog(true);
  };

  if (user?.role !== 'admin') {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Access denied. Only administrators can manage passwords.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Password Management</h2>
          <p className="text-muted-foreground">
            Manage your password and reset staff passwords
          </p>
        </div>
      </div>

      <Tabs defaultValue="change-password" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="change-password">Change My Password</TabsTrigger>
          <TabsTrigger value="staff-passwords">Staff Password Reset</TabsTrigger>
        </TabsList>

        {/* Change Admin Password */}
        <TabsContent value="change-password">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Administrator Password
              </CardTitle>
              <CardDescription>
                Update your administrator account password for security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({
                          ...prev,
                          currentPassword: e.target.value
                        }))}
                        className="pr-10"
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      placeholder="Enter new password"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Password Requirements:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className={`h-3 w-3 ${passwordForm.newPassword.length >= 8 ? 'text-green-500' : 'text-muted-foreground'}`} />
                      At least 8 characters long
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className={`h-3 w-3 ${/[A-Z]/.test(passwordForm.newPassword) ? 'text-green-500' : 'text-muted-foreground'}`} />
                      Contains uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className={`h-3 w-3 ${/[a-z]/.test(passwordForm.newPassword) ? 'text-green-500' : 'text-muted-foreground'}`} />
                      Contains lowercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className={`h-3 w-3 ${/\d/.test(passwordForm.newPassword) ? 'text-green-500' : 'text-muted-foreground'}`} />
                      Contains number
                    </li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Password Reset */}
        <TabsContent value="staff-passwords">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Staff Password Management
              </CardTitle>
              <CardDescription>
                Reset passwords for staff members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Password Change</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((staffMember) => (
                      <TableRow key={staffMember.id}>
                        <TableCell className="font-medium">{staffMember.name}</TableCell>
                        <TableCell>{staffMember.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Staff</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          Never changed
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openResetDialog(staffMember)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset Password
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {staff.length === 0 && (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No staff members found. Add staff members first.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Staff Password</DialogTitle>
            <DialogDescription>
              Reset password for {selectedStaff?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reset-password">New Password</Label>
              <div className="flex gap-2">
                <Input
                  id="reset-password"
                  type="text"
                  value={resetForm.newPassword}
                  onChange={(e) => setResetForm(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeneratePassword}
                >
                  Generate
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="reset-confirm">Confirm Password</Label>
              <Input
                id="reset-confirm"
                type="text"
                value={resetForm.confirmPassword}
                onChange={(e) => setResetForm(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))}
                placeholder="Confirm new password"
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The staff member will be required to change this password on their next login.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowResetDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStaffPasswordReset}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Reset Password
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}