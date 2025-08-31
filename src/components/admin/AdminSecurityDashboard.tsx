import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { 
  Shield, 
  Key, 
  Eye, 
  EyeOff, 
  History, 
  Users, 
  AlertTriangle, 
  Lock, 
  Unlock,
  Download,
  Trash2,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Monitor
} from 'lucide-react';
import { useAuth } from '../AuthContext';

interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  location: string;
  status: 'success' | 'failed' | 'suspicious';
}

interface UserPermission {
  userId: string;
  userName: string;
  userRole: string;
  permissions: string[];
  lastLogin: string;
  status: 'active' | 'suspended' | 'locked';
  failedAttempts: number;
}

interface SecuritySetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  value?: string | number;
}

export function AdminSecurityDashboard() {
  const { user } = useAuth();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordUpdateStatus, setPasswordUpdateStatus] = useState<'idle' | 'updating' | 'success' | 'error'>('idle');

  // Mock data - replace with actual data fetching
  const [accessLogs] = useState<AccessLog[]>([
    {
      id: '1',
      userId: 'admin-1',
      userName: 'Dr. Sarah Johnson',
      userRole: 'Admin',
      action: 'Login',
      timestamp: '2024-12-20T09:15:00Z',
      ipAddress: '192.168.1.100',
      device: 'Windows Chrome',
      location: 'Gombe, Nigeria',
      status: 'success'
    },
    {
      id: '2',
      userId: 'parent-1',
      userName: 'Mr. John Smith',
      userRole: 'Parent',
      action: 'View Results',
      timestamp: '2024-12-20T08:45:00Z',
      ipAddress: '102.89.23.45',
      device: 'Android Chrome',
      location: 'Lagos, Nigeria',
      status: 'success'
    },
    {
      id: '3',
      userId: 'unknown',
      userName: 'Unknown User',
      userRole: 'Unknown',
      action: 'Failed Login Attempt',
      timestamp: '2024-12-20T07:30:00Z',
      ipAddress: '45.123.67.89',
      device: 'Linux Firefox',
      location: 'Unknown',
      status: 'failed'
    },
    {
      id: '4',
      userId: 'subject_supervisor-1',
      userName: 'Mrs. Grace Adebayo',
      userRole: 'Subject Supervisor',
      action: 'Submit Results',
      timestamp: '2024-12-19T16:20:00Z',
      ipAddress: '192.168.1.105',
      device: 'Windows Edge',
      location: 'Gombe, Nigeria',
      status: 'success'
    },
    {
      id: '5',
      userId: 'accountant-1',
      userName: 'Mrs. Comfort Nwankwo',
      userRole: 'Accountant',
      action: 'Process Payment',
      timestamp: '2024-12-19T14:10:00Z',
      ipAddress: '192.168.1.102',
      device: 'Windows Chrome',
      location: 'Gombe, Nigeria',
      status: 'success'
    }
  ]);

  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([
    {
      userId: 'admin-1',
      userName: 'Dr. Sarah Johnson',
      userRole: 'Admin',
      permissions: ['all_access', 'user_management', 'system_settings', 'data_export'],
      lastLogin: '2024-12-20T09:15:00Z',
      status: 'active',
      failedAttempts: 0
    },
    {
      userId: 'subject_supervisor-1',
      userName: 'Mrs. Grace Adebayo',
      userRole: 'Subject Supervisor',
      permissions: ['result_submission', 'view_students', 'export_data'],
      lastLogin: '2024-12-19T16:20:00Z',
      status: 'active',
      failedAttempts: 0
    },
    {
      userId: 'parent-1',
      userName: 'Mr. John Smith',
      userRole: 'Parent',
      permissions: ['view_results', 'fee_payment', 'view_notifications'],
      lastLogin: '2024-12-20T08:45:00Z',
      status: 'active',
      failedAttempts: 0
    },
    {
      userId: 'accountant-1',
      userName: 'Mrs. Comfort Nwankwo',
      userRole: 'Accountant',
      permissions: ['fee_management', 'payment_processing', 'financial_reports', 'receipt_generation'],
      lastLogin: '2024-12-19T14:10:00Z',
      status: 'active',
      failedAttempts: 0
    }
  ]);

  const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([
    {
      id: 'password_policy',
      name: 'Strong Password Policy',
      description: 'Require passwords with minimum 8 characters, uppercase, lowercase, and numbers',
      enabled: true
    },
    {
      id: 'two_factor',
      name: 'Two-Factor Authentication',
      description: 'Require 2FA for admin users',
      enabled: false
    },
    {
      id: 'session_timeout',
      name: 'Auto Session Timeout',
      description: 'Automatically log out users after inactivity',
      enabled: true,
      value: 30
    },
    {
      id: 'login_attempts',
      name: 'Maximum Login Attempts',
      description: 'Lock account after failed login attempts',
      enabled: true,
      value: 5
    },
    {
      id: 'ip_restriction',
      name: 'IP Address Restrictions',
      description: 'Restrict access to specific IP ranges',
      enabled: false
    },
    {
      id: 'data_encryption',
      name: 'Data Encryption',
      description: 'Encrypt sensitive data at rest',
      enabled: true
    },
    {
      id: 'audit_logging',
      name: 'Audit Logging',
      description: 'Log all user actions and system events',
      enabled: true
    },
    {
      id: 'backup_encryption',
      name: 'Backup Encryption',
      description: 'Encrypt database backups',
      enabled: true
    }
  ]);

  const handlePasswordUpdate = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('New password must be at least 8 characters long');
      return;
    }

    setPasswordUpdateStatus('updating');

    try {
      // Simulate password update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPasswordUpdateStatus('success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(() => {
        setPasswordUpdateStatus('idle');
        setShowPasswordDialog(false);
      }, 2000);
      
    } catch (error) {
      setPasswordUpdateStatus('error');
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUserPermissions(prev => 
      prev.map(user => 
        user.userId === userId 
          ? { 
              ...user, 
              status: user.status === 'active' ? 'suspended' : 'active' 
            }
          : user
      )
    );
  };

  const toggleSecuritySetting = (settingId: string) => {
    setSecuritySettings(prev =>
      prev.map(setting =>
        setting.id === settingId
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };

  const exportAccessLogs = () => {
    const csvContent = [
      'Timestamp,User,Role,Action,IP Address,Device,Location,Status',
      ...accessLogs.map(log => 
        `${log.timestamp},${log.userName},${log.userRole},${log.action},${log.ipAddress},${log.device},${log.location},${log.status}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `access_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'suspicious': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'suspicious': return 'bg-orange-100 text-orange-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'locked': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security & Access Control
          </h2>
          <p className="text-muted-foreground">
            Manage system security, user access, and monitor activity
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Change Admin Password</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {passwordUpdateStatus === 'success' && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Password updated successfully!
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handlePasswordUpdate}
                    disabled={passwordUpdateStatus === 'updating'}
                    className="flex-1"
                  >
                    {passwordUpdateStatus === 'updating' ? 'Updating...' : 'Update Password'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userPermissions.filter(u => u.status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground">
              Currently logged in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Failed Logins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {accessLogs.filter(log => log.status === 'failed').length}
            </div>
            <p className="text-sm text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              Security Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">85%</div>
            <p className="text-sm text-muted-foreground">
              System security rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="h-4 w-4 text-purple-600" />
              Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accessLogs.length}
            </div>
            <p className="text-sm text-muted-foreground">
              Recent activities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="access" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="access">Access Logs</TabsTrigger>
          <TabsTrigger value="permissions">User Permissions</TabsTrigger>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
          <TabsTrigger value="data">Data Security</TabsTrigger>
        </TabsList>

        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Access Logs
                </CardTitle>
                <Button onClick={exportAccessLogs} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.userName}</div>
                            <div className="text-sm text-muted-foreground">{log.userRole}</div>
                          </div>
                        </TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Monitor className="h-3 w-3" />
                            {log.device}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {log.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(log.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(log.status)}
                              {log.status}
                            </div>
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Permissions & Access Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Failed Attempts</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userPermissions.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell className="font-medium">{user.userName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.userRole}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.permissions.slice(0, 2).map(permission => (
                              <Badge key={permission} variant="secondary" className="text-xs">
                                {permission.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                            {user.permissions.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{user.permissions.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className={user.failedAttempts > 0 ? 'text-red-600 font-medium' : ''}>
                            {user.failedAttempts}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleUserStatus(user.userId)}
                            >
                              {user.status === 'active' ? (
                                <>
                                  <Lock className="h-3 w-3 mr-1" />
                                  Suspend
                                </>
                              ) : (
                                <>
                                  <Unlock className="h-3 w-3 mr-1" />
                                  Activate
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {securitySettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{setting.name}</h4>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                      {setting.value && (
                        <p className="text-sm text-blue-600 mt-1">
                          Current value: {setting.value} {setting.id === 'session_timeout' ? 'minutes' : ''}
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={() => toggleSecuritySetting(setting.id)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Database Encryption</h4>
                    <p className="text-sm text-muted-foreground">All data encrypted at rest</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Data Backup</h4>
                    <p className="text-sm text-muted-foreground">Last backup: 2 hours ago</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Current</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SSL/TLS</h4>
                    <p className="text-sm text-muted-foreground">All connections encrypted</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Security Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Security Recommendation:</strong> Enable two-factor authentication for all admin users.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Notice:</strong> 3 failed login attempts detected from IP 45.123.67.89 in the last hour.
                  </AlertDescription>
                </Alert>
                
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>System Status:</strong> All security checks passed. System is secure.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}