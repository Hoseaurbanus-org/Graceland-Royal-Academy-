import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { motion } from 'motion/react';
import { 
  Plus, 
  Send, 
  Bell, 
  Users, 
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  X,
  Save,
  Eye,
  Clock,
  Target,
  Megaphone
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNotifications } from '../NotificationContext';
import { toast } from 'sonner@2.0.3';

export function SystemNotificationManager() {
  const { 
    user,
    systemNotifications,
    sendSystemNotification
  } = useAuth();
  
  const { addNotification } = useNotifications();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    target_roles: [] as string[],
    expires_at: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      errors.title = 'Notification title is required';
    }

    if (!formData.message?.trim()) {
      errors.message = 'Notification message is required';
    }

    if (formData.target_roles.length === 0) {
      errors.target_roles = 'At least one target role must be selected';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendNotification = async () => {
    if (!validateForm()) return;

    try {
      const result = await sendSystemNotification({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        target_roles: formData.target_roles,
        expires_at: formData.expires_at || undefined
      });

      if (result.success) {
        toast.success('System notification sent successfully');
        addNotification({
          type: 'success',
          title: 'Notification Sent',
          message: `"${formData.title}" has been sent to ${formData.target_roles.join(', ')}`,
          autoHide: true
        });

        // Also add the notification to the user's notification center
        addNotification({
          type: formData.type,
          title: formData.title,
          message: formData.message,
          autoHide: formData.expires_at ? false : true
        });

        resetForm();
        setIsDialogOpen(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send notification');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      target_roles: [],
      expires_at: ''
    });
    setFormErrors({});
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      target_roles: prev.target_roles.includes(role)
        ? prev.target_roles.filter(r => r !== role)
        : [...prev.target_roles, role]
    }));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isNotificationExpired = (notification: any) => {
    if (!notification.expires_at) return false;
    return new Date() > new Date(notification.expires_at);
  };

  const activeNotifications = systemNotifications.filter(n => n.is_active && !isNotificationExpired(n));
  const expiredNotifications = systemNotifications.filter(n => !n.is_active || isNotificationExpired(n));

  if (user?.role !== 'admin') {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
        <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                System Notification Manager
              </CardTitle>
              <CardDescription>
                Send system-wide notifications to staff, supervisors, accountants, and parents
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Send System Notification</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Notification Content */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Notification Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Enter notification title"
                          className="mt-1"
                        />
                        {formErrors.title && (
                          <p className="text-xs text-destructive mt-1">{formErrors.title}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Enter notification message"
                          rows={4}
                          className="mt-1"
                        />
                        {formErrors.message && (
                          <p className="text-xs text-destructive mt-1">{formErrors.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="type">Notification Type</Label>
                        <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                          <SelectTrigger className="mt-1">
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
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                Warning
                              </div>
                            </SelectItem>
                            <SelectItem value="error">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                Error/Alert
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Target Audience */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Target Audience</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Select who should receive this notification
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {['supervisor', 'accountant', 'parent'].map(role => (
                          <div key={role} className="flex items-center space-x-2">
                            <Checkbox
                              id={`role-${role}`}
                              checked={formData.target_roles.includes(role)}
                              onCheckedChange={() => toggleRole(role)}
                            />
                            <Label htmlFor={`role-${role}`} className="capitalize">
                              {role}s
                            </Label>
                          </div>
                        ))}
                      </div>
                      {formErrors.target_roles && (
                        <p className="text-xs text-destructive mt-2">{formErrors.target_roles}</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Optional Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Optional Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label htmlFor="expires_at">Expiry Date (Optional)</Label>
                        <Input
                          id="expires_at"
                          type="datetime-local"
                          value={formData.expires_at}
                          onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave empty for notifications that don't expire
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Preview */}
                  {formData.title && formData.message && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-lg p-4 bg-muted/50">
                          <div className="flex items-start gap-3">
                            {getNotificationIcon(formData.type)}
                            <div className="flex-1">
                              <p className="font-medium">{formData.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">{formData.message}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={getNotificationTypeColor(formData.type)}>
                                  {formData.type}
                                </Badge>
                                <Badge variant="outline">
                                  To: {formData.target_roles.join(', ')}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSendNotification}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Notification
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Sent</p>
                      <p className="text-2xl font-bold text-primary">{systemNotifications.length}</p>
                    </div>
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active</p>
                      <p className="text-2xl font-bold text-primary">{activeNotifications.length}</p>
                    </div>
                    <Bell className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Expired</p>
                      <p className="text-2xl font-bold text-primary">{expiredNotifications.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">This Week</p>
                      <p className="text-2xl font-bold text-primary">
                        {systemNotifications.filter(n => {
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          return new Date(n.sent_at) > weekAgo;
                        }).length}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Active Notifications */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Active Notifications</h3>
              {activeNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active notifications</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Notification</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Target Audience</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeNotifications
                        .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
                        .map((notification, index) => (
                          <motion.tr
                            key={notification.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="hover:bg-muted/50"
                          >
                            <TableCell>
                              <div className="flex items-start gap-3">
                                {getNotificationIcon(notification.type)}
                                <div>
                
                                  <p className="font-medium">{notification.title}</p>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {notification.message}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getNotificationTypeColor(notification.type)}>
                                {notification.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span className="text-sm">{notification.target_roles.join(', ')}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(notification.sent_at).toLocaleDateString()}
                                <div className="text-muted-foreground">
                                  {new Date(notification.sent_at).toLocaleTimeString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {notification.expires_at ? (
                                <div className="text-sm">
                                  {new Date(notification.expires_at).toLocaleDateString()}
                                </div>
                              ) : (
                                <Badge variant="outline">Never</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedNotification(notification);
                                  setViewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Notification Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(selectedNotification.type)}
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{selectedNotification.title}</h3>
                      <p className="text-muted-foreground mt-2">{selectedNotification.message}</p>
                      
                      <div className="flex items-center gap-4 mt-4">
                        <Badge className={getNotificationTypeColor(selectedNotification.type)}>
                          {selectedNotification.type}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-4 w-4" />
                          {selectedNotification.target_roles.join(', ')}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Sent:</span>
                          <div>{new Date(selectedNotification.sent_at).toLocaleString()}</div>
                        </div>
                        {selectedNotification.expires_at && (
                          <div>
                            <span className="text-muted-foreground">Expires:</span>
                            <div>{new Date(selectedNotification.expires_at).toLocaleString()}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}