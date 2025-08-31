import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Trash2, Edit, Plus, Users, GraduationCap, School, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useCalendar } from '../CalendarContext';
import { toast } from 'sonner@2.0.3';

export function ClassManagement() {
  const { classes, staff, user } = useAuth();
  const { currentSession } = useCalendar();
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    level: 'Primary' as string,
    capacity: 30,
    supervisor: 'none',
    academicSession: currentSession?.name || '2024/2025'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const addClass = (classData: any) => {
    const newClass = {
      id: Date.now().toString(),
      name: classData.name,
      level: classData.level,
      capacity: classData.capacity,
      isActive: true,
      ...classData
    };

    // In a real implementation, this would be handled by the AuthContext
    // For now, we'll use localStorage
    const existingClasses = JSON.parse(localStorage.getItem('gra_classes') || '[]');
    const updatedClasses = [...existingClasses, newClass];
    localStorage.setItem('gra_classes', JSON.stringify(updatedClasses));
    
    toast.success('Class added successfully');
  };

  const updateClass = (id: string, updates: any) => {
    const existingClasses = JSON.parse(localStorage.getItem('gra_classes') || '[]');
    const updatedClasses = existingClasses.map((c: any) => 
      c.id === id ? { ...c, ...updates } : c
    );
    localStorage.setItem('gra_classes', JSON.stringify(updatedClasses));
    
    toast.success('Class updated successfully');
  };

  const deleteClass = (id: string) => {
    const existingClasses = JSON.parse(localStorage.getItem('gra_classes') || '[]');
    const updatedClasses = existingClasses.filter((c: any) => c.id !== id);
    localStorage.setItem('gra_classes', JSON.stringify(updatedClasses));
    
    toast.success('Class deleted successfully');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      level: 'Primary',
      capacity: 30,
      supervisor: 'none',
      academicSession: currentSession?.name || '2024/2025'
    });
    setFormErrors({});
    setEditingClass(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = 'Class name is required';
    }

    if (formData.capacity < 1) {
      errors.capacity = 'Capacity must be at least 1';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddClass = () => {
    if (!validateForm()) return;

    // Check for duplicate class names
    if (classes.some(c => c.name.toLowerCase() === formData.name.toLowerCase())) {
      setFormErrors({ name: 'A class with this name already exists' });
      return;
    }

    try {
      addClass({
        name: formData.name,
        level: formData.level,
        capacity: formData.capacity,
        supervisor: formData.supervisor === 'none' ? undefined : formData.supervisor,
        academicSession: formData.academicSession,
        isActive: true
      });
      
      setShowAddDialog(false);
      resetForm();
      // Force refresh
      window.location.reload();
    } catch (error) {
      toast.error('Error adding class: ' + (error as Error).message);
    }
  };

  const handleEditClass = (classData: any) => {
    setEditingClass(classData);
    setFormData({
      name: classData.name,
      level: classData.level,
      capacity: classData.capacity,
      supervisor: classData.supervisor || 'none',
      academicSession: classData.academicSession || '2024/2025'
    });
    setShowAddDialog(true);
  };

  const handleUpdateClass = () => {
    if (!validateForm() || !editingClass) return;

    try {
      updateClass(editingClass.id, {
        name: formData.name,
        level: formData.level,
        capacity: formData.capacity,
        supervisor: formData.supervisor === 'none' ? undefined : formData.supervisor,
        academicSession: formData.academicSession
      });
      
      setShowAddDialog(false);
      resetForm();
      // Force refresh
      window.location.reload();
    } catch (error) {
      toast.error('Error updating class: ' + (error as Error).message);
    }
  };

  const handleDeleteClass = (id: string) => {
    if (deleteConfirm === id) {
      try {
        deleteClass(id);
        setDeleteConfirm(null);
        // Force refresh
        window.location.reload();
      } catch (error) {
        toast.error('Error: ' + (error as Error).message);
        setDeleteConfirm(null);
      }
    } else {
      setDeleteConfirm(id);
      // Auto-cancel delete confirmation after 5 seconds
      setTimeout(() => setDeleteConfirm(null), 5000);
    }
  };

  const getClassSupervisor = (supervisorId: string) => {
    if (!supervisorId) return 'Not assigned';
    const supervisor = staff.find(s => s.id === supervisorId);
    return supervisor ? supervisor.name : 'Unknown';
  };

  const getAvailableSupervisors = () => {
    return staff.filter(s => s.role === 'class_supervisor' && s.isActive);
  };

  const getLevelIcon = (level: string) => {
    return level.toLowerCase() === 'primary' ? <School className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />;
  };

  const getLevelColor = (level: string) => {
    return level.toLowerCase() === 'primary' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Class Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage academic classes and class assignments
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </DialogTitle>
              <DialogDescription>
                {editingClass ? 'Update class information' : 'Create a new academic class'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="className">Class Name *</Label>
                <Input
                  id="className"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Primary 1, JSS 1, SSS 2"
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">Level *</Label>
                  <Select value={formData.level} onValueChange={(value: string) => setFormData(prev => ({ ...prev, level: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Primary">Primary</SelectItem>
                      <SelectItem value="Junior">Junior Secondary</SelectItem>
                      <SelectItem value="Senior">Senior Secondary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 30 }))}
                  />
                  {formErrors.capacity && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.capacity}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="supervisor">Class Supervisor</Label>
                <Select value={formData.supervisor} onValueChange={(value) => setFormData(prev => ({ ...prev, supervisor: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supervisor (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No supervisor assigned</SelectItem>
                    {getAvailableSupervisors().map(supervisor => (
                      <SelectItem key={supervisor.id} value={supervisor.id}>
                        {supervisor.name} ({supervisor.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="academicSession">Academic Session</Label>
                <Input
                  id="academicSession"
                  value={formData.academicSession}
                  onChange={(e) => setFormData(prev => ({ ...prev, academicSession: e.target.value }))}
                  placeholder="2024/2025"
                />
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Classes will be automatically available to all staff for subject assignment.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2 pt-4">
                <Button onClick={editingClass ? handleUpdateClass : handleAddClass} className="flex-1">
                  {editingClass ? 'Update Class' : 'Add Class'}
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <School className="h-4 w-4 text-blue-600" />
              Primary Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classes.filter(c => c.level === 'Primary' && c.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active primary classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-green-600" />
              Secondary Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classes.filter(c => (c.level === 'Junior' || c.level === 'Senior') && c.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active secondary classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Total Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classes.reduce((sum, c) => sum + c.capacity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available slots
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <School className="h-4 w-4 text-orange-600" />
              Active Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classes.filter(c => c.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Classes List */}
      <Card>
        <CardHeader>
          <CardTitle>Classes ({classes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Details</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No classes found. Add your first class to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  classes.map((classData) => (
                    <TableRow key={classData.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{classData.name}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getLevelColor(classData.level)}>
                          <div className="flex items-center gap-1">
                            {getLevelIcon(classData.level)}
                            {classData.level}
                          </div>
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm font-medium">
                          {classData.capacity} students
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {getClassSupervisor(classData.supervisor || '')}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={classData.isActive ? 'default' : 'secondary'}>
                          {classData.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClass(classData)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={deleteConfirm === classData.id ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => handleDeleteClass(classData.id)}
                          >
                            {deleteConfirm === classData.id ? (
                              <AlertTriangle className="h-4 w-4" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> All classes are automatically available for subject assignment to staff members.
          Create classes first, then assign subjects and staff through the Staff Management section.
        </AlertDescription>
      </Alert>
    </div>
  );
}