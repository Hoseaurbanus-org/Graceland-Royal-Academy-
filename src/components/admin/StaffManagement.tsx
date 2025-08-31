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
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Search, Download, User, Mail, Calendar, Save, X, CheckCircle2, UserPlus, Users, Copy, AlertCircle, Settings, BookOpen, School, Target } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNotifications } from '../NotificationContext';
import { toast } from 'sonner';
// Temporary stub for handleEditStaff to resolve missing function error
function handleEditStaff(staffMember: any) {
  // TODO: Implement edit staff logic
}

export function StaffManagement() {
  const { user, staff, subjects, classes, createUser, updateUser, deleteUser, assignStaffToSubject, assignStaffToClass, removeStaffAssignment, getStaffAssignments } = useAuth();
  const { addNotification } = useNotifications();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedStaffForAssignment, setSelectedStaffForAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'supervisor', qualification: '', date_employed: '' });
  const [assignmentData, setAssignmentData] = useState({ selectedSubjects: [], selectedClasses: [], subjectClassMappings: {} });
  const [formErrors, setFormErrors] = useState({});

  const filteredStaff = staff.filter(staffMember => {
    const matchesSearch = staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) || staffMember.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || staffMember.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async () => {
    // ...existing user creation logic...
  };

  const handleUpdateUser = async () => {
    // ...existing user update logic...
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

  const handleManageAssignments = (staffMember: any) => {
    setSelectedStaffForAssignment(staffMember);
    
    // Load current assignments
    const assignments = getStaffAssignments(staffMember.id);
    const subjectAssignments = assignments.filter(a => a.subject_id);
    const classAssignments = assignments.filter(a => a.class_id && !a.subject_id);
    
    const subjectClassMappings: Record<string, string[]> = {};
    subjectAssignments.forEach(assignment => {
      if (assignment.subject_id && assignment.class_id) {
        if (!subjectClassMappings[assignment.subject_id]) {
          subjectClassMappings[assignment.subject_id] = [];
        }
        subjectClassMappings[assignment.subject_id].push(assignment.class_id);
      }
    });

    setAssignmentData({
      selectedSubjects: [...new Set(subjectAssignments.map(a => a.subject_id!))],
      selectedClasses: classAssignments.map(a => a.class_id!),
      subjectClassMappings
    });
    
    setIsAssignmentDialogOpen(true);
  };

  const handleSaveAssignments = async () => {
    if (!selectedStaffForAssignment) return;

    try {
      // Remove all existing assignments first
      const currentAssignments = getStaffAssignments(selectedStaffForAssignment.id);
      for (const assignment of currentAssignments) {
        await removeStaffAssignment(assignment.id);
      }

      // Add subject assignments with their classes
      for (const subjectId of assignmentData.selectedSubjects) {
        const assignedClasses = assignmentData.subjectClassMappings[subjectId] || [];
        if (assignedClasses.length > 0) {
          await assignStaffToSubject(selectedStaffForAssignment.id, subjectId, assignedClasses);
        }
      }

      // Add standalone class assignments
      for (const classId of assignmentData.selectedClasses) {
        await assignStaffToClass(selectedStaffForAssignment.id, classId);
      }

      setIsAssignmentDialogOpen(false);
      setSelectedStaffForAssignment(null);
      
      toast.success('Assignments updated successfully');
      addNotification({
        type: 'success',
        title: 'Assignments Updated',
        message: `${selectedStaffForAssignment.name}'s subject and class assignments have been updated`,
        autoHide: true
      });
    } catch (error) {
      console.error('Error saving assignments:', error);
      toast.error('Failed to update assignments');
    }
  };

  const toggleSubjectSelection = (subjectId: string) => {
    setAssignmentData(prev => {
      const isSelected = prev.selectedSubjects.includes(subjectId);
      const newSelectedSubjects = isSelected
        ? prev.selectedSubjects.filter(id => id !== subjectId)
        : [...prev.selectedSubjects, subjectId];

      // Remove class mappings if subject is deselected
      const newSubjectClassMappings = { ...prev.subjectClassMappings };
      if (isSelected) {
        delete newSubjectClassMappings[subjectId];
      }

      return {
        ...prev,
        selectedSubjects: newSelectedSubjects,
        subjectClassMappings: newSubjectClassMappings
      };
    });
  };

  const toggleClassForSubject = (subjectId: string, classId: string) => {
    setAssignmentData(prev => ({
      ...prev,
      subjectClassMappings: {
        ...prev.subjectClassMappings,
        [subjectId]: prev.subjectClassMappings[subjectId]?.includes(classId)
          ? prev.subjectClassMappings[subjectId].filter(id => id !== classId)
          : [...(prev.subjectClassMappings[subjectId] || []), classId]
      }
    }));
  };

  const toggleClassSelection = (classId: string) => {
    setAssignmentData(prev => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(classId)
        ? prev.selectedClasses.filter(id => id !== classId)
        : [...prev.selectedClasses, classId]
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'supervisor',
      phone: '',
      qualification: '',
      date_employed: ''
    });
    setFormErrors({});
    setEditingStaff(null);
  };

  const copyCredentials = (email: string) => {
    const credentials = `Email: ${email}\nPassword: password`;
    navigator.clipboard.writeText(credentials);
    toast.success('Credentials copied to clipboard');
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Unknown Subject';
  };

  const getClassName = (classId: string) => {
    return classes.find(c => c.id === classId)?.name || 'Unknown Class';
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
    
    const subjects = [...new Set(subjectAssignments.map(a => a.subject_id))];
    const classes = [...new Set([
      ...subjectAssignments.map(a => a.class_id),
      ...classAssignments.map(a => a.class_id)
    ].filter(Boolean))];

    return {
      subjectCount: subjects.length,
      classCount: classes.length,
      totalAssignments: assignments.length
    };
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.phone || !formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    if (!formData.email || !formData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      // Improved email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Invalid email format';
      }
    }
    if (!formData.role) {
      errors.role = 'Role selection is required';
    }
    if (formData.role === 'supervisor') {
      if (!formData.password || !formData.password.trim()) {
        errors.password = 'Password is required for supervisors';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Refactor: createUserHandler as a standalone function
  async function createUserHandler() {
    if (!validateForm()) return;
    try {
      const result = await createUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      });
      if (result.success) {
        toast.success(`${formData.role} account created successfully`);
        addNotification({
          type: 'success',
          title: 'Staff Account Created',
          message: `${formData.name} has been registered as ${formData.role} with login credentials`,
          autoHide: true
        });
        setFormData({ name: '', email: '', phone: '', password: '', role: 'supervisor', qualification: '', date_employed: '' });
        setIsDialogOpen(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save staff member');
      addNotification({
        type: 'error',
        title: 'Staff Registration Failed',
        message: error instanceof Error ? error.message : 'Failed to save staff member',
        autoHide: true
      });
    }
  }

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
                Staff Management & Assignments
              </CardTitle>
              <CardDescription>
                Create staff accounts, manage assignments, and configure subject-class allocations
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsDialogOpen(true)} size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingStaff ? 'Update staff information' : 'Create new staff account with automatic login credentials'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 p-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Staff Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter staff name"
                          className="mt-1"
                        />
                        {formErrors.name && (
                          <p className="text-xs text-destructive mt-1">{formErrors.name}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter phone number"
                          className="mt-1"
                        />
                        {formErrors.phone && (
                          <p className="text-xs text-destructive mt-1">{formErrors.phone}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter email address"
                          className="mt-1"
                        />
                        {formErrors.email && (
                          <p className="text-xs text-destructive mt-1">{formErrors.email}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="role">Role *</Label>
                        <Select
                          value={formData.role}
                          onValueChange={value => setFormData({ ...formData, role: value })}
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
                      <div>
                        <Label htmlFor="password">Password {formData.role === 'supervisor' && '*'}</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          placeholder={formData.role === 'supervisor' ? 'Set supervisor password' : 'Auto-generated'}
                          className="mt-1"
                          required={formData.role === 'supervisor'}
                          disabled={formData.role !== 'supervisor'}
                        />
                        {formErrors.password && (
                          <p className="text-xs text-destructive mt-1">{formErrors.password}</p>
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

                    {!editingStaff && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <h4 className="font-medium mb-2 text-primary">Login Credentials</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="font-mono">{formData.email || 'Enter email above'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Password:</span>
                            <span className="font-mono">password</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          These credentials will be automatically generated. The staff member can change their password after first login.
                        </p>
                      </div>
                    )}

                    {/* Assignment selection for supervisors */}
                    {formData.role === 'supervisor' && (
                      <div className="mt-4">
                        <Label>Assign Subject-Class Pairs</Label>
                        {Object.entries(assignmentData.subjectClassMappings).map(([subjectId, classIds], idx) => (
                          <div key={subjectId} className="flex flex-col md:flex-row md:items-center gap-2 border rounded p-2 mb-2">
                            <div className="flex-1">
                              <Label>Subject</Label>
                              <Select
                                value={subjectId}
                                onValueChange={newSubjectId => {
                                  setAssignmentData(prev => {
                                    const newMappings = { ...prev.subjectClassMappings };
                                    newMappings[newSubjectId] = newMappings[subjectId] || [];
                                    delete newMappings[subjectId];
                                    return { ...prev, subjectClassMappings: newMappings };
                                  });
                                }}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                                <SelectContent>
                                  {subjects.filter(s => s.is_active && (!assignmentData.subjectClassMappings[s.id] || s.id === subjectId)).map(subject => (
                                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex-1">
                              <Label>Classes</Label>
                              <Select
                                multiple
                                value={classIds}
                                onValueChange={values => {
                                  setAssignmentData(prev => ({
                                    ...prev,
                                    subjectClassMappings: {
                                      ...prev.subjectClassMappings,
                                      [subjectId]: values
                                    }
                                  }));
                                }}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select classes" />
                                </SelectTrigger>
                                <SelectContent>
                                  {classes.filter(c => c.is_active).map(classItem => (
                                    <SelectItem key={classItem.id} value={classItem.id}>{classItem.name} - {classItem.level}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => {
                              setAssignmentData(prev => {
                                const newMappings = { ...prev.subjectClassMappings };
                                delete newMappings[subjectId];
                                return { ...prev, subjectClassMappings: newMappings };
                              });
                            }}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" className="mb-2" onClick={() => {
                          const availableSubjects = subjects.filter(s => s.is_active && !assignmentData.subjectClassMappings[s.id]);
                          if (availableSubjects.length > 0) {
                            setAssignmentData(prev => ({
                              ...prev,
                              subjectClassMappings: {
                                ...prev.subjectClassMappings,
                                [availableSubjects[0].id]: []
                              }
                            }));
                          }
                        }}>
                          <Plus className="h-4 w-4 mr-1" /> Add Subject-Class Pair
                        </Button>
                      </div>
                    )}

                    {formData.name && formData.email && formData.role && (
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Preview:</strong> {formData.name} - {getRoleLabel(formData.role)} - {formData.email}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={createUserHandler} className="w-full sm:w-auto">
                      <Save className="h-4 w-4 mr-2" />
                      {editingStaff ? 'Update Staff' : 'Create Account'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Staff Table */}
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assignments</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff && filteredStaff.length > 0 ? (
                  filteredStaff.map((staffMember, index) => (
                    <TableRow key={staffMember.id}>
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
                        <Badge>{staffMember.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {/* Assignment summary or count here if available */}
                        <span>-</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={staffMember.is_active ? "default" : "secondary"}>
                          {staffMember.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {staffMember.created_at ? new Date(staffMember.created_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditStaff(staffMember)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteStaff(staffMember.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {staffMember.role === 'supervisor' && (
                            <Button variant="outline" size="sm" onClick={() => handleManageAssignments(staffMember)}>
                              <Settings className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No staff found.
                    </TableCell>
                  </TableRow>
                )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Assignment Management Dialog should be outside the Card but inside the main div */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Assignments - {selectedStaffForAssignment?.name}
            </DialogTitle>
            <DialogDescription>
              Assign subjects and classes to this supervisor. They will have access to record results for assigned subjects and classes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {subjects.length === 0 ? (
              <p className="text-muted-foreground">No subjects available. Please add subjects first.</p>
            ) : (
              <>
                {subjects.filter(s => s.is_active).map(subject => (
                  <div key={subject.id} className="border rounded p-3 mb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Checkbox
                        checked={assignmentData.selectedSubjects.includes(subject.id)}
                        onCheckedChange={() => toggleSubjectSelection(subject.id)}
                        id={`subject-${subject.id}`}
                      />
                      <Label htmlFor={`subject-${subject.id}`} className="font-medium">
                        {subject.name}
                      </Label>
                    </div>
                    {assignmentData.selectedSubjects.includes(subject.id) && (
                      <div className="ml-6">
                        <Label className="block mb-1">Assign Classes:</Label>
                        <div className="flex flex-wrap gap-2">
                          {classes.filter(c => c.is_active).map(classItem => (
                            <Checkbox
                              key={classItem.id}
                              checked={assignmentData.subjectClassMappings[subject.id]?.includes(classItem.id) || false}
                              onCheckedChange={() => toggleClassForSubject(subject.id, classItem.id)}
                              id={`class-${subject.id}-${classItem.id}`}
                            />
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {classes.filter(c => c.is_active).map(classItem => (
                            <Label key={classItem.id} htmlFor={`class-${subject.id}-${classItem.id}`} className="text-xs">
                              {classItem.name} - {classItem.level}
                            </Label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <Separator />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>
                    <X className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                  <Button onClick={handleSaveAssignments}>
                    <Save className="h-4 w-4 mr-2" /> Save Assignments
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}