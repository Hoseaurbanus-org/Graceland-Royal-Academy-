import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus, Edit, Trash2, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';

interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  maxScores: {
    test1: number;
    test2: number;
    exam: number;
  };
  createdBy?: string;
  assignedStaff: string[];
  isActive: boolean;
}

export function SubjectManagement() {
  const { staff, subjects } = useAuth();
  const [localSubjects, setLocalSubjects] = useState<Subject[]>([]);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    description: '',
    test1Max: 20,
    test2Max: 20,
    examMax: 60
  });

  // Load subjects from localStorage on component mount
  useEffect(() => {
    const savedSubjects = localStorage.getItem('gra_subjects');
    if (savedSubjects) {
      setLocalSubjects(JSON.parse(savedSubjects));
    } else {
      // Initialize with default subjects
      const defaultSubjects: Subject[] = [
        {
          id: 'math_001',
          name: 'Mathematics',
          code: 'MATH',
          description: 'Basic mathematics and arithmetic',
          maxScores: { test1: 20, test2: 20, exam: 60 },
          assignedStaff: [],
          isActive: true
        },
        {
          id: 'eng_001',
          name: 'English Language',
          code: 'ENG',
          description: 'English language and literature',
          maxScores: { test1: 20, test2: 20, exam: 60 },
          assignedStaff: [],
          isActive: true
        },
        {
          id: 'sci_001',
          name: 'Basic Science',
          code: 'SCI',
          description: 'Introduction to scientific concepts',
          maxScores: { test1: 20, test2: 20, exam: 60 },
          assignedStaff: [],
          isActive: true
        }
      ];
      setLocalSubjects(defaultSubjects);
      localStorage.setItem('gra_subjects', JSON.stringify(defaultSubjects));
    }
  }, []);

  // Save subjects to localStorage whenever subjects change
  useEffect(() => {
    if (localSubjects.length > 0) {
      localStorage.setItem('gra_subjects', JSON.stringify(localSubjects));
    }
  }, [localSubjects]);

  const generateUniqueId = (prefix: string): string => {
    return `${prefix}_${Date.now()}`;
  };

  const resetForm = () => {
    setNewSubject({
      name: '',
      code: '',
      description: '',
      test1Max: 20,
      test2Max: 20,
      examMax: 60
    });
    setEditingSubject(null);
  };

  const handleAddSubject = () => {
    if (!newSubject.name || !newSubject.code) {
      toast.error('Please fill in required fields: Subject Name and Code');
      return;
    }

    // Check for duplicate codes
    if (localSubjects.some(s => s.code.toLowerCase() === newSubject.code.toLowerCase())) {
      toast.error('Subject code already exists. Please use a different code.');
      return;
    }

    const subject: Subject = {
      id: generateUniqueId('subject'),
      name: newSubject.name,
      code: newSubject.code.toUpperCase(),
      description: newSubject.description,
      maxScores: {
        test1: newSubject.test1Max,
        test2: newSubject.test2Max,
        exam: newSubject.examMax
      },
      createdBy: 'admin_current',
      assignedStaff: [],
      isActive: true
    };

    if (editingSubject) {
      // Update existing subject
      setLocalSubjects(prev => prev.map(s => s.id === editingSubject.id ? { ...editingSubject, ...subject, id: editingSubject.id } : s));
      toast.success('Subject updated successfully');
    } else {
      // Add new subject
      setLocalSubjects(prev => [...prev, subject]);
      toast.success(`Subject "${newSubject.name}" created and is now available for staff assignment`);
    }
    
    resetForm();
    setIsSubjectDialogOpen(false);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setNewSubject({
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      test1Max: subject.maxScores.test1,
      test2Max: subject.maxScores.test2,
      examMax: subject.maxScores.exam
    });
    setIsSubjectDialogOpen(true);
  };

  const getAssignedStaffNames = (subjectId: string): string[] => {
    if (!staff || !Array.isArray(staff)) return [];
    
    return staff
      .filter(s => {
        if (!s.subjects || !Array.isArray(s.subjects)) return false;
        return s.subjects.includes(subjectId);
      })
      .map(s => s.name || 'Unknown Staff');
  };

  const handleDeleteSubject = (subjectId: string) => {
    const assignedStaff = getAssignedStaffNames(subjectId);
    
    if (assignedStaff.length > 0) {
      const confirmMessage = `This subject is assigned to ${assignedStaff.length} staff member(s): ${assignedStaff.join(', ')}. Are you sure you want to delete it?`;
      if (!confirm(confirmMessage)) {
        return;
      }
    }

    setLocalSubjects(prev => prev.filter(s => s.id !== subjectId));
    toast.success('Subject deleted successfully');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Subject Management
              </CardTitle>
              <CardDescription>Create and manage academic subjects - all subjects are automatically available for staff assignment</CardDescription>
            </div>
            <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingSubject ? 'Edit Subject' : 'Create New Subject'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingSubject ? 'Update subject information' : 'Add a new academic subject - it will be immediately available for staff assignment'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Subject Name *</Label>
                      <Input
                        value={newSubject.name}
                        onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                        placeholder="e.g., Mathematics"
                      />
                    </div>
                    <div>
                      <Label>Subject Code *</Label>
                      <Input
                        value={newSubject.code}
                        onChange={(e) => setNewSubject({...newSubject, code: e.target.value.toUpperCase()})}
                        placeholder="e.g., MATH"
                        maxLength={6}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={newSubject.description}
                      onChange={(e) => setNewSubject({...newSubject, description: e.target.value})}
                      placeholder="Brief description of the subject"
                    />
                  </div>
                  
                  <div>
                    <Label>Scoring Configuration</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div>
                        <Label className="text-sm">Test 1 (Max)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          value={newSubject.test1Max}
                          onChange={(e) => setNewSubject({...newSubject, test1Max: parseInt(e.target.value) || 20})}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Test 2 (Max)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          value={newSubject.test2Max}
                          onChange={(e) => setNewSubject({...newSubject, test2Max: parseInt(e.target.value) || 20})}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Exam (Max)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={newSubject.examMax}
                          onChange={(e) => setNewSubject({...newSubject, examMax: parseInt(e.target.value) || 60})}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Total: {newSubject.test1Max + newSubject.test2Max + newSubject.examMax} marks
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsSubjectDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddSubject}>
                      {editingSubject ? 'Update Subject' : 'Create Subject'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Scoring</TableHead>
                <TableHead>Assigned Staff</TableHead>
                <TableHead>Total Marks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localSubjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No subjects yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first subject to get started with academic management.
                    </p>
                    <Button onClick={() => setIsSubjectDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Subject
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                localSubjects.map((subject) => {
                  const assignedStaffNames = getAssignedStaffNames(subject.id);
                  
                  return (
                    <TableRow key={subject.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{subject.name}</div>
                          {subject.description && (
                            <div className="text-sm text-muted-foreground">{subject.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{subject.code}</Badge>
                      </TableCell>
                      <TableCell>
                          <div className="text-sm">
                            <div>
                              T1: {subject.maxScores?.test1 ?? '-'}, T2: {subject.maxScores?.test2 ?? '-'}
                            </div>
                            <div>
                              Exam: {subject.maxScores?.exam ?? '-'}
                            </div>
                          </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {assignedStaffNames.length > 0 
                              ? `${assignedStaffNames.length} staff` 
                              : 'Available for assignment'
                            }
                          </span>
                        </div>
                        {assignedStaffNames.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {assignedStaffNames.join(', ')}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {(subject.maxScores?.test1 ?? 0) + (subject.maxScores?.test2 ?? 0) + (subject.maxScores?.exam ?? 0)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditSubject(subject)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteSubject(subject.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Integration Help */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subject-Staff Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">How Subject Assignment Works:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• All subjects created here are automatically available in Staff Management</li>
              <li>• Use Staff Management to assign subjects to individual staff members</li>
              <li>• Staff can be assigned multiple subjects and classes</li>
              <li>• Subjects can be assigned to multiple staff members</li>
              <li>• Changes are synchronized across the entire system</li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-1">Created Subjects</h5>
              <p className="text-2xl font-bold text-primary">{localSubjects.length}</p>
              <p className="text-xs text-muted-foreground">Available for assignment</p>
            </div>
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-1">Active Staff</h5>
              <p className="text-2xl font-bold text-chart-3">{staff.filter(s => s.isActive).length}</p>
              <p className="text-xs text-muted-foreground">Ready for subject assignment</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}