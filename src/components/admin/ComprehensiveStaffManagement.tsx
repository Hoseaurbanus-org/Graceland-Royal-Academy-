import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { motion } from 'motion/react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  User,
  Mail,
  Save,
  X,
  CheckCircle2,
  UserPlus,
  Users,
  Copy,
  AlertCircle,
  Settings,
  BookOpen,
  School,
  Target,
  Eye,
  EyeOff,
  Key
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNotifications } from '../NotificationContext';
import { toast } from 'sonner@2.0.3';

export function ComprehensiveStaffManagement() {
  const { 
    user,
    subjects, 
    classes,
    createUser,
    updateUser,
    deleteUser,
    getStaffAssignments
  } = useAuth();
  
  const { addNotification } = useNotifications();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'supervisor' as 'supervisor' | 'accountant',
    phone: '',
    qualification: '',
    date_employed: '',
    assignedSubjects: [] as string[],
    assignedClasses: [] as string[]
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Get created users from localStorage
  const getCreatedUsers = () => {
    try {
      const stored = localStorage.getItem('gra_created_users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const allUsers = getCreatedUsers();
  const staffUsers = allUsers.filter((u: any) => u.role === 'supervisor' || u.role === 'accountant');

  // Filter staff based on search and role filter
  const filteredStaff = staffUsers.filter((member: any) => {
    const matchesSearch = !searchTerm || 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    
    return matchesSearch && matchesRole && member.is_active;
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      errors.email = 'Invalid email format';
    } else {
      // Check for duplicate email
      const existingUser = allUsers.find((u: any) => 
        u.email === formData.email && 
        (!editingStaff || u.id !== editingStaff.id)
      );
      if (existingUser) {
        errors.email = 'Email already exists';
      }
    }

    if (!formData.password?.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) {
      errors.role = 'Role selection is required';
    }

    if (formData.role === 'supervisor' && formData.assignedSubjects.length === 0 && formData.assignedClasses.length === 0) {
      errors.assignments = 'Supervisors must have at least one subject or class assignment';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const handleSaveStaff = async () => {
    if (!validateForm()) return;

    try {
      if (editingStaff) {
        // Update existing staff
        const result = await updateUser(editingStaff.id, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });

        if (result.success) {
          toast.success('Staff member updated successfully');
          addNotification({
            type: 'success',
            title: 'Staff Updated',
            message: `${formData.name} has been updated successfully`,
            autoHide: true
          });
        } else {
          throw new Error(result.error);
        }
      } else {
        // Add new staff with assignments
        const result = await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          assignedSubjects: formData.assignedSubjects,
          assignedClasses: formData.assignedClasses
        });

        if (result.success) {
          toast.success(`${formData.role} account created successfully`);
          addNotification({
            type: 'success',
            title: 'Staff Account Created',
            message: `${formData.name} has been registered as ${formData.role} with login credentials and assignments`,
            autoHide: true,
            action: {
              label: 'Copy Credentials',
              onClick: () => copyCredentials(formData.email, formData.password)
            }
          });
          
          // Show credentials information
          setTimeout(() => {
            toast.info(`Login credentials: ${formData.email} / ${formData.password}`, {
              duration: 10000
            });
          }, 1000);
        } else {
          throw new Error(result.error);
        }
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving staff:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save staff member');
      addNotification({
        type: 'error',
        title: 'Staff Registration Failed',
        message: error instanceof Error ? error.message : 'Failed to save staff member',
        autoHide: true
      });
    }
  };

  const handleEditStaff = (staffMember: any) => {
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      password: staffMember.password || '',
      role: staffMember.role,
      phone: '',
      qualification: '',
      date_employed: '',
      assignedSubjects: [],
      assignedClasses: []
    });
    setEditingStaff(staffMember);
    setIsDialogOpen(true);
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (deleteConfirm === staffId) {
      try {
        const result = await deleteUser(staffId);
        if (result.success) {
          toast.success('Staff member removed successfully');
          addNotification({
            type: 'warning',
            title: 'Staff Removed',
            message: 'Staff member and all their assignments have been removed',
            autoHide: true
          });
          setDeleteConfirm(null);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Error deleting staff:', error);
        toast.error('Failed to remove staff member');
      }
    } else {
      setDeleteConfirm(staffId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'supervisor',
      phone: '',
      qualification: '',
      date_employed: '',
      assignedSubjects: [],
      assignedClasses: []
    });
    setFormErrors({});
    setEditingStaff(null);
    setShowPassword(false);
  };

  const copyCredentials = (email: string, password: string) => {
    const credentials = `Email: ${email}\nPassword: ${password}`;
    navigator.clipboard.writeText(credentials);
    toast.success('Credentials copied to clipboard');
  };

  const toggleSubjectSelection = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedSubjects: prev.assignedSubjects.includes(subjectId)
        ? prev.assignedSubjects.filter(id => id !== subjectId)
        : [...prev.assignedSubjects, subjectId]
    }));
  };

  const toggleClassSelection = (classId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedClasses: prev.assignedClasses.includes(classId)
        ? prev.assignedClasses.filter(id => id !== classId)
        : [...prev.assignedClasses, classId]
    }));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'accountant': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'supervisor': return 'Supervisor';
      case 'accountant': return 'Accountant';
      default: return role;
    }
  };

  const getStaffAssignmentSummary = (staffId: string) => {
    const assignments = getStaffAssignments(staffId);
    const subjectAssignments = assignments.filter(a => a.subject_id);
    const classAssignments = assignments.filter(a => a.class_id && !a.subject_id);
    
    const subjectIds = [...new Set(subjectAssignments.map(a => a.subject_id))];
    const classIds = [...new Set([
      ...subjectAssignments.map(a => a.class_id),
      ...classAssignments.map(a => a.class_id)
    ].filter(Boolean))];

    return {
      subjectCount: subjectIds.length,
      classCount: classIds.length,
      totalAssignments: assignments.length
    };
  };

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
                <Users className="h-5 w-5 text-primary" />
                Comprehensive Staff Management
              </CardTitle>
              <CardDescription>
                Create staff accounts with custom passwords and assign subjects/classes during creation
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()} size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto mx-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingStaff ? 'Edit Staff Member' : 'Create New Staff Account'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingStaff ? 'Update staff information and credentials' : 'Create new staff account with custom password and assignments'}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 p-1">
                    {/* Basic Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Enter full name"
                              className="mt-1"
                            />
                            {formErrors.name && (
                              <p className="text-xs text-destructive mt-1">{formErrors.name}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="staff@gra.edu"
                              className="mt-1"
                            />
                            {formErrors.email && (
                              <p className="text-xs text-destructive mt-1">{formErrors.email}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="role">Role *</Label>
                          <Select 
                            value={formData.role} 
                            onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="supervisor">Supervisor</SelectItem>
                              <SelectItem value="accountant">Accountant</SelectItem>
                            </SelectContent>
                          </Select>
                          {formErrors.role && (
                            <p className="text-xs text-destructive mt-1">{formErrors.role}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Password Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          Login Credentials
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Set a custom password for this staff member's account
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="password">Password *</Label>
                          <div className="flex gap-2 mt-1">
                            <div className="relative flex-1">
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Enter secure password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={generatePassword}
                              className="flex items-center gap-2"
                            >
                              <Settings className="h-4 w-4" />
                              Generate
                            </Button>
                          </div>
                          {formErrors.password && (
                            <p className="text-xs text-destructive mt-1">{formErrors.password}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Minimum 6 characters. Use the generate button for a secure password.
                          </p>
                        </div>

                        {formData.email && formData.password && (
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                            <h4 className="font-medium mb-2 text-primary">Login Credentials Preview</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-mono">{formData.email}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Password:</span>
                                <span className="font-mono">{showPassword ? formData.password : '••••••••'}</span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => copyCredentials(formData.email, formData.password)}
                              className="mt-2 w-full"
                            >
                              <Copy className="h-3 w-3 mr-2" />
                              Copy Credentials
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Assignments for Supervisors */}
                    {formData.role === 'supervisor' && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Subject & Class Assignments</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Assign subjects and classes to this supervisor. They will have access to record results for assigned combinations.
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Subject Assignments */}
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              Teaching Subjects
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {subjects.filter(s => s.is_active).map(subject => (
                                <div key={subject.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`subject-${subject.id}`}
                                    checked={formData.assignedSubjects.includes(subject.id)}
                                    onCheckedChange={() => toggleSubjectSelection(subject.id)}
                                  />
                                  <Label htmlFor={`subject-${subject.id}`} className="text-sm">
                                    {subject.name} ({subject.code})
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator />

                          {/* Class Assignments */}
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <School className="h-4 w-4" />
                              Assigned Classes
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {classes.filter(c => c.is_active).map(classItem => (
                                <div key={classItem.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`class-${classItem.id}`}
                                    checked={formData.assignedClasses.includes(classItem.id)}
                                    onCheckedChange={() => toggleClassSelection(classItem.id)}
                                  />
                                  <Label htmlFor={`class-${classItem.id}`} className="text-sm">
                                    {classItem.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          {formErrors.assignments && (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-destructive">
                                {formErrors.assignments}
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Assignment Summary */}
                          {(formData.assignedSubjects.length > 0 || formData.assignedClasses.length > 0) && (
                            <Alert>
                              <CheckCircle2 className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Assignment Summary:</strong>
                                <ul className="mt-2 space-y-1 text-sm">
                                  {formData.assignedSubjects.length > 0 && (
                                    <li>• {formData.assignedSubjects.length} subject{formData.assignedSubjects.length !== 1 ? 's' : ''} for teaching</li>
                                  )}
                                  {formData.assignedClasses.length > 0 && (
                                    <li>• {formData.assignedClasses.length} class{formData.assignedClasses.length !== 1 ? 'es' : ''} for supervision</li>
                                  )}
                                  <li>• Teaching combinations: {formData.assignedSubjects.length * formData.assignedClasses.length}</li>
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Preview */}
                    {formData.name && formData.email && formData.role && formData.password && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                              <span className="font-medium">Preview:</span>
                              <span>{formData.name}</span>
                              <span className="text-muted-foreground">•</span>
                              <span>{getRoleLabel(formData.role)}</span>
                              <span className="text-muted-foreground">•</span>
                              <span>{formData.email}</span>
                            </div>
                            {formData.role === 'supervisor' && (formData.assignedSubjects.length > 0 || formData.assignedClasses.length > 0) && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Assignments: {formData.assignedSubjects.length} subjects × {formData.assignedClasses.length} classes = {formData.assignedSubjects.length * formData.assignedClasses.length} teaching combinations
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSaveStaff} className="w-full sm:w-auto">
                        <Save className="h-4 w-4 mr-2" />
                        {editingStaff ? 'Update Staff' : 'Create Account'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="supervisor">Supervisors</SelectItem>
                  <SelectItem value="accountant">Accountants</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
                      <p className="text-sm text-muted-foreground">Total Staff</p>
                      <p className="text-2xl font-bold text-primary">{staffUsers.filter((s: any) => s.is_active).length}</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
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
                      <p className="text-sm text-muted-foreground">Supervisors</p>
                      <p className="text-2xl font-bold text-primary">
                        {staffUsers.filter((s: any) => s.role === 'supervisor' && s.is_active).length}
                      </p>
                    </div>
                    <User className="h-8 w-8 text-primary" />
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
                      <p className="text-sm text-muted-foreground">Accountants</p>
                      <p className="text-2xl font-bold text-primary">
                        {staffUsers.filter((s: any) => s.role === 'accountant' && s.is_active).length}
                      </p>
                    </div>
                    <Mail className="h-8 w-8 text-primary" />
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
                      <p className="text-sm text-muted-foreground">Total Assignments</p>
                      <p className="text-2xl font-bold text-primary">
                        {staffUsers.reduce((total: number, s: any) => total + getStaffAssignmentSummary(s.id).totalAssignments, 0)}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Staff Table */}
          {filteredStaff.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {staffUsers.length === 0 ? 'No staff members created yet' : 'No staff match your search'}
              </p>
              <p className="text-sm text-muted-foreground">
                {staffUsers.length === 0 ? 'Start by adding your first staff member' : 'Try adjusting your search criteria'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Details</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Login Credentials</TableHead>
                    <TableHead>Assignments</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staffMember: any, index) => {
                    const assignmentSummary = getStaffAssignmentSummary(staffMember.id);
                    return (
                      <motion.tr
                        key={staffMember.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="hover:bg-muted/50"
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{staffMember.name}</p>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span>{staffMember.email}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(staffMember.role)}>
                            {getRoleLabel(staffMember.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-mono bg-muted px-2 py-1 rounded">{staffMember.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-mono bg-muted px-2 py-1 rounded">••••••••</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyCredentials(staffMember.email, staffMember.password || 'password')}
                                className="h-6 px-2 text-xs"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {assignmentSummary.subjectCount > 0 && (
                              <div className="flex items-center gap-1 text-xs">
                                <BookOpen className="h-3 w-3" />
                                <span>{assignmentSummary.subjectCount} subject{assignmentSummary.subjectCount !== 1 ? 's' : ''}</span>
                              </div>
                            )}
                            {assignmentSummary.classCount > 0 && (
                              <div className="flex items-center gap-1 text-xs">
                                <School className="h-3 w-3" />
                                <span>{assignmentSummary.classCount} class{assignmentSummary.classCount !== 1 ? 'es' : ''}</span>
                              </div>
                            )}
                            {assignmentSummary.totalAssignments === 0 && (
                              <span className="text-xs text-muted-foreground">No assignments</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={staffMember.is_active ? "default" : "secondary"}>
                            {staffMember.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditStaff(staffMember)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteStaff(staffMember.id)}
                              className={`${deleteConfirm === staffMember.id ? 'bg-destructive text-destructive-foreground' : 'text-destructive hover:bg-destructive/10'}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}