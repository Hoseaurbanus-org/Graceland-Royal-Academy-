import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Send, 
  Users, 
  Bell, 
  MessageSquare, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Clock,
  UserPlus,
  BookOpen,
  Settings,
  Target,
  Zap,
  Plus
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNotifications } from '../NotificationContext';
import { toast } from 'sonner@2.0.3';

interface QuickNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  target: 'all' | 'parents' | 'supervisors' | 'accountants' | 'specific';
  targetUsers?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  status: 'draft' | 'sent' | 'scheduled';
}

export function FunctionalQuickActions() {
  const { user, students, staff, classes, subjects } = useAuth();
  const { addNotification } = useNotifications();
  
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    target: 'all' as const,
    priority: 'medium' as const,
    targetUsers: [] as string[]
  });

  const quickActions = [
    {
      id: 'send_notification',
      title: 'Send Notification',
      description: 'Send announcement to users',
      icon: Bell,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => setIsNotificationDialogOpen(true)
    },
    {
      id: 'register_student',
      title: 'Quick Student Registration',
      description: 'Add new student',
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: () => {
        // Navigate to student registration
        toast.info('Opening student registration...');
        // In a real app, this would navigate to the registration form
      }
    },
    {
      id: 'create_class',
      title: 'Create New Class',
      description: 'Add new class level',
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: () => {
        toast.info('Opening class creation...');
        // Navigate to class creation
      }
    },
    {
      id: 'system_backup',
      title: 'System Backup',
      description: 'Backup school data',
      icon: Settings,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: () => {
        toast.success('System backup initiated');
        addNotification({
          type: 'success',
          title: 'System Backup',
          message: 'Data backup has been started successfully',
          autoHide: true
        });
      }
    },
    {
      id: 'performance_review',
      title: 'Performance Review',
      description: 'View system analytics',
      icon: Target,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      action: () => {
        toast.info('Opening performance analytics...');
        addNotification({
          type: 'info',
          title: 'Analytics Review',
          message: 'Performance metrics are being prepared',
          autoHide: true
        });
      }
    },
    {
      id: 'urgent_broadcast',
      title: 'Emergency Broadcast',
      description: 'Send urgent message',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      action: () => {
        setNotificationForm(prev => ({
          ...prev,
          priority: 'urgent',
          type: 'warning',
          target: 'all'
        }));
        setIsNotificationDialogOpen(true);
      }
    }
  ];

  const handleSendNotification = () => {
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Create notification object
    const notification: QuickNotification = {
      id: Date.now().toString(),
      title: notificationForm.title,
      message: notificationForm.message,
      type: notificationForm.type,
      target: notificationForm.target,
      targetUsers: notificationForm.targetUsers,
      priority: notificationForm.priority,
      createdAt: new Date(),
      status: 'sent'
    };

    // Add to system notifications
    addNotification({
      type: notification.type,
      title: notification.title,
      message: notification.message,
      autoHide: notification.priority !== 'urgent'
    });

    // Simulate sending to specific user groups
    const getTargetCount = () => {
      switch (notification.target) {
        case 'parents': 
          return students.filter(s => s.is_active).length;
        case 'supervisors': 
          return staff.filter(s => s.role === 'supervisor').length;
        case 'accountants': 
          return staff.filter(s => s.role === 'accountant').length;
        case 'specific': 
          return notification.targetUsers?.length || 0;
        default: 
          return students.length + staff.length;
      }
    };

    const targetCount = getTargetCount();
    
    toast.success(`Notification sent to ${targetCount} recipients`);
    
    console.log('Notification sent:', {
      ...notification,
      targetCount,
      sentBy: user?.name,
      timestamp: new Date().toISOString()
    });

    // Reset form
    setNotificationForm({
      title: '',
      message: '',
      type: 'info',
      target: 'all',
      priority: 'medium',
      targetUsers: []
    });
    
    setIsNotificationDialogOpen(false);
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Perform common administrative tasks quickly and efficiently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 hover:shadow-md transition-all duration-200"
                  onClick={action.action}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className={`p-2 rounded-lg ${action.bgColor}`}>
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Active Students</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {students.filter(s => s.is_active).length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Staff</p>
                  <p className="text-2xl font-bold text-green-800">{staff.length}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Classes</p>
                  <p className="text-2xl font-bold text-purple-800">{classes.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Subjects</p>
                  <p className="text-2xl font-bold text-orange-800">{subjects.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Notification Dialog */}
      <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Send Notification
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notif-type">Notification Type</Label>
                <Select 
                  value={notificationForm.type} 
                  onValueChange={(value: any) => setNotificationForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-500" />
                        Information
                      </div>
                    </SelectItem>
                    <SelectItem value="success">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Success
                      </div>
                    </SelectItem>
                    <SelectItem value="warning">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Warning
                      </div>
                    </SelectItem>
                    <SelectItem value="error">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Error
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notif-priority">Priority Level</Label>
                <Select 
                  value={notificationForm.priority} 
                  onValueChange={(value: any) => setNotificationForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Urgent
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notif-target">Send To</Label>
              <Select 
                value={notificationForm.target} 
                onValueChange={(value: any) => setNotificationForm(prev => ({ ...prev, target: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="parents">Parents Only</SelectItem>
                  <SelectItem value="supervisors">Supervisors Only</SelectItem>
                  <SelectItem value="accountants">Accountants Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notif-title">Title *</Label>
              <Input
                id="notif-title"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter notification title..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notif-message">Message *</Label>
              <Textarea
                id="notif-message"
                value={notificationForm.message}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter your message here..."
                rows={4}
                className="mt-1"
              />
            </div>

            {/* Preview */}
            {(notificationForm.title || notificationForm.message) && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className={`p-4 rounded-lg border-2 ${getPriorityColor(notificationForm.priority)}`}>
                  <div className="flex items-start gap-3">
                    {getNotificationTypeIcon(notificationForm.type)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{notificationForm.title || 'Notification Title'}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {notificationForm.message || 'Notification message will appear here...'}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {notificationForm.priority} priority
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          to {notificationForm.target}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsNotificationDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSendNotification} className="gap-2">
                <Send className="h-4 w-4" />
                Send Notification
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}