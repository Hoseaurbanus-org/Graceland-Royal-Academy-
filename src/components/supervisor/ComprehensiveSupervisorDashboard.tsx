import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { 
  BookOpen, 
  School, 
  Users, 
  FileText,
  Save,
  Send,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Target,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { SchoolLogo } from '../SchoolLogo';
import { toast } from 'sonner@2.0.3';

export function ComprehensiveSupervisorDashboard() {
  const { 
    user,
    students = [],
    classes = [],
    subjects = [],
    results = [],
    currentSession,
    currentTerm,
    recordResult,
    submitResults,
    getStaffAssignments,
    getStudentsByClass,
    getResultsByStudent
  } = useAuth();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [resultDialog, setResultDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [resultForm, setResultForm] = useState({
    test1_score: '',
    test2_score: '',
    exam_score: ''
  });

  // Get supervisor assignments with safe defaults
  const assignments = user && typeof getStaffAssignments === 'function' 
    ? getStaffAssignments(user.id) 
    : { classes: [], subjects: [] };
    
  const assignedClasses = (assignments.classes || [])
    .map(cId => classes.find(c => c?.id === cId))
    .filter(Boolean);
    
  const assignedSubjects = (assignments.subjects || [])
    .map(sId => subjects.find(s => s?.id === sId))
    .filter(Boolean);

  // Get students for selected class with safe handling
  const classStudents = selectedClass && typeof getStudentsByClass === 'function' 
    ? getStudentsByClass(selectedClass) || []
    : selectedClass 
    ? students.filter(s => s?.class_id === selectedClass && s?.is_active) || []
    : [];

  // Get current results for selected class/subject with safe filtering
  const getCurrentResults = () => {
    if (!selectedClass || !selectedSubject || !Array.isArray(results)) return [];
    
    return results.filter(r => 
      r?.class_id === selectedClass &&
      r?.subject_id === selectedSubject &&
      r?.session === currentSession &&
      r?.term === currentTerm &&
      r?.supervisor_id === user?.id
    ) || [];
  };

  const currentResults = getCurrentResults();

  // Statistics with safe calculations
  const stats = {
    assignedClasses: assignedClasses.length,
    assignedSubjects: assignedSubjects.length,
    totalStudents: assignedClasses.reduce((total, cls) => {
      const studentsInClass = typeof getStudentsByClass === 'function' 
        ? getStudentsByClass(cls?.id || '')?.length || 0
        : students.filter(s => s?.class_id === cls?.id && s?.is_active).length || 0;
      return total + studentsInClass;
    }, 0),
    completedResults: Array.isArray(results) ? results.filter(r => 
      r?.supervisor_id === user?.id && 
      r?.session === currentSession && 
      r?.term === currentTerm &&
      r?.status !== 'draft'
    ).length : 0,
    pendingResults: Array.isArray(results) ? results.filter(r => 
      r?.supervisor_id === user?.id && 
      r?.session === currentSession && 
      r?.term === currentTerm &&
      r?.status === 'draft'
    ).length : 0,
    submittedResults: Array.isArray(results) ? results.filter(r => 
      r?.supervisor_id === user?.id && 
      r?.session === currentSession && 
      r?.term === currentTerm &&
      r?.status === 'submitted'
    ).length : 0
  };

  // Calculate grade from percentage
  const calculateGrade = (percentage: number): string => {
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    return 'F';
  };

  // Get grade color
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'E': return 'text-red-600 bg-red-100';
      case 'F': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Handle result entry
  const handleRecordResult = async () => {
    if (!selectedStudent || !selectedSubject || typeof recordResult !== 'function') return;

    const test1 = parseFloat(resultForm.test1_score) || 0;
    const test2 = parseFloat(resultForm.test2_score) || 0;
    const exam = parseFloat(resultForm.exam_score) || 0;

    // Validation
    if (test1 > 100 || test2 > 100 || exam > 100) {
      toast.error('Scores cannot exceed 100');
      return;
    }

    if (test1 < 0 || test2 < 0 || exam < 0) {
      toast.error('Scores cannot be negative');
      return;
    }

    try {
      await recordResult({
        student_id: selectedStudent.id,
        subject_id: selectedSubject,
        test1_score: test1,
        test2_score: test2,
        exam_score: exam
      });

      setResultDialog(false);
      setResultForm({ test1_score: '', test2_score: '', exam_score: '' });
      setSelectedStudent(null);
    } catch (error) {
      toast.error('Failed to record result');
    }
  };

  // Handle result submission
  const handleSubmitResults = async () => {
    if (!selectedClass || !selectedSubject || typeof submitResults !== 'function') return;

    const incompleteResults = classStudents.filter(student => {
      const result = currentResults.find(r => r?.student_id === student?.id);
      return !result || result.status === 'draft';
    });

    if (incompleteResults.length > 0) {
      toast.error(`Please complete results for all ${classStudents.length} students before submitting`);
      return;
    }

    try {
      await submitResults(selectedClass, selectedSubject);
    } catch (error) {
      toast.error('Failed to submit results');
    }
  };

  // Handle edit result
  const handleEditResult = (student: any) => {
    if (!student) return;
    
    const existingResult = currentResults.find(r => r?.student_id === student.id);
    
    setSelectedStudent(student);
    if (existingResult) {
      setResultForm({
        test1_score: existingResult.test1_score?.toString() || '',
        test2_score: existingResult.test2_score?.toString() || '',
        exam_score: existingResult.exam_score?.toString() || ''
      });
    } else {
      setResultForm({ test1_score: '', test2_score: '', exam_score: '' });
    }
    setResultDialog(true);
  };

  // Get completion progress
  const getCompletionProgress = () => {
    if (classStudents.length === 0) return 0;
    const completedCount = classStudents.filter(student => {
      const result = currentResults.find(r => r?.student_id === student?.id);
      return result && result.status !== 'draft';
    }).length;
    return Math.round((completedCount / classStudents.length) * 100);
  };

  const completionProgress = getCompletionProgress();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SchoolLogo size="md" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Supervisor Dashboard</h1>
            <p className="text-muted-foreground">Result Entry & Management System</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{currentSession || '2024/2025'}</Badge>
          <Badge variant="secondary">{currentTerm || 'First Term'}</Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Classes</p>
                  <p className="text-2xl font-bold text-primary">{stats.assignedClasses}</p>
                </div>
                <School className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Subjects</p>
                  <p className="text-2xl font-bold text-primary">{stats.assignedSubjects}</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedResults}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingResults}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.submittedResults}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* My Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>My Assignments</CardTitle>
          <CardDescription>Classes and subjects assigned to you for supervision</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assigned Classes */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <School className="h-4 w-4" />
                Assigned Classes ({assignedClasses.length})
              </h4>
              <div className="space-y-2">
                {assignedClasses.map((classItem: any) => {
                  if (!classItem) return null;
                  const studentCount = typeof getStudentsByClass === 'function' 
                    ? getStudentsByClass(classItem.id)?.length || 0
                    : students.filter(s => s?.class_id === classItem.id && s?.is_active).length || 0;
                  
                  return (
                    <div key={classItem.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{classItem.name}</p>
                        <p className="text-sm text-muted-foreground">{classItem.level}</p>
                      </div>
                      <Badge variant="outline">
                        {studentCount} students
                      </Badge>
                    </div>
                  );
                })}
                {assignedClasses.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No classes assigned yet
                  </p>
                )}
              </div>
            </div>

            {/* Assigned Subjects */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Assigned Subjects ({assignedSubjects.length})
              </h4>
              <div className="space-y-2">
                {assignedSubjects.map((subject: any) => {
                  if (!subject) return null;
                  
                  return (
                    <div key={subject.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{subject.name}</p>
                        <p className="text-sm text-muted-foreground">Code: {subject.code}</p>
                      </div>
                      <Badge variant="secondary">{subject.code}</Badge>
                    </div>
                  );
                })}
                {assignedSubjects.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No subjects assigned yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result Entry Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Result Entry System
          </CardTitle>
          <CardDescription>
            Record test scores and exam results for your assigned classes and subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="class">Select Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {assignedClasses.map((classItem: any) => {
                    if (!classItem) return null;
                    return (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.name} - {classItem.level}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Select Subject</Label>
              <Select 
                value={selectedSubject} 
                onValueChange={setSelectedSubject}
                disabled={!selectedClass}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent>
                  {assignedSubjects.map((subject: any) => {
                    if (!subject) return null;
                    return (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Students Table or Empty State */}
          {selectedClass && selectedSubject ? (
            classStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Admission No.</TableHead>
                      <TableHead>Test 1 (100)</TableHead>
                      <TableHead>Test 2 (100)</TableHead>
                      <TableHead>Exam (100)</TableHead>
                      <TableHead>Total (300)</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classStudents.map((student) => {
                      if (!student) return null;
                      const result = currentResults.find(r => r?.student_id === student.id);
                      return (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={student.photo_url} alt={student.name} />
                                <AvatarFallback className="text-xs">
                                  {student.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{student.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {student.admission_number}
                          </TableCell>
                          <TableCell>
                            {result?.test1_score ?? '-'}
                          </TableCell>
                          <TableCell>
                            {result?.test2_score ?? '-'}
                          </TableCell>
                          <TableCell>
                            {result?.exam_score ?? '-'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {result?.total_score ?? '-'}
                          </TableCell>
                          <TableCell>
                            {result ? `${result.percentage}%` : '-'}
                          </TableCell>
                          <TableCell>
                            {result?.grade && (
                              <Badge className={getGradeColor(result.grade)}>
                                {result.grade}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {result ? (
                              <Badge 
                                variant={result.status === 'submitted' ? 'default' : 'secondary'}
                              >
                                {result.status}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not started</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditResult(student)}
                              disabled={result?.status === 'submitted'}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              {result ? 'Edit' : 'Add'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No students found in this class</p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Select a class and subject to begin recording results</p>
              <p className="text-sm text-muted-foreground">Choose from your assigned classes and subjects above</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Entry Dialog */}
      <Dialog open={resultDialog} onOpenChange={setResultDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Record Result - {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedStudent?.photo_url && (
              <div className="flex justify-center">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedStudent.photo_url} alt={selectedStudent.name} />
                  <AvatarFallback>
                    {selectedStudent.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            <div className="text-center">
              <p className="font-medium">{selectedStudent?.name}</p>
              <p className="text-sm text-muted-foreground">
                {subjects.find(s => s?.id === selectedSubject)?.name} - {currentTerm || 'First Term'} {currentSession || '2024/2025'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="test1">Test 1 Score (out of 100)</Label>
                <Input
                  id="test1"
                  type="number"
                  min="0"
                  max="100"
                  value={resultForm.test1_score}
                  onChange={(e) => setResultForm({ ...resultForm, test1_score: e.target.value })}
                  placeholder="Enter score"
                />
              </div>

              <div>
                <Label htmlFor="test2">Test 2 Score (out of 100)</Label>
                <Input
                  id="test2"
                  type="number"
                  min="0"
                  max="100"
                  value={resultForm.test2_score}
                  onChange={(e) => setResultForm({ ...resultForm, test2_score: e.target.value })}
                  placeholder="Enter score"
                />
              </div>

              <div>
                <Label htmlFor="exam">Exam Score (out of 100)</Label>
                <Input
                  id="exam"
                  type="number"
                  min="0"
                  max="100"
                  value={resultForm.exam_score}
                  onChange={(e) => setResultForm({ ...resultForm, exam_score: e.target.value })}
                  placeholder="Enter score"
                />
              </div>

              {/* Score Preview */}
              {(resultForm.test1_score || resultForm.test2_score || resultForm.exam_score) && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-2">Score Preview:</p>
                  {(() => {
                    const test1 = parseFloat(resultForm.test1_score) || 0;
                    const test2 = parseFloat(resultForm.test2_score) || 0;
                    const exam = parseFloat(resultForm.exam_score) || 0;
                    const total = test1 + test2 + exam;
                    const percentage = Math.round((total / 300) * 100);
                    const grade = calculateGrade(percentage);
                    
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Total Score:</span>
                          <strong>{total}/300</strong>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Percentage:</span>
                          <strong>{percentage}%</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Grade:</span>
                          <Badge className={getGradeColor(grade)}>
                            {grade}
                          </Badge>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setResultDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleRecordResult}>
                <Save className="h-4 w-4 mr-2" />
                Save Result
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}