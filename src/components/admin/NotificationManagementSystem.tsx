import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import { 
  Bell, 
  Plus, 
  Send, 
  Users, 
  BookOpen, 
  Calendar, 
  Edit, 
  Trash2,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { motion } from 'motion/react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'general' | 'assignment' | 'urgent' | 'info';
  target_roles: string[];
  target_classes?: string[];
  created_by: string;
  created_at: string;
  is_active: boolean;
  read_by?: string[];
}

interface SubjectAssignment {
  id: string;
  staff_id: string;
  subject_id: string;
  class_id: string;
  assigned_by: string;
  assigned_at: string;
  is_active: boolean;
}

interface Staff {
  id: string;
  full_name: string;
  email: string;
  role: 'teacher' | 'subject_supervisor' | 'class_supervisor';
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Class {
  id: string;
  name: string;
  level: string;
}

export const NotificationManagementSystem: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [assignments, setAssignments] = useState<SubjectAssignment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'general' as const,
    target_roles: [] as string[],
    target_classes: [] as string[],
  });

  const [assignmentForm, setAssignmentForm] = useState({
    staff_id: '',
    subject_id: '',
    class_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load from localStorage for demo
      const localNotifications = localStorage.getItem('graceland_notifications');
      const localAssignments = localStorage.getItem('graceland_assignments');
      const localStaff = localStorage.getItem('graceland_staff');
      const localSubjects = localStorage.getItem('graceland_subjects');
      const localClasses = localStorage.getItem('graceland_classes');

      if (localNotifications) setNotifications(JSON.parse(localNotifications));
      if (localAssignments) setAssignments(JSON.parse(localAssignments));
      if (localStaff) setStaff(JSON.parse(localStaff));
      if (localSubjects) setSubjects(JSON.parse(localSubjects));
      if (localClasses) setClasses(JSON.parse(localClasses));

      // Create some demo data if none exists
      if (!localStaff) {
        const demoStaff = [
          { id: '1', full_name: 'Dr. Sarah Johnson', email: 'sarah@gra.edu', role: 'subject_supervisor' as const },
          { id: '2', full_name: 'Mr. John Smith', email: 'john@gra.edu', role: 'teacher' as const },
          { id: '3', full_name: 'Mrs. Mary Wilson', email: 'mary@gra.edu', role: 'class_supervisor' as const },
        ];
        setStaff(demoStaff);
        localStorage.setItem('graceland_staff', JSON.stringify(demoStaff));
      }

      if (!localSubjects) {
        const demoSubjects = [
          { id: '1', name: 'Mathematics', code: 'MATH' },
          { id: '2', name: 'English Language', code: 'ENG' },
          { id: '3', name: 'Physics', code: 'PHY' },
          { id: '4', name: 'Chemistry', code: 'CHEM' },
          { id: '5', name: 'Biology', code: 'BIO' },
        ];
        setSubjects(demoSubjects);
        localStorage.setItem('graceland_subjects', JSON.stringify(demoSubjects));
      }

      if (!localClasses) {
        const demoClasses = [
          { id: '1', name: 'JSS 1A', level: 'JSS1' },
          { id: '2', name: 'JSS 1B', level: 'JSS1' },
          { id: '3', name: 'JSS 2A', level: 'JSS2' },
          { id: '4', name: 'SS 1A', level: 'SS1' },
          { id: '5', name: 'SS 2A', level: 'SS2' },
        ];
        setClasses(demoClasses);
        localStorage.setItem('graceland_classes', JSON.stringify(demoClasses));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationForm.title || !notificationForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newNotification: Notification = {
        id: Date.now().toString(),
        ...notificationForm,
        created_by: user?.id || 'admin',
        created_at: new Date().toISOString(),
        is_active: true,
        read_by: [],
      };

      const updatedNotifications = [newNotification, ...notifications];
      setNotifications(updatedNotifications);
      localStorage.setItem('graceland_notifications', JSON.stringify(updatedNotifications));

      toast.success('Notification sent successfully');
      resetNotificationForm();
      setIsNotificationDialogOpen(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentForm.staff_id || !assignmentForm.subject_id || !assignmentForm.class_id) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const newAssignment: SubjectAssignment = {
        id: Date.now().toString(),
        ...assignmentForm,
        assigned_by: user?.id || 'admin',
        assigned_at: new Date().toISOString(),
        is_active: true,
      };

      const updatedAssignments = [newAssignment, ...assignments];
      setAssignments(updatedAssignments);
      localStorage.setItem('graceland_assignments', JSON.stringify(updatedAssignments));

      // Create notification for the assigned staff
      const staffMember = staff.find(s => s.id === assignmentForm.staff_id);
      const subject = subjects.find(s => s.id === assignmentForm.subject_id);
      const className = classes.find(c => c.id === assignmentForm.class_id);

      if (staffMember && subject && className) {
        const assignmentNotification: Notification = {
          id: (Date.now() + 1).toString(),
          title: 'New Subject Assignment',
          message: `You have been assigned to teach ${subject.name} for ${className.name}. Please check your dashboard for score input options.`,
          type: 'assignment',
          target_roles: [staffMember.role],
          created_by: user?.id || 'admin',
          created_at: new Date().toISOString(),
          is_active: true,
          read_by: [],
        };

        const updatedNotificationsWithAssignment = [assignmentNotification, ...notifications];
        setNotifications(updatedNotificationsWithAssignment);
        localStorage.setItem('graceland_notifications', JSON.stringify(updatedNotificationsWithAssignment));
      }

      toast.success('Subject assigned successfully');
      resetAssignmentForm();
      setIsAssignmentDialogOpen(false);
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const resetNotificationForm = () => {
    setNotificationForm({
      title: '',
      message: '',
      type: 'general',
      target_roles: [],
      target_classes: [],
    });
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({
      staff_id: '',
      subject_id: '',
      class_id: '',
    });
  };

  const handleDeleteNotification = (id: string) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      const updatedNotifications = notifications.filter(n => n.id !== id);
      setNotifications(updatedNotifications);
      localStorage.setItem('graceland_notifications', JSON.stringify(updatedNotifications));
      toast.success('Notification deleted');
    }
  };

  const handleDeleteAssignment = (id: string) => {
    if (confirm('Are you sure you want to remove this assignment?')) {
      const updatedAssignments = assignments.filter(a => a.id !== id);
      setAssignments(updatedAssignments);
      localStorage.setItem('graceland_assignments', JSON.stringify(updatedAssignments));
      toast.success('Assignment removed');
    }
  };

  const getStaffName = (staffId: string) => {
    return staff.find(s => s.id === staffId)?.full_name || 'Unknown Staff';
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Unknown Subject';
  };

  const getClassName = (classId: string) => {
    return classes.find(c => c.id === classId)?.name || 'Unknown Class';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <BookOpen className="w-4 h-4" />;
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <MessageSquare className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'assignment': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'info': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy">Notification & Assignment Center</h2>
          <p className="text-gray-600">Manage staff notifications and subject assignments</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-navy hover:bg-navy/80 text-white">
                <Bell className="w-4 h-4 mr-2" />
                New Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-navy">Create New Notification</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleNotificationSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Notification title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Notification message"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={notificationForm.type} 
                    onValueChange={(value: any) => setNotificationForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="info">Information</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Roles</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['teacher', 'subject_supervisor', 'class_supervisor', 'parent'].map((role) => (
                      <label key={role} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={notificationForm.target_roles.includes(role)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNotificationForm(prev => ({
                                ...prev,
                                target_roles: [...prev.target_roles, role]
                              }));
                            } else {
                              setNotificationForm(prev => ({
                                ...prev,
                                target_roles: prev.target_roles.filter(r => r !== role)
                              }));
                            }
                          }}
                        />
                        <span className="capitalize">{role.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsNotificationDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-navy hover:bg-navy/80">
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? 'Sending...' : 'Send Notification'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gold hover:bg-gold/80 text-navy">
                <BookOpen className="w-4 h-4 mr-2" />
                Assign Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-navy">Assign Subject to Staff</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="staff_id">Staff Member *</Label>
                  <Select 
                    value={assignmentForm.staff_id} 
                    onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, staff_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.full_name} ({member.role.replace('_', ' ')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject_id">Subject *</Label>
                  <Select 
                    value={assignmentForm.subject_id} 
                    onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, subject_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="class_id">Class *</Label>
                  <Select 
                    value={assignmentForm.class_id} 
                    onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, class_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-gold hover:bg-gold/80 text-navy">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {loading ? 'Assigning...' : 'Assign Subject'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-navy">
              <Bell className="w-5 h-5 mr-2" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border ${getNotificationColor(notification.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm opacity-80 mt-1">{notification.message}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.type}
                            </Badge>
                            <span className="text-xs opacity-60">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subject Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-navy">
              <BookOpen className="w-5 h-5 mr-2" />
              Subject Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading assignments...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No assignments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.slice(0, 5).map((assignment) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-navy">
                          {getSubjectName(assignment.subject_id)}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">{getStaffName(assignment.staff_id)}</span> → {getClassName(assignment.class_id)}
                        </p>
                        <span className="text-xs text-gray-500 mt-2 block">
                          Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-navy to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Notifications</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-white/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gold to-yellow-500 text-navy">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-navy/80 text-sm">Subject Assignments</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-navy/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Active Staff</p>
                <p className="text-2xl font-bold">{staff.length}</p>
              </div>
              <Users className="w-8 h-8 text-white/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Subjects</p>
                <p className="text-2xl font-bold">{subjects.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-white/60" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationManagementSystem;