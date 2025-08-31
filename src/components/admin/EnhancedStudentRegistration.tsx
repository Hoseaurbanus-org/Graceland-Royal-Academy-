import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Search, GraduationCap, Users, UserPlus, AlertCircle, CheckCircle, Camera, Upload, X } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNotifications } from '../NotificationContext';
import { motion } from 'motion/react';

export function EnhancedStudentRegistration() {
  const { 
    user, 
    students, 
    classes, 
    createStudent, 
    updateStudent, 
    deleteStudent 
  } = useAuth();
  
  const { addNotification } = useNotifications();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    admission_number: '',
    class_id: '',
    date_of_birth: '',
    parent_name: '',
    parent_email: '',
    phone: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admission_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClass === 'all' || student.class_id === selectedClass;
    
    return matchesSearch && matchesClass && student.is_active;
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = 'Student name is required';
    }
    if (!formData.class_id) {
      errors.class_id = 'Please select a class';
    }
    if (!formData.date_of_birth) {
      errors.date_of_birth = 'Date of birth is required';
    }
    if (formData.parent_email && !formData.parent_email.includes('@')) {
      errors.parent_email = 'Invalid email format';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateAdmissionNumber = (): string => {
    const year = new Date().getFullYear();
    const lastNumber = students
      .map(s => s.admission_number)
      .filter(num => num.startsWith(`GRA/${year}/`))
      .map(num => parseInt(num.split('/')[2]) || 0)
      .sort((a, b) => b - a)[0] || 0;
    
    return `GRA/${year}/${String(lastNumber + 1).padStart(3, '0')}`;
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setPhotoFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhotoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    // Reset file input
    const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSaveStudent = async () => {
    if (!validateForm()) return;

    try {
      if (editingStudent) {
        const result = await updateStudent(editingStudent.id, {
          name: formData.name,
          admission_number: formData.admission_number,
          class_id: formData.class_id,
          date_of_birth: formData.date_of_birth,
          parent_name: formData.parent_name || undefined,
          parent_email: formData.parent_email || undefined,
          phone: formData.phone || undefined,
          photo: photoFile || undefined
        });

        if (result.success) {
          toast.success('Student updated successfully');
          addNotification({
            type: 'success',
            title: 'Student Updated',
            message: `${formData.name} has been updated successfully`,
            autoHide: true
          });
        } else {
          throw new Error(result.error);
        }
      } else {
        const result = await createStudent({
          name: formData.name,
          admission_number: formData.admission_number || generateAdmissionNumber(),
          class_id: formData.class_id,
          date_of_birth: formData.date_of_birth,
          parent_name: formData.parent_name || undefined,
          parent_email: formData.parent_email || undefined,
          phone: formData.phone || undefined,
          photo: photoFile || undefined
        });

        if (result.success) {
          toast.success('Student registered successfully');
          addNotification({
            type: 'success',
            title: 'Student Registered',
            message: `${formData.name} has been registered successfully${formData.parent_email ? ' with parent account created' : ''}`,
            autoHide: true
          });
          
          if (formData.parent_email) {
            toast.info('Parent account created automatically');
            addNotification({
              type: 'info',
              title: 'Parent Account Created',
              message: `Parent account created for ${formData.parent_name} (${formData.parent_email})`,
              autoHide: true
            });
          }
        } else {
          throw new Error(result.error);
        }
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save student');
      addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: error instanceof Error ? error.message : 'Failed to save student',
        autoHide: true
      });
    }
  };

  const handleEditStudent = (student: any) => {
    setFormData({
      name: student.name,
      admission_number: student.admission_number,
      class_id: student.class_id,
      parent_name: '',
      parent_email: '',
      date_of_birth: student.date_of_birth || '',
      address: student.address || '',
      phone: student.phone || '',
      blood_group: student.blood_group || '',
      allergies: student.allergies || '',
      emergency_contact: student.emergency_contact || '',
      emergency_phone: student.emergency_phone || '',
      medical_conditions: student.medical_conditions || ''
    });
    
    if (student.photo_url) {
      setPhotoPreview(student.photo_url);
    }
    
    setEditingStudent(student);
    setIsDialogOpen(true);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const result = await deleteStudent(studentId);
      if (result.success) {
        toast.success('Student deleted successfully');
        addNotification({
          type: 'warning',
          title: 'Student Deleted',
          message: 'Student record has been permanently removed',
          autoHide: true
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      admission_number: '',
      class_id: '',
      parent_name: '',
      parent_email: '',
      date_of_birth: '',
      address: '',
      phone: '',
      blood_group: '',
      allergies: '',
      emergency_contact: '',
      emergency_phone: '',
      medical_conditions: ''
    });
    setFormErrors({});
    setEditingStudent(null);
    setPhotoPreview('');
    setPhotoFile(null);
  };

  const getClassName = (classId: string) => {
    const classInfo = classes.find(c => c.id === classId);
    return classInfo ? classInfo.name : 'Unknown Class';
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
                <GraduationCap className="h-5 w-5 text-primary" />
                Student Registration & Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Register new students with photos and manage existing records. Parent accounts are created automatically.
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Register Student
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingStudent ? 'Edit Student' : 'Register New Student'}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 p-1">
                  {/* Photo Upload Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Camera className="h-4 w-4" />
                        Student Photo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
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
                          <div className="space-y-3">
                            <div>
                              <input
                                type="file"
                                id="photo-upload"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                                title="Upload student photo"
                                aria-label="Upload student photo"
                              />
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => document.getElementById('photo-upload')?.click()}
                                  className="flex items-center gap-2"
                                >
                                  <Upload className="w-4 h-4" />
                                  Choose Photo
                                </Button>
                                {photoPreview && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={removePhoto}
                                    className="text-destructive border-destructive hover:bg-destructive/10"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Remove
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Upload a passport-style photo (max 5MB, JPG/PNG). This photo will appear on result sheets and student records.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Basic Information (Simplified) */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Student Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Student Name *</Label>
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
                          <Label htmlFor="admission_number">Registration ID</Label>
                          <Input
                            id="admission_number"
                            value={formData.admission_number}
                            placeholder={generateAdmissionNumber()}
                            className="mt-1"
                            readOnly
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Automatically generated
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="class_id">Class *</Label>
                          <Select 
                            value={formData.class_id} 
                            onValueChange={(value) => setFormData({ ...formData, class_id: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.filter(c => c.is_active).map(classItem => (
                                <SelectItem key={classItem.id} value={classItem.id}>
                                  {classItem.name} - {classItem.level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.class_id && (
                            <p className="text-xs text-destructive mt-1">{formErrors.class_id}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="date_of_birth">Date of Birth *</Label>
                          <Input
                            id="date_of_birth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                            className="mt-1"
                          />
                          {formErrors.date_of_birth && (
                            <p className="text-xs text-destructive mt-1">{formErrors.date_of_birth}</p>
                          )}
                        </div>
                        <div>
                          <Label>Age</Label>
                          <Input
                            value={formData.date_of_birth ? Math.max(0, new Date().getFullYear() - new Date(formData.date_of_birth).getFullYear()) : ''}
                            readOnly
                            className="mt-1"
                            placeholder="Auto-calculated"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Parent Information (Optional) */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base text-primary">Parent Information (Optional)</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        If provided, a parent account will be created automatically with access to their child's records.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="parent_name">Parent/Guardian Name</Label>
                          <Input
                            id="parent_name"
                            value={formData.parent_name}
                            onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                            placeholder="Parent's full name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="parent_email">Parent Email</Label>
                          <Input
                            id="parent_email"
                            type="email"
                            value={formData.parent_email}
                            onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                            placeholder="parent@email.com"
                            className="mt-1"
                          />
                          {formErrors.parent_email && (
                            <p className="text-xs text-destructive mt-1">{formErrors.parent_email}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Contact number"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Information */}


                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveStudent}
                      className="w-full sm:w-auto"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {editingStudent ? 'Update Student' : 'Register Student'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search students by name or admission number..."
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
                  {classes.filter(c => c.is_active).map(classItem => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                      <p className="text-2xl font-bold text-primary">{students.filter(s => s.is_active).length}</p>
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
                      <p className="text-sm text-muted-foreground">With Photos</p>
                      <p className="text-2xl font-bold text-primary">
                        {students.filter(s => s.is_active && s.photo_url).length}
                      </p>
                    </div>
                    <Camera className="h-8 w-8 text-primary" />
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
                      <p className="text-sm text-muted-foreground">Search Results</p>
                      <p className="text-2xl font-bold text-primary">{filteredStudents.length}</p>
                    </div>
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Students Table */}
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {students.length === 0 ? 'No students registered yet' : 'No students match your search'}
              </p>
              <p className="text-sm text-muted-foreground">
                {students.length === 0 ? 'Start by registering your first student' : 'Try adjusting your search criteria'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Admission Number</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Date Registered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={student.photo_url} alt={student.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-mono">
                        {student.admission_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          {student.date_of_birth && (
                            <p className="text-xs text-muted-foreground">
                              DOB: {new Date(student.date_of_birth).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getClassName(student.class_id)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(student.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.is_active ? "default" : "secondary"}>
                          {student.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteStudent(student.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}