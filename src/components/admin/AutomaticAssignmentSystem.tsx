import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import { Users, BookOpen, Plus, Trash2, Settings, CheckCircle, UserCheck, Edit } from 'lucide-react';
import { supabase, insertRecord, updateRecord, deleteRecord, fetchRecords, isSupabaseConnected } from '../../lib/supabase';
import { useAuth } from '../AuthContext';

interface ClassSubjectAssignment {
  id: string;
  class_id: string;
  subject_id: string;
  subject_supervisor_id?: string;
  assigned_by?: string;
  assigned_at: string;
  is_active: boolean;
  class_name?: string;
  subject_name?: string;
  supervisor_name?: string;
}

interface Class {
  id: string;
  name: string;
  level: string;
  section?: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Staff {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export const AutomaticAssignmentSystem: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<ClassSubjectAssignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ClassSubjectAssignment | null>(null);
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(false);

  const [formData, setFormData] = useState({
    class_id: '',
    subject_id: '',
    subject_supervisor_id: '',
  });

  useEffect(() => {
    checkSupabaseConnection();
    loadData();
  }, []);

  const checkSupabaseConnection = async () => {
    const connected = await isSupabaseConnected();
    setIsSupabaseAvailable(connected);
    
    if (!connected) {
      loadLocalData();
    }
  };

  const loadLocalData = () => {
    try {
      const localAssignments = localStorage.getItem('graceland_class_subjects');
      const localClasses = localStorage.getItem('graceland_classes');
      const localSubjects = localStorage.getItem('graceland_subjects');
      const localStaff = localStorage.getItem('graceland_users');
      
      if (localAssignments) setAssignments(JSON.parse(localAssignments));
      if (localClasses) setClasses(JSON.parse(localClasses));
      if (localSubjects) setSubjects(JSON.parse(localSubjects));
      if (localStaff) {
        const users = JSON.parse(localStaff);
        setStaff(users.filter((u: any) => u.role === 'subject_supervisor' || u.role === 'class_supervisor'));
      }
    } catch (error) {
      console.error('Error loading local data:', error);
    }
  };

  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const loadData = async () => {
    if (!isSupabaseAvailable) return;

    setLoading(true);
    try {
      // Load classes
      const { data: classesData, error: classesError } = await fetchRecords('classes', {
        filter: { is_active: true },
        order: { column: 'name', ascending: true }
      });
      if (classesError) throw classesError;
      if (classesData) setClasses(classesData);

      // Load subjects
      const { data: subjectsData, error: subjectsError } = await fetchRecords('subjects', {
        filter: { is_active: true },
        order: { column: 'name', ascending: true }
      });
      if (subjectsError) throw subjectsError;
      if (subjectsData) setSubjects(subjectsData);

      // Load staff (subject supervisors)
      const { data: staffData, error: staffError } = await fetchRecords('users', {
        filter: { is_active: true },
        order: { column: 'full_name', ascending: true }
      });
      if (staffError) throw staffError;
      if (staffData) {
        setStaff(staffData.filter(s => s.role === 'subject_supervisor' || s.role === 'class_supervisor'));
      }

      // Load assignments with joined data
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('class_subjects')
        .select(`
          *,
          classes!inner(name, level, section),
          subjects!inner(name, code),
          users(full_name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;
      if (assignmentsData) {
        const formattedAssignments = assignmentsData.map(assignment => ({
          ...assignment,
          class_name: `${assignment.classes.name} ${assignment.classes.section || ''}`.trim(),
          subject_name: assignment.subjects.name,
          supervisor_name: assignment.users?.full_name || 'Not assigned',
        }));
        setAssignments(formattedAssignments);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.class_id) {
      toast.error('Please select a class');
      return false;
    }
    if (!formData.subject_id) {
      toast.error('Please select a subject');
      return false;
    }
    if (!formData.subject_supervisor_id) {
      toast.error('Please select a subject supervisor');
      return false;
    }

    // Check for duplicate assignment
    const existingAssignment = assignments.find(a => 
      a.class_id === formData.class_id && 
      a.subject_id === formData.subject_id && 
      a.id !== editingAssignment?.id
    );
    
    if (existingAssignment) {
      toast.error('This class-subject combination is already assigned');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const assignmentData = {
        ...formData,
        assigned_by: user?.id,
        assigned_at: new Date().toISOString(),
        is_active: true,
      };

      if (isSupabaseAvailable) {
        if (editingAssignment) {
          const { error } = await updateRecord('class_subjects', editingAssignment.id, assignmentData);
          if (error) throw error;
          toast.success('Assignment updated successfully');
        } else {
          const { error } = await insertRecord('class_subjects', assignmentData);
          if (error) throw error;
          toast.success('Assignment created successfully');
        }
        
        // Create notification for assigned supervisor
        await supabase.from('notifications').insert({
          title: editingAssignment ? 'Assignment Updated' : 'New Assignment',
          message: `You have been ${editingAssignment ? 'updated for' : 'assigned to'} teach ${getSubjectName(formData.subject_id)} to ${getClassName(formData.class_id)}.`,
          type: 'info',
          target_user_id: formData.subject_supervisor_id,
          created_by: user?.id,
          is_global: false,
        });

        await loadData();
      } else {
        // Local storage fallback
        const newAssignment: ClassSubjectAssignment = {
          id: editingAssignment?.id || Date.now().toString(),
          ...assignmentData,
          class_name: getClassName(formData.class_id),
          subject_name: getSubjectName(formData.subject_id),
          supervisor_name: getSupervisorName(formData.subject_supervisor_id),
          created_at: editingAssignment?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        let updatedAssignments;
        if (editingAssignment) {
          updatedAssignments = assignments.map(a => a.id === editingAssignment.id ? newAssignment : a);
        } else {
          updatedAssignments = [newAssignment, ...assignments];
        }
        setAssignments(updatedAssignments);
        saveToLocalStorage('graceland_class_subjects', updatedAssignments);
        toast.success(editingAssignment ? 'Assignment updated successfully' : 'Assignment created successfully');
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast.error('Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return;

    setLoading(true);
    try {
      if (isSupabaseAvailable) {
        const { error } = await deleteRecord('class_subjects', assignmentId);
        if (error) throw error;
        await loadData();
      } else {
        const updatedAssignments = assignments.filter(a => a.id !== assignmentId);
        setAssignments(updatedAssignments);
        saveToLocalStorage('graceland_class_subjects', updatedAssignments);
      }
      toast.success('Assignment removed successfully');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to remove assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assignment: ClassSubjectAssignment) => {
    setEditingAssignment(assignment);
    setFormData({
      class_id: assignment.class_id,
      subject_id: assignment.subject_id,
      subject_supervisor_id: assignment.subject_supervisor_id || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      class_id: '',
      subject_id: '',
      subject_supervisor_id: '',
    });
    setEditingAssignment(null);
  };

  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? `${cls.name} ${cls.section || ''}`.trim() : 'Unknown Class';
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const getSupervisorName = (supervisorId: string) => {
    const supervisor = staff.find(s => s.id === supervisorId);
    return supervisor ? supervisor.full_name : 'Not assigned';
  };

  const handleBulkAssignment = async () => {
    if (!confirm('This will automatically assign subjects to available supervisors. Continue?')) return;

    setLoading(true);
    try {
      let assignmentsMade = 0;
      
      for (const cls of classes) {
        for (const subject of subjects) {
          // Check if assignment already exists
          const existingAssignment = assignments.find(a => 
            a.class_id === cls.id && a.subject_id === subject.id
          );
          
          if (!existingAssignment) {
            // Find available supervisor (round-robin style)
            const availableSupervisors = staff.filter(s => s.role === 'subject_supervisor');
            if (availableSupervisors.length > 0) {
              const supervisorIndex = assignmentsMade % availableSupervisors.length;
              const selectedSupervisor = availableSupervisors[supervisorIndex];
              
              const assignmentData = {
                class_id: cls.id,
                subject_id: subject.id,
                subject_supervisor_id: selectedSupervisor.id,
                assigned_by: user?.id,
                assigned_at: new Date().toISOString(),
                is_active: true,
              };

              if (isSupabaseAvailable) {
                await insertRecord('class_subjects', assignmentData);
              } else {
                const newAssignment: ClassSubjectAssignment = {
                  id: Date.now().toString() + assignmentsMade,
                  ...assignmentData,
                  class_name: `${cls.name} ${cls.section || ''}`.trim(),
                  subject_name: subject.name,
                  supervisor_name: selectedSupervisor.full_name,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
                setAssignments(prev => [...prev, newAssignment]);
              }
              
              assignmentsMade++;
            }
          }
        }
      }

      if (!isSupabaseAvailable) {
        saveToLocalStorage('graceland_class_subjects', assignments);
      } else {
        await loadData();
      }
      
      toast.success(`${assignmentsMade} automatic assignments created`);
    } catch (error) {
      console.error('Error in bulk assignment:', error);
      toast.error('Failed to create bulk assignments');
    } finally {
      setLoading(false);
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
          <h2 className="text-2xl font-bold text-navy">Automatic Assignment System</h2>
          <p className="text-gray-600">Manage class-subject assignments and supervisor allocations</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleBulkAssignment}
            variant="outline"
            className="text-navy border-navy hover:bg-navy hover:text-white"
            disabled={loading}
          >
            <Settings className="w-4 h-4 mr-2" />
            Auto Assign All
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={resetForm}
                className="bg-navy hover:bg-navy/80 text-white border-gold"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-navy">
                  {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Class *
                  </label>
                  <Select value={formData.class_id} onValueChange={(value) => handleInputChange('class_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} {cls.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Subject *
                  </label>
                  <Select value={formData.subject_id} onValueChange={(value) => handleInputChange('subject_id', value)}>
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
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Subject Supervisor *
                  </label>
                  <Select value={formData.subject_supervisor_id} onValueChange={(value) => handleInputChange('subject_supervisor_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((supervisor) => (
                        <SelectItem key={supervisor.id} value={supervisor.id}>
                          {supervisor.full_name} ({supervisor.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-navy hover:bg-navy/80 text-white"
                  >
                    {loading ? 'Saving...' : editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold text-navy">{assignments.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-navy" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Classes Covered</p>
                <p className="text-2xl font-bold text-gold">
                  {new Set(assignments.map(a => a.class_id)).size}
                </p>
              </div>
              <Users className="w-8 h-8 text-gold" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Subjects Assigned</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(assignments.map(a => a.subject_id)).size}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Supervisors</p>
                <p className="text-2xl font-bold text-green-600">
                  {new Set(assignments.filter(a => a.subject_supervisor_id).map(a => a.subject_supervisor_id)).size}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-navy">Current Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading assignments...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No assignments created yet</p>
              <p className="text-sm text-gray-400">Create assignments manually or use auto-assign</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-navy text-white">
                    <th className="border border-gray-300 px-4 py-2 text-left">Class</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Subject</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Supervisor</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Assigned Date</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{assignment.class_name}</td>
                      <td className="border border-gray-300 px-4 py-2">{assignment.subject_name}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {assignment.supervisor_name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(assignment.assigned_at).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <Badge variant={assignment.is_active ? "default" : "secondary"}>
                          {assignment.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(assignment)}
                            className="text-navy border-navy hover:bg-navy hover:text-white"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(assignment.id)}
                            className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {!isSupabaseAvailable && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-yellow-800">
            <Settings className="w-5 h-5" />
            <div>
              <p className="font-medium">Demo Mode Active</p>
              <p className="text-sm">Using localStorage. Connect Supabase for full functionality.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomaticAssignmentSystem;