import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { 
  Settings,
  Shield,
  School,
  Users,
  Bell,
  Database,
  Palette,
  Globe,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Key,
  Zap,
  Clock,
  UserCheck,
  Building,
  Award,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner@2.0.3';

interface SystemSettings {
  school: {
    name: string;
    motto: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    principalName: string;
    vicePrincipalName: string;
    registrationNumber: string;
    establishedYear: string;
  };
  academic: {
    gradingSystem: 'percentage' | 'letter' | 'both';
    passMarkPercentage: number;
    maxStudentsPerClass: number;
    autoPromoteStudents: boolean;
    allowResultModification: boolean;
    requireApprovalForResults: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requirePasswordChange: boolean;
    enableTwoFactor: boolean;
    lockAccountAfterFailedAttempts: number;
    allowMultipleLogins: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    systemAlerts: boolean;
    resultPublishNotification: boolean;
    paymentReminders: boolean;
    attendanceAlerts: boolean;
  };
  automation: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    autoCalculatePositions: boolean;
    autoSendReports: boolean;
    maintenanceMode: boolean;
  };
  appearance: {
    schoolLogoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    theme: 'light' | 'dark' | 'auto';
    compactMode: boolean;
  };
  integrations: {
    facebookPageUrl: string;
    websiteEnabled: boolean;
    admissionFormEnabled: boolean;
    onlinePaymentEnabled: boolean;
    parentPortalEnabled: boolean;
  };
}

export function ComprehensiveAdminSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('school');
  const [settings, setSettings] = useState<SystemSettings>({
    school: {
      name: 'Graceland Royal Academy',
      motto: 'Wisdom & Illumination',
      address: 'Lagos, Nigeria',
      phone: '+234 XXX XXX XXXX',
      email: 'info@gracelandroyalacademy.edu.ng',
      website: 'www.gracelandroyalacademy.edu.ng',
      principalName: '',
      vicePrincipalName: '',
      registrationNumber: '',
      establishedYear: '2020'
    },
    academic: {
      gradingSystem: 'both',
      passMarkPercentage: 40,
      maxStudentsPerClass: 30,
      autoPromoteStudents: false,
      allowResultModification: true,
      requireApprovalForResults: true
    },
    security: {
      sessionTimeout: 60,
      passwordMinLength: 8,
      requirePasswordChange: false,
      enableTwoFactor: false,
      lockAccountAfterFailedAttempts: 5,
      allowMultipleLogins: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      systemAlerts: true,
      resultPublishNotification: true,
      paymentReminders: true,
      attendanceAlerts: true
    },
    automation: {
      autoBackup: true,
      backupFrequency: 'daily',
      autoCalculatePositions: true,
      autoSendReports: false,
      maintenanceMode: false
    },
    appearance: {
      schoolLogoUrl: '',
      primaryColor: '#1e40af',
      secondaryColor: '#f59e0b',
      theme: 'light',
      compactMode: false
    },
    integrations: {
      facebookPageUrl: '',
      websiteEnabled: true,
      admissionFormEnabled: true,
      onlinePaymentEnabled: true,
      parentPortalEnabled: true
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('gra_admin_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  // Save settings
  const saveSettings = async () => {
    if (!user || user.role !== 'admin') {
      toast.error('Only administrators can modify system settings');
      return;
    }

    setIsSaving(true);
    try {
      localStorage.setItem('gra_admin_settings', JSON.stringify(settings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('System settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      localStorage.removeItem('gra_admin_settings');
      window.location.reload();
    }
  };

  const updateSettings = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only administrators can access system settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Settings className="h-6 w-6" />
            System Settings
          </h1>
          <p className="text-muted-foreground">Configure all aspects of the academic management system</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Defaults
          </Button>
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="school" className="flex items-center gap-1">
            <School className="h-3 w-3" />
            <span className="hidden sm:inline">School</span>
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span className="hidden sm:inline">Academic</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            <span className="hidden sm:inline">Automation</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-1">
            <Palette className="h-3 w-3" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
        </TabsList>

        {/* School Information */}
        <TabsContent value="school">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  School Information
                </CardTitle>
                <CardDescription>
                  Basic information about your educational institution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schoolName">School Name *</Label>
                    <Input
                      id="schoolName"
                      value={settings.school.name}
                      onChange={(e) => updateSettings('school', 'name', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="motto">School Motto</Label>
                    <Input
                      id="motto"
                      value={settings.school.motto}
                      onChange={(e) => updateSettings('school', 'motto', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="principalName">Principal Name</Label>
                    <Input
                      id="principalName"
                      value={settings.school.principalName}
                      onChange={(e) => updateSettings('school', 'principalName', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="vicePrincipalName">Vice Principal Name</Label>
                    <Input
                      id="vicePrincipalName"
                      value={settings.school.vicePrincipalName}
                      onChange={(e) => updateSettings('school', 'vicePrincipalName', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="registrationNumber">Registration Number</Label>
                    <Input
                      id="registrationNumber"
                      value={settings.school.registrationNumber}
                      onChange={(e) => updateSettings('school', 'registrationNumber', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="establishedYear">Established Year</Label>
                    <Input
                      id="establishedYear"
                      type="number"
                      value={settings.school.establishedYear}
                      onChange={(e) => updateSettings('school', 'establishedYear', e.target.value)}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label htmlFor="address">School Address</Label>
                  <Textarea
                    id="address"
                    value={settings.school.address}
                    onChange={(e) => updateSettings('school', 'address', e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={settings.school.phone}
                      onChange={(e) => updateSettings('school', 'phone', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.school.email}
                      onChange={(e) => updateSettings('school', 'email', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={settings.school.website}
                      onChange={(e) => updateSettings('school', 'website', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Academic Settings */}
        <TabsContent value="academic">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Academic Configuration
                </CardTitle>
                <CardDescription>
                  Configure grading system and academic policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gradingSystem">Grading System</Label>
                    <Select
                      value={settings.academic.gradingSystem}
                      onValueChange={(value: any) => updateSettings('academic', 'gradingSystem', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage Only</SelectItem>
                        <SelectItem value="letter">Letter Grades Only</SelectItem>
                        <SelectItem value="both">Both Percentage & Letter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="passMarkPercentage">Pass Mark Percentage</Label>
                    <Input
                      id="passMarkPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.academic.passMarkPercentage}
                      onChange={(e) => updateSettings('academic', 'passMarkPercentage', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxStudentsPerClass">Max Students Per Class</Label>
                    <Input
                      id="maxStudentsPerClass"
                      type="number"
                      min="1"
                      max="50"
                      value={settings.academic.maxStudentsPerClass}
                      onChange={(e) => updateSettings('academic', 'maxStudentsPerClass', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="requireApprovalForResults">Require Approval for Results</Label>
                      <p className="text-sm text-muted-foreground">
                        Results must be approved by admin before publishing
                      </p>
                    </div>
                    <Switch
                      id="requireApprovalForResults"
                      checked={settings.academic.requireApprovalForResults}
                      onCheckedChange={(checked) => updateSettings('academic', 'requireApprovalForResults', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowResultModification">Allow Result Modification</Label>
                      <p className="text-sm text-muted-foreground">
                        Teachers can modify submitted results
                      </p>
                    </div>
                    <Switch
                      id="allowResultModification"
                      checked={settings.academic.allowResultModification}
                      onCheckedChange={(checked) => updateSettings('academic', 'allowResultModification', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoPromoteStudents">Auto-Promote Students</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically promote students to next class
                      </p>
                    </div>
                    <Switch
                      id="autoPromoteStudents"
                      checked={settings.academic.autoPromoteStudents}
                      onCheckedChange={(checked) => updateSettings('academic', 'autoPromoteStudents', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Configuration
                </CardTitle>
                <CardDescription>
                  Configure security policies and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="5"
                      max="480"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      min="6"
                      max="32"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => updateSettings('security', 'passwordMinLength', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lockAccountAfterFailedAttempts">Lock Account After Failed Attempts</Label>
                    <Input
                      id="lockAccountAfterFailedAttempts"
                      type="number"
                      min="3"
                      max="10"
                      value={settings.security.lockAccountAfterFailedAttempts}
                      onChange={(e) => updateSettings('security', 'lockAccountAfterFailedAttempts', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="requirePasswordChange">Require Password Change</Label>
                      <p className="text-sm text-muted-foreground">
                        Force users to change default passwords
                      </p>
                    </div>
                    <Switch
                      id="requirePasswordChange"
                      checked={settings.security.requirePasswordChange}
                      onCheckedChange={(checked) => updateSettings('security', 'requirePasswordChange', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for sensitive operations
                      </p>
                    </div>
                    <Switch
                      id="enableTwoFactor"
                      checked={settings.security.enableTwoFactor}
                      onCheckedChange={(checked) => updateSettings('security', 'enableTwoFactor', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowMultipleLogins">Allow Multiple Logins</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow same user to login from multiple devices
                      </p>
                    </div>
                    <Switch
                      id="allowMultipleLogins"
                      checked={settings.security.allowMultipleLogins}
                      onCheckedChange={(checked) => updateSettings('security', 'allowMultipleLogins', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure how and when notifications are sent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications via email
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => updateSettings('notifications', 'emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications via SMS
                      </p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={settings.notifications.smsNotifications}
                      onCheckedChange={(checked) => updateSettings('notifications', 'smsNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="systemAlerts">System Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Show system maintenance and update alerts
                      </p>
                    </div>
                    <Switch
                      id="systemAlerts"
                      checked={settings.notifications.systemAlerts}
                      onCheckedChange={(checked) => updateSettings('notifications', 'systemAlerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="resultPublishNotification">Result Publish Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify parents when results are published
                      </p>
                    </div>
                    <Switch
                      id="resultPublishNotification"
                      checked={settings.notifications.resultPublishNotification}
                      onCheckedChange={(checked) => updateSettings('notifications', 'resultPublishNotification', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="attendanceAlerts">Attendance Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Send attendance notifications to parents
                      </p>
                    </div>
                    <Switch
                      id="attendanceAlerts"
                      checked={settings.notifications.attendanceAlerts}
                      onCheckedChange={(checked) => updateSettings('notifications', 'attendanceAlerts', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automation */}
        <TabsContent value="automation">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Automation Settings
                </CardTitle>
                <CardDescription>
                  Configure automated system tasks and maintenance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select
                      value={settings.automation.backupFrequency}
                      onValueChange={(value: any) => updateSettings('automation', 'backupFrequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoBackup">Automatic Backup</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically backup system data
                      </p>
                    </div>
                    <Switch
                      id="autoBackup"
                      checked={settings.automation.autoBackup}
                      onCheckedChange={(checked) => updateSettings('automation', 'autoBackup', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoCalculatePositions">Auto Calculate Positions</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically calculate student positions
                      </p>
                    </div>
                    <Switch
                      id="autoCalculatePositions"
                      checked={settings.automation.autoCalculatePositions}
                      onCheckedChange={(checked) => updateSettings('automation', 'autoCalculatePositions', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoSendReports">Auto Send Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically send periodic reports
                      </p>
                    </div>
                    <Switch
                      id="autoSendReports"
                      checked={settings.automation.autoSendReports}
                      onCheckedChange={(checked) => updateSettings('automation', 'autoSendReports', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable maintenance mode (restricts access)
                      </p>
                    </div>
                    <Switch
                      id="maintenanceMode"
                      checked={settings.automation.maintenanceMode}
                      onCheckedChange={(checked) => updateSettings('automation', 'maintenanceMode', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of the system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={settings.appearance.theme}
                      onValueChange={(value: any) => updateSettings('appearance', 'theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto (System)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="schoolLogoUrl">School Logo URL</Label>
                    <Input
                      id="schoolLogoUrl"
                      type="url"
                      value={settings.appearance.schoolLogoUrl}
                      onChange={(e) => updateSettings('appearance', 'schoolLogoUrl', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.appearance.primaryColor}
                      onChange={(e) => updateSettings('appearance', 'primaryColor', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.appearance.secondaryColor}
                      onChange={(e) => updateSettings('appearance', 'secondaryColor', e.target.value)}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compactMode">Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Use smaller spacing and compact layouts
                    </p>
                  </div>
                  <Switch
                    id="compactMode"
                    checked={settings.appearance.compactMode}
                    onCheckedChange={(checked) => updateSettings('appearance', 'compactMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  External Integrations
                </CardTitle>
                <CardDescription>
                  Configure external services and integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="facebookPageUrl">Facebook Page URL</Label>
                  <Input
                    id="facebookPageUrl"
                    type="url"
                    value={settings.integrations.facebookPageUrl}
                    onChange={(e) => updateSettings('integrations', 'facebookPageUrl', e.target.value)}
                    placeholder="https://facebook.com/yourschool"
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="websiteEnabled">School Website</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable public school website
                      </p>
                    </div>
                    <Switch
                      id="websiteEnabled"
                      checked={settings.integrations.websiteEnabled}
                      onCheckedChange={(checked) => updateSettings('integrations', 'websiteEnabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="admissionFormEnabled">Admission Form</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable online admission form
                      </p>
                    </div>
                    <Switch
                      id="admissionFormEnabled"
                      checked={settings.integrations.admissionFormEnabled}
                      onCheckedChange={(checked) => updateSettings('integrations', 'admissionFormEnabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="parentPortalEnabled">Parent Portal</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable parent access portal
                      </p>
                    </div>
                    <Switch
                      id="parentPortalEnabled"
                      checked={settings.integrations.parentPortalEnabled}
                      onCheckedChange={(checked) => updateSettings('integrations', 'parentPortalEnabled', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}