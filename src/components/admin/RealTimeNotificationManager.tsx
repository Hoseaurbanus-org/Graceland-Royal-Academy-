import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Send,
  Bell,
  Users,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Clock,
  Eye,
  Trash2,
  Edit,
  Plus,
  Broadcast,
  UserCheck,
  School,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner@2.0.3';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetRoles: string[];
  targetUsers?: string[];
  isSystemWide: boolean;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  readBy: string[];
  deliveredTo: string[];
}

export function RealTimeNotificationManager() {
  const { user, staff, students } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    targetRoles: [] as string[],
    targetUsers: [] as string[],
    isSystemWide: true,
    expiresAt: ''
  });

  // Load notifications from localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem('gra_notifications');
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage and broadcast
  const saveNotifications = (newNotifications: Notification[]) => {
    setNotifications(newNotifications);
    localStorage.setItem('gra_notifications', JSON.stringify(newNotifications));
    
    // Broadcast to all components
    window.dispatchEvent(new CustomEvent('notificationsUpdated', { 
      detail: newNotifications 
    }));
  };

  const createNotification = () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast.error('Please fill in title and message');
      return;
    }

    if (!notificationForm.isSystemWide && notificationForm.targetRoles.length === 0 && notificationForm.targetUsers.length === 0) {
      toast.error('Please select target roles or users');
      return;
    }

    const newNotification: Notification = {
      id: `notification-${Date.now()}`,
      title: notificationForm.title,
      message: notificationForm.message,
      type: notificationForm.type,
      priority: notificationForm.priority,
      targetRoles: notificationForm.targetRoles,
      targetUsers: notificationForm.targetUsers,
      isSystemWide: notificationForm.isSystemWide,
      createdBy: user?.id || '',
      createdAt: new Date().toISOString(),
      expiresAt: notificationForm.expiresAt || undefined,
      isActive: true,
      readBy: [],
      deliveredTo: []
    };

    const updatedNotifications = [newNotification, ...notifications];
    saveNotifications(updatedNotifications);

    // Reset form
    setNotificationForm({
      title: '',
      message: '',
      type: 'info',
      priority: 'medium',
      targetRoles: [],
      targetUsers: [],
      isSystemWide: true,
      expiresAt: ''
    });

    setIsCreateDialogOpen(false);
    toast.success('Notification sent successfully!');
  };

  const deleteNotification = (notificationId: string) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      saveNotifications(updatedNotifications);
      toast.success('Notification deleted');
    }
  };

  const toggleNotificationStatus = (notificationId: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, isActive: !n.isActive } : n
    );
    saveNotifications(updatedNotifications);
    toast.success('Notification status updated');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTargetAudience = (notification: Notification) => {
    if (notification.isSystemWide) return 'All Users';
    
    const roles = notification.targetRoles;
    const users = notification.targetUsers;
    
    let audience = [];
    if (roles.length > 0) audience.push(`${roles.length} role(s)`);
    if (users.length > 0) audience.push(`${users.length} user(s)`);
    
    return audience.join(', ') || 'No targets';
  };

  const roleOptions = [
    { value: 'admin', label: 'Administrators', icon: School },
    { value: 'supervisor', label: 'Supervisors', icon: UserCheck },
    { value: 'accountant', label: 'Accountants', icon: CreditCard },
    { value: 'parent', label: 'Parents', icon: Users }
  ];

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only administrators can manage notifications.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            Real-time Notification Manager
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Send instant notifications to all user dashboards</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
              <DialogDescription>
                Send real-time notifications to specific roles or all users
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Notification Title *</Label>
                  <Input
                    id="title"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                    placeholder="Enter notification title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={notificationForm.type} onValueChange={(value: any) => setNotificationForm({ ...notificationForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-600" />
                          Information
                        </div>
                      </SelectItem>
                      <SelectItem value="success">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Success
                        </div>
                      </SelectItem>
                      <SelectItem value="warning">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          Warning
                        </div>
                      </SelectItem>
                      <SelectItem value="error">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          Error
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={notificationForm.priority} onValueChange={(value: any) => setNotificationForm({ ...notificationForm, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={notificationForm.expiresAt}
                    onChange={(e) => setNotificationForm({ ...notificationForm, expiresAt: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  placeholder="Enter notification message"
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="systemWide"
                    checked={notificationForm.isSystemWide}
                    onCheckedChange={(checked) => setNotificationForm({ ...notificationForm, isSystemWide: !!checked })}
                  />
                  <Label htmlFor="systemWide" className="flex items-center gap-2">
                    <Broadcast className="h-4 w-4" />
                    Send to all users (System-wide)
                  </Label>
                </div>

                {!notificationForm.isSystemWide && (
                  <div className="space-y-3 pl-6 border-l-2 border-muted">
                    <div>
                      <Label>Target Roles</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {roleOptions.map((role) => {
                          const Icon = role.icon;
                          return (
                            <div key={role.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`role-${role.value}`}
                                checked={notificationForm.targetRoles.includes(role.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setNotificationForm({
                                      ...notificationForm,
                                      targetRoles: [...notificationForm.targetRoles, role.value]
                                    });
                                  } else {
                                    setNotificationForm({
                                      ...notificationForm,
                                      targetRoles: notificationForm.targetRoles.filter(r => r !== role.value)
                                    });
                                  }
                                }}
                              />
                              <Label htmlFor={`role-${role.value}`} className="flex items-center gap-2 text-sm">
                                <Icon className="h-3 w-3" />
                                {role.label}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createNotification}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Quick Send</TabsTrigger>
          <TabsTrigger value="manage">Manage Notifications</TabsTrigger>
        </TabsList>

        {/* Quick Send Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Quick Notification
              </CardTitle>
              <CardDescription>
                Send instant notifications without opening the full dialog
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Quick notification title"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  />
                  <Select value={notificationForm.type} onValueChange={(value: any) => setNotificationForm({ ...notificationForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Information</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Textarea
                  placeholder="Enter your message here..."
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  rows={3}
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="quickSystemWide"
                      checked={notificationForm.isSystemWide}
                      onCheckedChange={(checked) => setNotificationForm({ ...notificationForm, isSystemWide: !!checked })}
                    />
                    <Label htmlFor="quickSystemWide">Send to all users</Label>
                  </div>
                  
                  <Button onClick={createNotification} disabled={!notificationForm.title || !notificationForm.message}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Notifications Tab */}
        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification History
              </CardTitle>
              <CardDescription>
                View and manage sent notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border rounded-lg bg-card"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{notification.title}</h4>
                            <Badge className={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                            {!notification.isActive && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {getTargetAudience(notification)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {notification.readBy.length} read
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleNotificationStatus(notification.id)}
                        >
                          {notification.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {notifications.length === 0 && (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No notifications sent yet</p>
                    <p className="text-sm text-muted-foreground">Create your first notification to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}