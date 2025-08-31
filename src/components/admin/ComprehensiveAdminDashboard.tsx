import React, { useState } from 'react';
import { motion } from 'motion/react';
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
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  GraduationCap, 
  BookOpen, 
  School,
  UserPlus,
  Settings,
  CheckCircle,
  Clock,
  FileText,
  Eye,
  Printer,
  Camera,
  Upload,
  X,
  Save,
  AlertCircle,
  BarChart3,
  Calendar,
  Target,
  Search,
  Filter,
  Download,
  Send,
  Shield,
  CreditCard,
  TrendingUp,
  Star,
  Award
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNavigation } from '../Layout';
import { SchoolLogo } from '../SchoolLogo';
import { toast } from 'sonner@2.0.3';

export function ComprehensiveAdminDashboard() {
  const { 
    user,
    students = [],
    classes = [],
    subjects = [],
    staff = [],
    results = [],
    payments = [],
    currentSession,
    currentTerm,
    createClass,
    updateClass,
    deleteClass,
    createSubject,
    updateSubject,
    deleteSubject,
    createStaff,
    updateStaff,
    deleteStaff,
    registerStudent,
    updateStudent,
    deleteStudent,
    assignSubjectsToClass,
    assignSubjectsToStudent,
    approveResults,
    publishResults,
    uploadStudentPhoto,
    getStudentsByClass,
    setActiveSessionTerm
  } = useAuth();

  const { currentView } = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [classDialog, setClassDialog] = useState(false);
  const [subjectDialog, setSubjectDialog] = useState(false);
  const [staffDialog, setStaffDialog] = useState(false);
  const [studentDialog, setStudentDialog] = useState(false);
  const [assignmentDialog, setAssignmentDialog] = useState(false);
  const [sessionDialog, setSessionDialog] = useState(false);
  
  // Form states
  const [classForm, setClassForm] = useState({ id: '', name: '', level: '', capacity: 25 });
  const [subjectForm, setSubjectForm] = useState({ id: '', name: '', code: '', description: '' });
  const [staffForm, setStaffForm] = useState({ 
    id: '', 
    name: '', 
    email: '', 
    password: '', 
    role: 'supervisor' as 'supervisor' | 'accountant',
    assigned_classes: [] as string[], 
    assigned_subjects: [] as string[] 
  });
  const [studentForm, setStudentForm] = useState({ 
    id: '', 
    name: '', 
    admission_number: '', 
    class_id: '', 
    parent_name: '', 
    parent_email: '', 
    photo: null as File | null 
  });
  const [assignmentForm, setAssignmentForm] = useState({ type: 'class', class_id: '', subject_ids: [] as string[] });
  const [sessionForm, setSessionForm] = useState({ session: '', term: '' });
  
  const [photoPreview, setPhotoPreview] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);

  // Safe array filtering with null checks
  const activeStudents = Array.isArray(students) ? students.filter(s => s?.is_active) : [];
  const activeClasses = Array.isArray(classes) ? classes.filter(c => c?.is_active) : [];
  const activeSubjects = Array.isArray(subjects) ? subjects.filter(s => s?.is_active) : [];
  const activeStaff = Array.isArray(staff) ? staff.filter(s => s?.is_active) : [];
  const submittedResults = Array.isArray(results) ? results.filter(r => r?.status === 'submitted') : [];
  const approvedResults = Array.isArray(results) ? results.filter(r => r?.status === 'approved') : [];
  const completedPayments = Array.isArray(payments) ? payments.filter(p => p?.status === 'completed') : [];

  // Statistics with safe defaults
  const stats = {
    totalStudents: activeStudents.length,
    totalClasses: activeClasses.length,
    totalSubjects: activeSubjects.length,
    totalStaff: activeStaff.length,
    pendingResults: submittedResults.length,
    approvedResults: approvedResults.length,
    totalRevenue: completedPayments.reduce((sum, p) => sum + (p?.amount || 0), 0),
    pendingPayments: Array.isArray(payments) ? payments.filter(p => p?.status === 'pending').length : 0
  };

  // Generate admission number
  const generateAdmissionNumber = () => {
    const year = new Date().getFullYear();
    const count = activeStudents.length + 1;
    return `GRA/${year}/${String(count).padStart(4, '0')}`;
  };

  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setStudentForm({ ...studentForm, photo: file });
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset forms
  const resetForms = () => {
    setClassForm({ id: '', name: '', level: '', capacity: 25 });
    setSubjectForm({ id: '', name: '', code: '', description: '' });
    setStaffForm({ id: '', name: '', email: '', password: '', role: 'supervisor', assigned_classes: [], assigned_subjects: [] });
    setStudentForm({ id: '', name: '', admission_number: '', class_id: '', parent_name: '', parent_email: '', photo: null });
    setAssignmentForm({ type: 'class', class_id: '', subject_ids: [] });
    setSessionForm({ session: '', term: '' });
    setPhotoPreview('');
    setEditingItem(null);
  };

  // Handle form submissions
  const handleClassSubmit = async () => {
    if (!classForm.name || !classForm.level) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingItem) {
        await updateClass?.(editingItem.id, {
          name: classForm.name,
          level: classForm.level,
          capacity: classForm.capacity
        });
      } else {
        await createClass?.({
          name: classForm.name,
          level: classForm.level,
          capacity: classForm.capacity
        });
      }
      setClassDialog(false);
      resetForms();
    } catch (error) {
      toast.error('Failed to save class');
    }
  };

  const handleSubjectSubmit = async () => {
    if (!subjectForm.name || !subjectForm.code) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingItem) {
        await updateSubject?.(editingItem.id, {
          name: subjectForm.name,
          code: subjectForm.code,
          description: subjectForm.description
        });
      } else {
        await createSubject?.({
          name: subjectForm.name,
          code: subjectForm.code,
          description: subjectForm.description
        });
      }
      setSubjectDialog(false);
      resetForms();
    } catch (error) {
      toast.error('Failed to save subject');
    }
  };

  const handleStaffSubmit = async () => {
    if (!staffForm.name || !staffForm.email || (!editingItem && !staffForm.password)) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingItem) {
        await updateStaff?.(editingItem.id, {
          name: staffForm.name,
          email: staffForm.email,
          assigned_classes: staffForm.assigned_classes,
          assigned_subjects: staffForm.assigned_subjects
        });
      } else {
        await createStaff?.({
          name: staffForm.name,
          email: staffForm.email,
          password: staffForm.password,
          role: staffForm.role,
          assigned_classes: staffForm.assigned_classes,
          assigned_subjects: staffForm.assigned_subjects
        });
      }
      setStaffDialog(false);
      resetForms();
    } catch (error) {
      toast.error('Failed to save staff');
    }
  };

  const handleStudentSubmit = async () => {
    if (!studentForm.name || !studentForm.class_id) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingItem) {
        await updateStudent?.(editingItem.id, {
          name: studentForm.name,
          admission_number: studentForm.admission_number,
          class_id: studentForm.class_id
        });
      } else {
        await registerStudent?.({
          name: studentForm.name,
          admission_number: studentForm.admission_number || generateAdmissionNumber(),
          class_id: studentForm.class_id,
          parent_name: studentForm.parent_name || undefined,
          parent_email: studentForm.parent_email || undefined,
          photo: studentForm.photo || undefined
        });
      }
      setStudentDialog(false);
      resetForms();
    } catch (error) {
      toast.error('Failed to save student');
    }
  };

  const handleAssignmentSubmit = async () => {
    if (!assignmentForm.class_id || assignmentForm.subject_ids.length === 0) {
      toast.error('Please select class and subjects');
      return;
    }

    try {
      await assignSubjectsToClass?.(assignmentForm.class_id, assignmentForm.subject_ids);
      setAssignmentDialog(false);
      resetForms();
    } catch (error) {
      toast.error('Failed to assign subjects');
    }
  };

  const handleSessionSubmit = async () => {
    if (!sessionForm.session || !sessionForm.term) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await setActiveSessionTerm?.(sessionForm.session, sessionForm.term);
      setSessionDialog(false);
      resetForms();
    } catch (error) {
      toast.error('Failed to set active session/term');
    }
  };

  const handleEdit = (item: any, type: string) => {
    if (!item) return;
    
    setEditingItem(item);
    
    switch (type) {
      case 'class':
        setClassForm({
          id: item.id || '',
          name: item.name || '',
          level: item.level || '',
          capacity: item.capacity || 25
        });
        setClassDialog(true);
        break;
      case 'subject':
        setSubjectForm({
          id: item.id || '',
          name: item.name || '',
          code: item.code || '',
          description: item.description || ''
        });
        setSubjectDialog(true);
        break;
      case 'staff':
        setStaffForm({
          id: item.id || '',
          name: item.name || '',
          email: item.email || '',
          password: '',
          role: 'supervisor',
          assigned_classes: item.assigned_classes || [],
          assigned_subjects: item.assigned_subjects || []
        });
        setStaffDialog(true);
        break;
      case 'student':
        setStudentForm({
          id: item.id || '',
          name: item.name || '',
          admission_number: item.admission_number || '',
          class_id: item.class_id || '',
          parent_name: '',
          parent_email: '',
          photo: null
        });
        if (item.photo_url) setPhotoPreview(item.photo_url);
        setStudentDialog(true);
        break;
    }
  };

  const handleDelete = async (id: string, type: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      switch (type) {
        case 'class':
          await deleteClass?.(id);
          break;
        case 'subject':
          await deleteSubject?.(id);
          break;
        case 'staff':
          await deleteStaff?.(id);
          break;
        case 'student':
          await deleteStudent?.(id);
          break;
      }
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleApproveResults = async (classId: string, subjectId: string) => {
    try {
      await approveResults?.(classId, subjectId, currentSession || '', currentTerm || '');
    } catch (error) {
      toast.error('Failed to approve results');
    }
  };

  const handlePublishResults = async (classId: string) => {
    try {
      await publishResults?.(classId, currentSession || '', currentTerm || '');
    } catch (error) {
      toast.error('Failed to publish results');
    }
  };

  // Get class results for review with safe array handling
  const getClassResults = () => {
    const resultsByClass: Record<string, any> = {};
    
    if (Array.isArray(results)) {
      results.forEach(result => {
        if (result && result.class_id && result.subject_id) {
          if (!resultsByClass[result.class_id]) {
            resultsByClass[result.class_id] = {};
          }
          if (!resultsByClass[result.class_id][result.subject_id]) {
            resultsByClass[result.class_id][result.subject_id] = [];
          }
          resultsByClass[result.class_id][result.subject_id].push(result);
        }
      });
    }

    return resultsByClass;
  };

  const classResults = getClassResults();

  // Safe function for getting students by class
  const safeGetStudentsByClass = (classId: string) => {
    if (typeof getStudentsByClass === 'function') {
      return getStudentsByClass(classId) || [];
    }
    return activeStudents.filter(s => s?.class_id === classId) || [];
  };

  // Filter data based on search
  const filteredStudents = activeStudents.filter(s => 
    s?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s?.admission_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStaff = activeStaff.filter(s => 
    s?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'academic':
        return (
          <div className="space-y-6">
            <Tabs defaultValue="classes">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="classes">Classes</TabsTrigger>
                <TabsTrigger value="subjects">Subjects</TabsTrigger>
              </TabsList>
              
              <TabsContent value="classes">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Class Management</CardTitle>
                        <CardDescription>Add, edit, and manage school classes</CardDescription>
                      </div>
                      <Dialog open={classDialog} onOpenChange={setClassDialog}>
                        <DialogTrigger asChild>
                          <Button onClick={resetForms} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Class
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit Class' : 'Add New Class'}</DialogTitle>
                            <DialogDescription>
                              {editingItem ? 'Update the class information below.' : 'Enter the details for the new class.'}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="className">Class Name *</Label>
                              <Input
                                id="className"
                                value={classForm.name}
                                onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                                placeholder="e.g., Primary 1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="classLevel">Level *</Label>
                              <Select value={classForm.level} onValueChange={(value) => setClassForm({ ...classForm, level: value })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pre-Primary">Pre-Primary</SelectItem>
                                  <SelectItem value="Primary">Primary</SelectItem>
                                  <SelectItem value="Junior Secondary">Junior Secondary</SelectItem>
                                  <SelectItem value="Senior Secondary">Senior Secondary</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="capacity">Capacity</Label>
                              <Input
                                id="capacity"
                                type="number"
                                value={classForm.capacity}
                                onChange={(e) => setClassForm({ ...classForm, capacity: parseInt(e.target.value) || 25 })}
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setClassDialog(false)}>Cancel</Button>
                              <Button onClick={handleClassSubmit}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Class
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead>Subjects</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeClasses.map((classItem) => (
                            <TableRow key={classItem.id}>
                              <TableCell className="font-medium">{classItem.name}</TableCell>
                              <TableCell>{classItem.level}</TableCell>
                              <TableCell>{classItem.capacity}</TableCell>
                              <TableCell>{safeGetStudentsByClass(classItem.id).length}</TableCell>
                              <TableCell>{classItem.assigned_subjects?.length || 0}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm" onClick={() => handleEdit(classItem, 'class')}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleDelete(classItem.id, 'class')}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {activeClasses.length === 0 && (
                      <div className="text-center py-8">
                        <School className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No classes created yet</p>
                        <p className="text-sm text-muted-foreground">Start by adding your first class</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="subjects">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Subject Management</CardTitle>
                        <CardDescription>Add, edit, and manage school subjects</CardDescription>
                      </div>
                      <Dialog open={subjectDialog} onOpenChange={setSubjectDialog}>
                        <DialogTrigger asChild>
                          <Button onClick={resetForms} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Subject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
                            <DialogDescription>
                              {editingItem ? 'Update the subject information below.' : 'Enter the details for the new subject.'}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="subjectName">Subject Name *</Label>
                              <Input
                                id="subjectName"
                                value={subjectForm.name}
                                onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                                placeholder="e.g., Mathematics"
                              />
                            </div>
                            <div>
                              <Label htmlFor="subjectCode">Subject Code *</Label>
                              <Input
                                id="subjectCode"
                                value={subjectForm.code}
                                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                                placeholder="e.g., MTH"
                              />
                            </div>
                            <div>
                              <Label htmlFor="description">Description</Label>
                              <Input
                                id="description"
                                value={subjectForm.description}
                                onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                                placeholder="Brief description"
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setSubjectDialog(false)}>Cancel</Button>
                              <Button onClick={handleSubjectSubmit}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Subject
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Classes</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeSubjects.map((subject) => (
                            <TableRow key={subject.id}>
                              <TableCell className="font-medium">{subject.name}</TableCell>
                              <TableCell><Badge variant="outline">{subject.code}</Badge></TableCell>
                              <TableCell>{subject.description}</TableCell>
                              <TableCell>
                                {activeClasses.filter(c => c.assigned_subjects.includes(subject.id)).length}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm" onClick={() => handleEdit(subject, 'subject')}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleDelete(subject.id, 'subject')}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {activeSubjects.length === 0 && (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No subjects created yet</p>
                        <p className="text-sm text-muted-foreground">Start by adding your first subject</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'staff':
        return (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Staff Management</CardTitle>
                  <CardDescription>Add and manage teaching staff and accountants</CardDescription>
                </div>
                <Dialog open={staffDialog} onOpenChange={setStaffDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForms} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Staff
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
                      <DialogDescription>
                        {editingItem ? 'Update the staff member information and assignments.' : 'Enter the details for the new staff member and assign classes/subjects.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="staffName">Full Name *</Label>
                          <Input
                            id="staffName"
                            value={staffForm.name}
                            onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                            placeholder="Enter full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="staffEmail">Email *</Label>
                          <Input
                            id="staffEmail"
                            type="email"
                            value={staffForm.email}
                            onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                            placeholder="staff@gra.edu"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="staffRole">Role *</Label>
                        <Select value={staffForm.role} onValueChange={(value: 'supervisor' | 'accountant') => setStaffForm({ ...staffForm, role: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="supervisor">
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4" />
                                <span>Supervisor</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="accountant">
                              <div className="flex items-center space-x-2">
                                <CreditCard className="h-4 w-4" />
                                <span>Accountant</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {!editingItem && (
                        <div>
                          <Label htmlFor="staffPassword">Password *</Label>
                          <Input
                            id="staffPassword"
                            type="password"
                            value={staffForm.password}
                            onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                            placeholder="Enter password"
                          />
                        </div>
                      )}

                      {staffForm.role === 'supervisor' && (
                        <>
                          <div>
                            <Label>Assigned Classes</Label>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-3">
                              {activeClasses.map(classItem => (
                                <div key={classItem.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={staffForm.assigned_classes.includes(classItem.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setStaffForm({
                                          ...staffForm,
                                          assigned_classes: [...staffForm.assigned_classes, classItem.id]
                                        });
                                      } else {
                                        setStaffForm({
                                          ...staffForm,
                                          assigned_classes: staffForm.assigned_classes.filter(id => id !== classItem.id)
                                        });
                                      }
                                    }}
                                  />
                                  <Label className="text-sm">{classItem.name}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label>Assigned Subjects</Label>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-3">
                              {activeSubjects.map(subject => (
                                <div key={subject.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={staffForm.assigned_subjects.includes(subject.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setStaffForm({
                                          ...staffForm,
                                          assigned_subjects: [...staffForm.assigned_subjects, subject.id]
                                        });
                                      } else {
                                        setStaffForm({
                                          ...staffForm,
                                          assigned_subjects: staffForm.assigned_subjects.filter(id => id !== subject.id)
                                        });
                                      }
                                    }}
                                  />
                                  <Label className="text-sm">{subject.name}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setStaffDialog(false)}>Cancel</Button>
                        <Button onClick={handleStaffSubmit}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Staff
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Search staff..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Classes</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.map((staffMember) => (
                        <TableRow key={staffMember.id}>
                          <TableCell className="font-medium">{staffMember.name}</TableCell>
                          <TableCell>{staffMember.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {staffMember.email.includes('accountant') ? 'Accountant' : 'Supervisor'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{staffMember.assigned_classes.length} classes</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{staffMember.assigned_subjects.length} subjects</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(staffMember, 'staff')}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(staffMember.id, 'staff')}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredStaff.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No staff members found</p>
                    <p className="text-sm text-muted-foreground">Add supervisors and accountants to manage the school</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'students':
        return (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Student Management</CardTitle>
                  <CardDescription>Register and manage students with parent accounts</CardDescription>
                </div>
                <Dialog open={studentDialog} onOpenChange={setStudentDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForms} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Register Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Edit Student' : 'Register New Student'}</DialogTitle>
                      <DialogDescription>
                        {editingItem ? 'Update the student information below.' : 'Enter the student details and optionally create a parent account.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Photo Upload */}
                      <div className="flex items-center space-x-6">
                        <div className="flex-shrink-0">
                          <Avatar className="w-24 h-24">
                            <AvatarImage src={photoPreview} alt="Student photo" />
                            <AvatarFallback className="bg-muted">
                              <Camera className="w-8 h-8 text-muted-foreground" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <input
                            type="file"
                            id="photo-upload"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('photo-upload')?.click()}
                            className="flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Upload Photo
                          </Button>
                          <p className="text-sm text-muted-foreground mt-2">
                            Upload a passport-style photo (max 5MB)
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="studentName">Student Name *</Label>
                          <Input
                            id="studentName"
                            value={studentForm.name}
                            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                            placeholder="Enter full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="admissionNumber">Admission Number</Label>
                          <Input
                            id="admissionNumber"
                            value={studentForm.admission_number}
                            onChange={(e) => setStudentForm({ ...studentForm, admission_number: e.target.value })}
                            placeholder={generateAdmissionNumber()}
                          />
                          <p className="text-xs text-muted-foreground">Leave blank for auto-generation</p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="studentClass">Class *</Label>
                        <Select value={studentForm.class_id} onValueChange={(value) => setStudentForm({ ...studentForm, class_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeClasses.map(classItem => (
                              <SelectItem key={classItem.id} value={classItem.id}>
                                {classItem.name} - {classItem.level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {!editingItem && (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="parentName">Parent Name</Label>
                              <Input
                                id="parentName"
                                value={studentForm.parent_name}
                                onChange={(e) => setStudentForm({ ...studentForm, parent_name: e.target.value })}
                                placeholder="Parent's full name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="parentEmail">Parent Email</Label>
                              <Input
                                id="parentEmail"
                                type="email"
                                value={studentForm.parent_email}
                                onChange={(e) => setStudentForm({ ...studentForm, parent_email: e.target.value })}
                                placeholder="parent@email.com"
                              />
                            </div>
                          </div>
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              If parent details are provided, a parent account will be created automatically with login access.
                            </AlertDescription>
                          </Alert>
                        </>
                      )}

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setStudentDialog(false)}>Cancel</Button>
                        <Button onClick={handleStudentSubmit}>
                          <Save className="h-4 w-4 mr-2" />
                          {editingItem ? 'Update Student' : 'Register Student'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Photo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Admission No.</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={student.photo_url} alt={student.name} />
                              <AvatarFallback className="text-xs">
                                {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell><Badge variant="outline">{student.admission_number}</Badge></TableCell>
                          <TableCell>
                            {activeClasses.find(c => c.id === student.class_id)?.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{student.assigned_subjects.length} subjects</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(student, 'student')}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(student.id, 'student')}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredStudents.length === 0 && (
                  <div className="text-center py-8">
                    <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No students found</p>
                    <p className="text-sm text-muted-foreground">Register students to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'assignments':
        return (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Subject Assignment</CardTitle>
                  <CardDescription>Assign subjects to classes</CardDescription>
                </div>
                <Dialog open={assignmentDialog} onOpenChange={setAssignmentDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForms} size="sm">
                      <Target className="h-4 w-4 mr-2" />
                      Assign Subjects
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Assign Subjects to Class</DialogTitle>
                      <DialogDescription>
                        Select a class and choose which subjects to assign to it.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Select Class</Label>
                        <Select value={assignmentForm.class_id} onValueChange={(value) => setAssignmentForm({ ...assignmentForm, class_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeClasses.map(classItem => (
                              <SelectItem key={classItem.id} value={classItem.id}>
                                {classItem.name} - {classItem.level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Select Subjects</Label>
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded p-3">
                          {activeSubjects.map(subject => (
                            <div key={subject.id} className="flex items-center space-x-2">
                              <Checkbox
                                checked={assignmentForm.subject_ids.includes(subject.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setAssignmentForm({
                                      ...assignmentForm,
                                      subject_ids: [...assignmentForm.subject_ids, subject.id]
                                    });
                                  } else {
                                    setAssignmentForm({
                                      ...assignmentForm,
                                      subject_ids: assignmentForm.subject_ids.filter(id => id !== subject.id)
                                    });
                                  }
                                }}
                              />
                              <Label className="text-sm">{subject.name} ({subject.code})</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setAssignmentDialog(false)}>Cancel</Button>
                        <Button onClick={handleAssignmentSubmit}>
                          <Save className="h-4 w-4 mr-2" />
                          Assign Subjects
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeClasses.map(classItem => (
                  <div key={classItem.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{classItem.name} - {classItem.level}</h4>
                      <Badge variant="outline">{classItem.assigned_subjects.length} subjects</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {classItem.assigned_subjects.map(subjectId => {
                        const subject = activeSubjects.find(s => s.id === subjectId);
                        return subject ? (
                          <Badge key={subjectId} variant="secondary">
                            {subject.name}
                          </Badge>
                        ) : null;
                      })}
                      {classItem.assigned_subjects.length === 0 && (
                        <span className="text-sm text-muted-foreground">No subjects assigned</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'results':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Result Review & Approval</CardTitle>
              <CardDescription>Review submitted results and approve for parent access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(classResults).map(([classId, classSubjects]) => {
                  const classInfo = activeClasses.find(c => c.id === classId);
                  if (!classInfo) return null;

                  return (
                    <div key={classId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-lg">{classInfo.name} - {classInfo.level}</h3>
                        <Button
                          onClick={() => handlePublishResults(classId)}
                          disabled={!Object.values(classSubjects as any).some((results: any) => 
                            results.some((r: any) => r.status === 'approved')
                          )}
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Publish All Results
                        </Button>
                      </div>

                      <div className="grid gap-4">
                        {Object.entries(classSubjects as any).map(([subjectId, subjectResults]) => {
                          const subject = activeSubjects.find(s => s.id === subjectId);
                          const results = subjectResults as any[];
                          const submittedResults = results.filter(r => r.status === 'submitted');
                          const approvedResults = results.filter(r => r.status === 'approved');

                          if (!subject || results.length === 0) return null;

                          return (
                            <div key={subjectId} className="border rounded p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium">{subject.name} ({subject.code})</h4>
                                  <Badge variant={submittedResults.length > 0 ? "default" : "secondary"}>
                                    {submittedResults.length} pending
                                  </Badge>
                                  <Badge variant={approvedResults.length > 0 ? "default" : "outline"}>
                                    {approvedResults.length} approved
                                  </Badge>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      console.log('View results for', subject.name, 'in', classInfo.name);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveResults(classId, subjectId)}
                                    disabled={submittedResults.length === 0}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {results.length} total results • Average: {
                                  Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length) || 0
                                }%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {Object.keys(classResults).length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No results submitted yet</p>
                    <p className="text-sm text-muted-foreground">Results will appear here when supervisors submit them</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'sessions':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Session & Term Management</CardTitle>
              <CardDescription>Manage academic sessions and terms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Current Academic Period</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentSession} - {currentTerm}
                    </p>
                  </div>
                  <Dialog open={sessionDialog} onOpenChange={setSessionDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={resetForms} size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Change Session/Term
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Set Active Session & Term</DialogTitle>
                        <DialogDescription>
                          Select the active academic session and term. This will affect all users and result recording across the system.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="session">Academic Session</Label>
                          <Select value={sessionForm.session} onValueChange={(value) => setSessionForm({ ...sessionForm, session: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select session" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2024/2025">2024/2025</SelectItem>
                              <SelectItem value="2025/2026">2025/2026</SelectItem>
                              <SelectItem value="2026/2027">2026/2027</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="term">Academic Term</Label>
                          <Select value={sessionForm.term} onValueChange={(value) => setSessionForm({ ...sessionForm, term: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select term" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="First Term">First Term</SelectItem>
                              <SelectItem value="Second Term">Second Term</SelectItem>
                              <SelectItem value="Third Term">Third Term</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setSessionDialog(false)}>Cancel</Button>
                          <Button onClick={handleSessionSubmit}>
                            <Save className="h-4 w-4 mr-2" />
                            Set Active
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Changing the active session/term will affect all users and result recording across the system.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
                <CardDescription>Overview of system performance and usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-6 bg-primary/5 rounded-lg">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold text-primary">{stats.totalStudents}</p>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <Star className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold text-green-600">{stats.approvedResults}</p>
                    <p className="text-sm text-muted-foreground">Approved Results</p>
                  </div>
                  <div className="text-center p-6 bg-academic-gold/10 rounded-lg">
                    <Award className="w-8 h-8 mx-auto mb-2 text-academic-gold" />
                    <p className="text-2xl font-bold text-academic-gold">₦{(stats.totalRevenue / 1000).toFixed(0)}K</p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Alert>
              <BarChart3 className="h-4 w-4" />
              <AlertDescription>
                Advanced analytics and reporting features will be available in the full version.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system preferences and security</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Advanced system settings and security features will be available in the full version.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Students</p>
                        <p className="text-lg sm:text-2xl font-bold text-primary">{stats.totalStudents}</p>
                      </div>
                      <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Classes</p>
                        <p className="text-lg sm:text-2xl font-bold text-primary">{stats.totalClasses}</p>
                      </div>
                      <School className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Subjects</p>
                        <p className="text-lg sm:text-2xl font-bold text-primary">{stats.totalSubjects}</p>
                      </div>
                      <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Staff</p>
                        <p className="text-lg sm:text-2xl font-bold text-primary">{stats.totalStaff}</p>
                      </div>
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
                        <p className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pendingResults}</p>
                      </div>
                      <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Approved</p>
                        <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.approvedResults}</p>
                      </div>
                      <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Revenue</p>
                        <p className="text-lg sm:text-2xl font-bold text-green-600">₦{(stats.totalRevenue / 1000).toFixed(0)}K</p>
                      </div>
                      <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Payments</p>
                        <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.pendingPayments}</p>
                      </div>
                      <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <UserPlus className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{stats.totalStudents} students registered</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{stats.pendingResults} results pending approval</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{stats.approvedResults} results approved</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">₦{stats.totalRevenue.toLocaleString()} total revenue</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => {setStudentDialog(true); resetForms();}} className="w-full text-xs sm:text-sm">
                      <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Add Student
                    </Button>
                    <Button variant="outline" onClick={() => {setStaffDialog(true); resetForms();}} className="w-full text-xs sm:text-sm">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Add Staff
                    </Button>
                    <Button variant="outline" onClick={() => {setClassDialog(true); resetForms();}} className="w-full text-xs sm:text-sm">
                      <School className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Add Class
                    </Button>
                    <Button variant="outline" onClick={() => {setSubjectDialog(true); resetForms();}} className="w-full text-xs sm:text-sm">
                      <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Add Subject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="hidden sm:block">
            <SchoolLogo size="md" />
          </div>
          <div className="sm:hidden">
            <SchoolLogo size="sm" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Complete School Management System</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">{currentSession || '2024/2025'}</Badge>
          <Badge variant="secondary" className="text-xs">{currentTerm || 'First Term'}</Badge>
        </div>
      </div>

      {/* Dynamic Content */}
      {renderContent()}
    </div>
  );
}