import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { UserPlus, Key, Users, BookOpen, Eye, EyeOff } from 'lucide-react';
import { supabase, supabaseHelpers, User, Class, Subject, SupervisorAssignment } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';
import bcrypt from 'bcryptjs';

interface SupervisorWithAssignments extends User {
  assignments?: SupervisorAssignment[];
  assignmentCount?: number;
}

export function EnhancedAdminPasswordManager() {
  const [supervisors, setSupervisors] = useState<SupervisorWithAssignments[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // New supervisor form state
  const [newSupervisor, setNewSupervisor] = useState({
    email: '',
    password: '',
    selectedClasses: [] as string[],
    selectedSubjects: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load supervisors
      const { data: supervisorsData, error: supervisorsError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'supervisor')
        .eq('is_active', true);

      if (supervisorsError) {
        toast.error('Failed to load supervisors');
        return;
      }

      // Load assignments for each supervisor
      const supervisorsWithAssignments: SupervisorWithAssignments[] = [];
      for (const supervisor of supervisorsData || []) {
        const { data: assignments } = await supabaseHelpers.getSupervisorAssignments(supervisor.id);
        supervisorsWithAssignments.push({
          ...supervisor,
          assignments: assignments || [],
          assignmentCount: assignments?.length || 0,
        });
      }

      setSupervisors(supervisorsWithAssignments);

      // Load classes and subjects
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .eq('is_active', true)
        .order('name');

      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true)
        .order('name');

      setClasses(classesData || []);
      setSubjects(subjectsData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewSupervisor(prev => ({ ...prev, password }));
  };

  const createSupervisor = async () => {
    if (!newSupervisor.email || !newSupervisor.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newSupervisor.selectedClasses.length === 0 || newSupervisor.selectedSubjects.length === 0) {
      toast.error('Please select at least one class and one subject');
      return;
    }

    setLoading(true);
    try {
      // Hash the password
      const passwordHash = await bcrypt.hash(newSupervisor.password, 10);

      // Create user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          email: newSupervisor.email,
          password_hash: passwordHash,
          role: 'supervisor',
          is_active: true,
        }])
        .select()
        .single();

      if (userError) {
        toast.error('Failed to create supervisor account');
        console.error('User creation error:', userError);
        return;
      }

      // Create assignments for all combinations of selected classes and subjects
      const assignments = [];
      for (const classId of newSupervisor.selectedClasses) {
        for (const subjectId of newSupervisor.selectedSubjects) {
          assignments.push({
            supervisor_id: userData.id,
            class_id: classId,
            subject_id: subjectId,
            is_active: true,
          });
        }
      }

      const { error: assignmentError } = await supabase
        .from('supervisor_assignments')
        .insert(assignments);

      if (assignmentError) {
        toast.error('Supervisor created but failed to assign classes/subjects');
        console.error('Assignment error:', assignmentError);
      } else {
        toast.success('Supervisor created successfully with assignments');
      }

      // Reset form
      setNewSupervisor({
        email: '',
        password: '',
        selectedClasses: [],
        selectedSubjects: [],
      });

      // Reload data
      loadData();

    } catch (error) {
      console.error('Error creating supervisor:', error);
      toast.error('Failed to create supervisor');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (supervisorId: string) => {
    const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    
    try {
      const passwordHash = await bcrypt.hash(newPassword, 10);
      
      const { error } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('id', supervisorId);

      if (error) {
        toast.error('Failed to reset password');
        return;
      }

      // Show the new password to admin
      toast.success(`Password reset successfully. New password: ${newPassword}`, {
        duration: 10000,
      });

    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };

  const deactivateSupervisor = async (supervisorId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', supervisorId);

      if (error) {
        toast.error('Failed to deactivate supervisor');
        return;
      }

      toast.success('Supervisor deactivated successfully');
      loadData();

    } catch (error) {
      console.error('Error deactivating supervisor:', error);
      toast.error('Failed to deactivate supervisor');
    }
  };

  const handleClassSelection = (classId: string, checked: boolean) => {
    setNewSupervisor(prev => ({
      ...prev,
      selectedClasses: checked 
        ? [...prev.selectedClasses, classId]
        : prev.selectedClasses.filter(id => id !== classId)
    }));
  };

  const handleSubjectSelection = (subjectId: string, checked: boolean) => {
    setNewSupervisor(prev => ({
      ...prev,
      selectedSubjects: checked 
        ? [...prev.selectedSubjects, subjectId]
        : prev.selectedSubjects.filter(id => id !== subjectId)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy">Supervisor Management</h2>
          <p className="text-muted-foreground">Create and manage supervisor accounts with class/subject assignments</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-navy hover:bg-navy/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Supervisor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Supervisor</DialogTitle>
              <DialogDescription>
                Create a supervisor account and assign classes and subjects
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="supervisor@gracelandroyal.edu.ng"
                    value={newSupervisor.email}
                    onChange={(e) => setNewSupervisor(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={newSupervisor.password}
                        onChange={(e) => setNewSupervisor(prev => ({ ...prev, password: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button type="button" onClick={generatePassword} variant="outline">
                      <Key className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Class Selection */}
              <div>
                <Label className="text-base font-semibold">Assign Classes</Label>
                <p className="text-sm text-muted-foreground mb-3">Select the classes this supervisor will handle</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto border rounded-lg p-4">
                  {classes.map(classItem => (
                    <div key={classItem.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`class-${classItem.id}`}
                        checked={newSupervisor.selectedClasses.includes(classItem.id)}
                        onCheckedChange={(checked) => handleClassSelection(classItem.id, checked as boolean)}
                      />
                      <Label htmlFor={`class-${classItem.id}`} className="text-sm">
                        {classItem.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Selection */}
              <div>
                <Label className="text-base font-semibold">Assign Subjects</Label>
                <p className="text-sm text-muted-foreground mb-3">Select the subjects this supervisor will teach</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto border rounded-lg p-4">
                  {subjects.map(subject => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`subject-${subject.id}`}
                        checked={newSupervisor.selectedSubjects.includes(subject.id)}
                        onCheckedChange={(checked) => handleSubjectSelection(subject.id, checked as boolean)}
                      />
                      <Label htmlFor={`subject-${subject.id}`} className="text-sm">
                        {subject.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignment Preview */}
              {newSupervisor.selectedClasses.length > 0 && newSupervisor.selectedSubjects.length > 0 && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Assignment Preview</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    This supervisor will be assigned to {newSupervisor.selectedClasses.length * newSupervisor.selectedSubjects.length} class-subject combinations:
                  </p>
                  <div className="text-sm">
                    <strong>Classes:</strong> {newSupervisor.selectedClasses.map(id => classes.find(c => c.id === id)?.name).join(', ')}
                  </div>
                  <div className="text-sm mt-1">
                    <strong>Subjects:</strong> {newSupervisor.selectedSubjects.map(id => subjects.find(s => s.id === id)?.name).join(', ')}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={createSupervisor} disabled={loading} className="bg-navy hover:bg-navy/90">
                {loading ? 'Creating...' : 'Create Supervisor'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Supervisors List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Supervisors
          </CardTitle>
          <CardDescription>
            Manage supervisor accounts and their class/subject assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {supervisors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No supervisors found. Create your first supervisor account.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Assignments</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supervisors.map(supervisor => (
                    <TableRow key={supervisor.id}>
                      <TableCell className="font-medium">{supervisor.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {supervisor.assignmentCount} assignments
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={supervisor.is_active ? "default" : "secondary"}>
                          {supervisor.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(supervisor.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resetPassword(supervisor.id)}
                          >
                            Reset Password
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deactivateSupervisor(supervisor.id)}
                          >
                            Deactivate
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-navy" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Supervisors</p>
                <p className="text-2xl font-bold text-navy">{supervisors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-navy" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Supervisors</p>
                <p className="text-2xl font-bold text-navy">
                  {supervisors.filter(s => s.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Key className="h-8 w-8 text-navy" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Assignments</p>
                <p className="text-2xl font-bold text-navy">
                  {supervisors.reduce((total, s) => total + (s.assignmentCount || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}