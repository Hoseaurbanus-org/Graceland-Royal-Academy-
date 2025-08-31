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
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Download, 
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  UserPlus,
  Users
} from 'lucide-react';
import { useAuth } from '../AuthContext';

export function StudentManagement() {
  const { students, addStudent, updateStudent, deleteStudent, classes, getAvailableClasses, parents, notifyParentRegistration } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  
  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    class: '',
    dateOfBirth: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    address: '',
    guardianName: '',
    guardianPhone: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Get available classes from the centralized class management
  const availableClasses = getAvailableClasses();

  // Filtered students based on search and class filter
  const filteredStudents = (students || []).filter(student => {
    const matchesSearch = !searchTerm || 
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    
    return matchesSearch && matchesClass;
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.class) {
      errors.class = 'Class selection is required';
    }

    if (!formData.parentName?.trim()) {
      errors.parentName = 'Parent name is required';
    }

    if (!formData.parentPhone?.trim()) {
      errors.parentPhone = 'Parent phone is required';
    }

    if (!formData.parentEmail?.trim()) {
      errors.parentEmail = 'Parent email is required';
    } else if (!formData.parentEmail.includes('@')) {
      errors.parentEmail = 'Invalid email format';
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.address?.trim()) {
      errors.address = 'Address is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateStudentId = (className: string): string => {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const classData = availableClasses.find(c => c.name === className);
    const isSecondary = classData?.level === 'secondary';
    const prefix = isSecondary ? `gra${currentYear}/sec/` : `gra${currentYear}/pry/`;
    
    const existingIds = (students || [])
      .map(s => s.studentId)
      .filter(id => id.startsWith(prefix))
      .map(id => parseInt(id.split('/')[2]) || 0);
    
    const nextNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
  };

  const handleSaveStudent = () => {
    if (!validateForm()) return;

    if (editingStudent) {
      // Update existing student
      updateStudent(editingStudent, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        class: formData.class,
        dateOfBirth: formData.dateOfBirth,
        parentName: formData.parentName,
        parentEmail: formData.parentEmail,
        parentPhone: formData.parentPhone,
        address: formData.address,
        guardianName: formData.guardianName || formData.parentName,
        guardianPhone: formData.guardianPhone || formData.parentPhone
      });
    } else {
      // Add new student
      const studentId = generateStudentId(formData.class);
      addStudent({
        studentId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        class: formData.class,
        dateOfBirth: formData.dateOfBirth,
        parentName: formData.parentName,
        parentEmail: formData.parentEmail,
        parentPhone: formData.parentPhone,
        address: formData.address,
        guardianName: formData.guardianName || formData.parentName,
        guardianPhone: formData.guardianPhone || formData.parentPhone
      });

      // Notify parent for registration if not already notified
      const parent = parents.find(p => p.email === formData.parentEmail);
      if (parent && !parent.notificationSent) {
        notifyParentRegistration(formData.parentEmail);
      }
    }

    resetForm();
  };

  const handleEditStudent = (student: any) => {
    setFormData({
      studentId: student.studentId,
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      class: student.class,
      dateOfBirth: student.dateOfBirth,
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      parentPhone: student.parentPhone,
      address: student.address,
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || ''
    });
    setEditingStudent(student.id);
    setIsDialogOpen(true);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (deleteConfirm === studentId) {
      deleteStudent(studentId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(studentId);
      // Auto-cancel delete confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      firstName: '',
      lastName: '',
      class: '',
      dateOfBirth: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      address: '',
      guardianName: '',
      guardianPhone: ''
    });
    setFormErrors({});
    setEditingStudent(null);
    setIsDialogOpen(false);
  };

  const handleExportCSV = () => {
    const exportData = filteredStudents.map(student => ({
      'Student ID': student.studentId,
      'First Name': student.firstName,
      'Last Name': student.lastName,
      'Full Name': student.fullName,
      'Class': student.class,
      'Parent Name': student.parentName,
      'Parent Phone': student.parentPhone,
      'Parent Email': student.parentEmail,
      'Date of Birth': student.dateOfBirth,
      'Address': student.address,
      'Registration Date': student.registrationDate
    }));

    const csvContent = [
      Object.keys(exportData[0] || {}).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getClassLevel = (className: string): 'primary' | 'secondary' => {
    const classData = availableClasses.find(c => c.name === className);
    return classData?.level || 'primary';
  };

  const getFeeAmount = (className: string): number => {
    const level = getClassLevel(className);
    return level === 'primary' ? 500000 : 700000;
  };

  const getParentRegistrationStatus = (parentEmail: string) => {
    const parent = parents.find(p => p.email === parentEmail);
    if (!parent) return 'not_found';
    if (parent.isRegistered) return 'registered';
    if (parent.notificationSent) return 'notified';
    return 'pending';
  };

  const getClassCapacityInfo = (className: string) => {
    const classData = availableClasses.find(c => c.name === className);
    if (!classData) return null;
    return {
      current: classData.currentStudents,
      capacity: classData.capacity,
      available: classData.capacity - classData.currentStudents
    };
  };

  return (
    <div className="space-y-4 p-2 sm:p-4 lg:p-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">Student Management</CardTitle>
              <CardDescription className="text-sm">
                Add, edit, and manage student records with automatic ID generation
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Button onClick={handleExportCSV} variant="outline" size="sm" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()} size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg">
                      {editingStudent ? 'Edit Student' : 'Add New Student'}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                      {editingStudent ? 'Update student information' : 'Register a new student with auto-generated ID'}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 p-1">
                    {/* Student Name Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName || ''}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="Enter first name"
                          className="mt-1"
                        />
                        {formErrors.firstName && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName || ''}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Enter last name"
                          className="mt-1"
                        />
                        {formErrors.lastName && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.lastName}</p>
                        )}
                      </div>
                    </div>

                    {/* Class and Date of Birth */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="studentClass" className="text-sm font-medium">Class *</Label>
                        <Select 
                          value={formData.class || ''} 
                          onValueChange={(value) => setFormData({ ...formData, class: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableClasses.map((classData) => {
                              const capacityInfo = getClassCapacityInfo(classData.name);
                              return (
                                <SelectItem 
                                  key={classData.id} 
                                  value={classData.name}
                                  disabled={capacityInfo ? capacityInfo.available <= 0 : false}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span>{classData.name}</span>
                                    {capacityInfo && (
                                      <span className="text-xs text-muted-foreground ml-2">
                                        {capacityInfo.current}/{capacityInfo.capacity}
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {formErrors.class && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.class}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth *</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth || ''}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          className="mt-1"
                        />
                        {formErrors.dateOfBirth && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.dateOfBirth}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-sm font-medium">Home Address *</Label>
                      <Input
                        id="address"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter complete address"
                        className="mt-1"
                      />
                      {formErrors.address && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Parent/Guardian Information
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="parentName" className="text-sm font-medium">Parent/Guardian Name *</Label>
                          <Input
                            id="parentName"
                            value={formData.parentName || ''}
                            onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                            placeholder="Parent/Guardian full name"
                            className="mt-1"
                          />
                          {formErrors.parentName && (
                            <p className="text-xs text-red-500 mt-1">{formErrors.parentName}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="parentPhone" className="text-sm font-medium">Parent Phone *</Label>
                            <Input
                              id="parentPhone"
                              value={formData.parentPhone || ''}
                              onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                              placeholder="+234 XXX XXX XXXX"
                              className="mt-1"
                            />
                            {formErrors.parentPhone && (
                              <p className="text-xs text-red-500 mt-1">{formErrors.parentPhone}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="parentEmail" className="text-sm font-medium">Parent Email *</Label>
                            <Input
                              id="parentEmail"
                              type="email"
                              value={formData.parentEmail || ''}
                              onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                              placeholder="parent@example.com"
                              className="mt-1"
                            />
                            {formErrors.parentEmail && (
                              <p className="text-xs text-red-500 mt-1">{formErrors.parentEmail}</p>
                            )}
                          </div>
                        </div>

                        {/* Show parent registration status */}
                        {formData.parentEmail && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">Parent Account Status</span>
                            </div>
                            <p className="text-sm text-blue-700">
                              {(() => {
                                const status = getParentRegistrationStatus(formData.parentEmail);
                                switch (status) {
                                  case 'registered':
                                    return 'Parent is already registered and can access the system.';
                                  case 'notified':
                                    return 'Parent has been notified to complete registration.';
                                  case 'pending':
                                    return 'Parent account will be created and notification sent after student registration.';
                                  default:
                                    return 'A new parent account will be created automatically.';
                                }
                              })()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {formData.class && formData.firstName && formData.lastName && (
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>Student ID:</strong> {generateStudentId(formData.class)} | 
                          <strong> Full Name:</strong> {formData.firstName} {formData.lastName} | 
                          <strong> Level:</strong> {getClassLevel(formData.class)} | 
                          <strong> Est. Fee:</strong> ₦{getFeeAmount(formData.class).toLocaleString()} per session
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                      <Button variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSaveStudent} className="w-full sm:w-auto">
                        <Save className="h-4 w-4 mr-2" />
                        {editingStudent ? 'Update Student' : 'Add Student'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or parent..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {availableClasses.map((classData) => (
                    <SelectItem key={classData.id} value={classData.name}>
                      {classData.name} ({classData.currentStudents})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Students Table - Mobile Responsive */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Student Details</TableHead>
                  <TableHead className="min-w-[100px]">Class</TableHead>
                  <TableHead className="min-w-[200px] hidden sm:table-cell">Parent Information</TableHead>
                  <TableHead className="min-w-[120px] hidden md:table-cell">Registration</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No students found. {searchTerm || selectedClass !== 'all' ? 'Try adjusting your filters.' : 'Add your first student to get started.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{student.fullName}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {student.studentId}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(student.dateOfBirth).toLocaleDateString()}
                          </div>
                          {/* Mobile: Show parent info here */}
                          <div className="sm:hidden">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <User className="h-3 w-3 mr-1" />
                              {student.parentName}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 mr-1" />
                              {student.parentPhone}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">{student.class}</Badge>
                          <div className="text-xs text-muted-foreground">
                            {getClassLevel(student.class)}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden sm:table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <User className="h-3 w-3 mr-1" />
                            {student.parentName}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="h-3 w-3 mr-1" />
                            {student.parentPhone}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="h-3 w-3 mr-1" />
                            {student.parentEmail}
                          </div>
                          <div className="mt-1">
                            {(() => {
                              const status = getParentRegistrationStatus(student.parentEmail);
                              const statusColors = {
                                registered: 'bg-green-100 text-green-800',
                                notified: 'bg-yellow-100 text-yellow-800',
                                pending: 'bg-orange-100 text-orange-800',
                                not_found: 'bg-red-100 text-red-800'
                              };
                              const statusLabels = {
                                registered: 'Registered',
                                notified: 'Notified',
                                pending: 'Pending',
                                not_found: 'Error'
                              };
                              return (
                                <Badge className={`text-xs ${statusColors[status] || statusColors.not_found}`}>
                                  {statusLabels[status] || 'Unknown'}
                                </Badge>
                              );
                            })()}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-1">
                          <div className="text-sm">{student.registrationDate}</div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            Fee: ₦{getFeeAmount(student.class).toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                            className="w-full sm:w-auto text-xs"
                          >
                            <Edit className="h-3 w-3 sm:mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Button 
                            variant={deleteConfirm === student.id ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => handleDeleteStudent(student.id)}
                            className="w-full sm:w-auto text-xs"
                          >
                            {deleteConfirm === student.id ? (
                              <AlertTriangle className="h-3 w-3 sm:mr-1" />
                            ) : (
                              <Trash2 className="h-3 w-3 sm:mr-1" />
                            )}
                            <span className="hidden sm:inline">
                              {deleteConfirm === student.id ? 'Confirm' : 'Delete'}
                            </span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredStudents.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredStudents.length} of {students?.length || 0} students
              {selectedClass && selectedClass !== 'all' && ` in ${selectedClass}`}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}