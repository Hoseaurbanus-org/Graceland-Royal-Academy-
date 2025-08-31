import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { 
  BookOpen, 
  School, 
  Users, 
  GraduationCap, 
  FileText, 
  Plus,
  Edit,
  Save,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { SchoolLogo } from './SchoolLogo';
import { toast } from 'sonner';

interface ResultEntry {
  id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  term: string;
  session: string;
  test1_score?: number;
  test2_score?: number;
  exam_score?: number;
  total_score: number;
  grade: string;
  status: 'draft' | 'submitted' | 'approved' | 'published';
}

export function SupervisorDashboard() {
  const { 
    user, 
    students, 
    classes, 
    subjects, 
    getStaffAssignments,
    results: allResults 
  } = useAuth();
  
  const { addNotification } = useNotifications();
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [selectedSession, setSelectedSession] = useState('2024/2025');
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<any>(null);
  
  const [resultForm, setResultForm] = useState({
    test1_score: '',
    test2_score: '',
    exam_score: ''
  });

  // Get staff assignments for current user
  const staffAssignments = user ? getStaffAssignments(user.id) : [];
  
  // Get assigned subjects and classes
  const assignedSubjects = staffAssignments
    .filter(a => a.subject_id)
    .map(a => subjects.find(s => s.id === a.subject_id))
    .filter(Boolean);
    
  const assignedClasses = staffAssignments
    .filter(a => a.class_id)
    .map(a => classes.find(c => c.id === a.class_id))
    .filter(Boolean);

  // Get unique classes from subject assignments
  const subjectClassAssignments = staffAssignments
    .filter(a => a.subject_id && a.class_id)
    .reduce((acc, assignment) => {
      const key = `${assignment.subject_id}-${assignment.class_id}`;
      if (!acc[key]) {
        acc[key] = {
          subject: subjects.find(s => s.id === assignment.subject_id),
          class: classes.find(c => c.id === assignment.class_id)
        };
      }
      return acc;
    }, {} as Record<string, any>);

  // Get students for selected class
  const classStudents = selectedClass 
    ? students.filter(s => s.class_id === selectedClass && s.is_active)
    : [];

  // Get current results for selected subject/class/term/session
  const currentResults = allResults.filter(r => 
    r.subject_id === selectedSubject &&
    r.class_id === selectedClass &&
    r.term === selectedTerm &&
    r.session === selectedSession
  );

  // Calculate statistics
  const stats = {
    assignedSubjects: assignedSubjects.length,
    assignedClasses: [...new Set([
      ...assignedClasses.map(c => c?.id),
      ...Object.values(subjectClassAssignments).map((a: any) => a.class?.id)
    ])].filter(Boolean).length,
    totalStudents: [...new Set([
      ...assignedClasses.flatMap(c => students.filter(s => s.class_id === c?.id)),
      ...Object.values(subjectClassAssignments).flatMap((a: any) => 
        students.filter(s => s.class_id === a.class?.id)
      )
    ])].length,
    pendingResults: currentResults.filter(r => r.status === 'draft').length
  };

  const calculateGrade = (totalScore: number): string => {
    if (totalScore >= 80) return 'A';
    if (totalScore >= 70) return 'B';
    if (totalScore >= 60) return 'C';
    if (totalScore >= 50) return 'D';
    if (totalScore >= 40) return 'E';
    return 'F';
  };

  const calculateTotal = (test1: number, test2: number, exam: number): number => {
    // Test 1: 20%, Test 2: 20%, Exam: 60%
    return Math.round((test1 * 0.2) + (test2 * 0.2) + (exam * 0.6));
  };

  const handleSaveResult = () => {
    if (!editingResult || !selectedSubject || !selectedClass) return;

    const test1 = parseFloat(resultForm.test1_score) || 0;
    const test2 = parseFloat(resultForm.test2_score) || 0;
    const exam = parseFloat(resultForm.exam_score) || 0;

    // Validation
    if (test1 > 100 || test2 > 100 || exam > 100) {
      toast.error('Scores cannot exceed 100');
      return;
    }

    const totalScore = calculateTotal(test1, test2, exam);
    const grade = calculateGrade(totalScore);

    // Save result (in a real app, this would update the database)
    const resultData = {
      student_id: editingResult.student_id,
      subject_id: selectedSubject,
      class_id: selectedClass,
      term: selectedTerm,
      session: selectedSession,
      test1_score: test1,
      test2_score: test2,
      exam_score: exam,
      total_score: totalScore,
      grade: grade,
      status: 'draft' as const
    };

    // Here you would typically call an API to save the result
    console.log('Saving result:', resultData);
    
    toast.success('Result saved successfully');
    addNotification({
      type: 'success',
      title: 'Result Recorded',
      message: `Result for ${editingResult.student_name} in ${subjects.find(s => s.id === selectedSubject)?.name} has been saved`,
      autoHide: true
    });

    setIsResultDialogOpen(false);
    resetResultForm();
  };

  const resetResultForm = () => {
    setResultForm({
      test1_score: '',
      test2_score: '',
      exam_score: ''
    });
    setEditingResult(null);
  };

  const handleEditResult = (student: any) => {
    const existingResult = currentResults.find(r => r.student_id === student.id);
    
    setEditingResult({
      student_id: student.id,
      student_name: student.name,
      student_photo: student.photo_url
    });

    if (existingResult) {
      setResultForm({
        test1_score: existingResult.test1_score?.toString() || '',
        test2_score: existingResult.test2_score?.toString() || '',
        exam_score: existingResult.exam_score?.toString() || ''
      });
    } else {
      resetResultForm();
    }

    setIsResultDialogOpen(true);
  };

  const getAvailableClassesForSubject = (subjectId: string) => {
    return staffAssignments
      .filter(a => a.subject_id === subjectId && a.class_id)
      .map(a => classes.find(c => c.id === a.class_id))
      .filter(Boolean);
  };

  if (user?.role !== 'supervisor') {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
        <p className="text-muted-foreground">Access denied. Supervisor privileges required.</p>
      </div>
    );
  }

  // CSV Export/Import and Submit Results Handlers (must be after all hooks and variables, before return)
  function handleExportCSV() {
    const tableHeaders = ['Admission Number', 'Student Name', 'Test 1 Score', 'Test 2 Score', 'Exam Score', 'Total', 'Grade', 'Status'];
    const rows = classStudents.map(student => {
      const result = currentResults.find(r => r.student_id === student.id) || {};
      return [
        student.admission_number,
        student.name,
        result.test1_score ?? '',
        result.test2_score ?? '',
        result.exam_score ?? '',
        result.total_score ?? '',
        result.grade ?? '',
        result.status ?? ''
      ];
    });
    const csvContent = [tableHeaders, ...rows].map(r => r.map(String).map(s => '"' + s.replace(/"/g, '""') + '"').join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results_${selectedSubject}_${selectedClass}_${selectedTerm}_${selectedSession}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully.');
  }

  function handleImportCSV(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return toast.error('Empty CSV file.');
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) return toast.error('CSV must have at least one data row.');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
      const admIdx = headers.indexOf('admission number');
      const t1Idx = headers.indexOf('test 1 score');
      const t2Idx = headers.indexOf('test 2 score');
      const exIdx = headers.indexOf('exam score');
      if (admIdx === -1 || t1Idx === -1 || t2Idx === -1 || exIdx === -1) {
        return toast.error('CSV must have columns: Admission Number, Test 1 Score, Test 2 Score, Exam Score');
      }
      let updated = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
        const admission_number = cols[admIdx];
        const student = classStudents.find(s => s.admission_number === admission_number);
        if (!student) continue;
        const test1 = parseFloat(cols[t1Idx]) || 0;
        const test2 = parseFloat(cols[t2Idx]) || 0;
        const exam = parseFloat(cols[exIdx]) || 0;
        const totalScore = calculateTotal(test1, test2, exam);
        const grade = calculateGrade(totalScore);
        console.log('Imported result:', { student_id: student.id, test1, test2, exam, totalScore, grade });
        updated++;
      }
      toast.success(`Imported ${updated} results from CSV.`);
    };
    reader.readAsText(file);
  }

  function handleSubmitResults() {
    toast.success('Results submitted to Admin for approval.');
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Supervisor Dashboard</h1>
          <p className="text-muted-foreground">Manage assigned subjects and record student results</p>
        </div>
  <SchoolLogo size="md" showText={false} animate={false} />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Subjects</p>
                  <p className="text-2xl font-bold text-primary">{stats.assignedSubjects}</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary" />
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
                  <p className="text-sm text-muted-foreground">Assigned Classes</p>
                  <p className="text-2xl font-bold text-primary">{stats.assignedClasses}</p>
                </div>
                <School className="h-8 w-8 text-primary" />
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
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
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
                  <p className="text-sm text-muted-foreground">Pending Results</p>
                  <p className="text-2xl font-bold text-primary">{stats.pendingResults}</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Assignment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            My Assignments
          </CardTitle>
          <CardDescription>
            Subjects and classes assigned to you for supervision and result recording
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject Assignments */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Subject Assignments
              </h4>
              <div className="space-y-2">
                {Object.values(subjectClassAssignments).map((assignment: any, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{assignment.subject?.name}</p>
                      <p className="text-sm text-muted-foreground">{assignment.class?.name}</p>
                    </div>
                    <Badge variant="secondary">{assignment.subject?.code}</Badge>
                  </div>
                ))}
                {Object.keys(subjectClassAssignments).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No subject assignments yet
                  </p>
                )}
              </div>
            </div>

            {/* Class Supervision */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <School className="h-4 w-4" />
                Class Supervision
              </h4>
              <div className="space-y-2">
                {assignedClasses.map((classItem: any) => (
                  <div key={classItem?.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{classItem?.name}</p>
                      <p className="text-sm text-muted-foreground">{classItem?.level}</p>
                    </div>
                    <Badge variant="outline">
                      {students.filter(s => s.class_id === classItem?.id && s.is_active).length} students
                    </Badge>
                  </div>
                ))}
                {assignedClasses.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No class supervision assignments
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result Recording Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Result Recording
          </CardTitle>
          <CardDescription>
            Record test scores and exam results for your assigned subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* ...existing code... */}
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {assignedSubjects.map((subject: any) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="class">Class</Label>
              <Select 
                value={selectedClass} 
                onValueChange={setSelectedClass}
                disabled={!selectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {selectedSubject && getAvailableClassesForSubject(selectedSubject).map((classItem: any) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="term">Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="First Term">First Term</SelectItem>
                  <SelectItem value="Second Term">Second Term</SelectItem>
                  <SelectItem value="Third Term">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="session">Session</Label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                  <SelectItem value="2023/2024">2023/2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* CSV Export/Import and Submit Results */}
          {selectedSubject && selectedClass && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={() => handleExportCSV()}>
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => document.getElementById('csv-import-input')?.click()}>
                Import CSV
              </Button>
              <input
                id="csv-import-input"
                type="file"
                accept=".csv"
                className="visually-hidden"
                aria-label="Import CSV"
                onChange={handleImportCSV}
              />
              <Button variant="default" size="sm" onClick={handleSubmitResults}>
                Submit Results
              </Button>
            </div>
          )}

          {/* Students Table */}
          {selectedSubject && selectedClass ? (
            <div className="overflow-x-auto">
              {/* ...existing code... */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Test 1 (20%)</TableHead>
                    <TableHead>Test 2 (20%)</TableHead>
                    <TableHead>Exam (60%)</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classStudents.map((student) => {
                    const result = currentResults.find(r => r.student_id === student.id);
                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={student.photo_url} alt={student.name} />
                              <AvatarFallback className="text-xs">
                                {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
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
                          {result?.grade && (
                            <Badge variant={result.grade === 'F' ? 'destructive' : 'default'}>
                              {result.grade}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {result ? (
                            <Badge variant="secondary">
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
              <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Select a subject and class to begin recording results</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Entry Dialog */}
      <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Record Result - {editingResult?.student_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {editingResult?.student_photo && (
              <div className="flex justify-center">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={editingResult.student_photo} alt={editingResult.student_name} />
                  <AvatarFallback>
                    {editingResult.student_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            <div className="text-center">
              <p className="font-medium">{editingResult?.student_name}</p>
              <p className="text-sm text-muted-foreground">
                {subjects.find(s => s.id === selectedSubject)?.name} - {selectedTerm} {selectedSession}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="test1">Test 1 Score (20%)</Label>
                <Input
                  id="test1"
                  type="number"
                  min="0"
                  max="100"
                  value={resultForm.test1_score}
                  onChange={(e) => setResultForm({ ...resultForm, test1_score: e.target.value })}
                  placeholder="Enter score out of 100"
                />
              </div>

              <div>
                <Label htmlFor="test2">Test 2 Score (20%)</Label>
                <Input
                  id="test2"
                  type="number"
                  min="0"
                  max="100"
                  value={resultForm.test2_score}
                  onChange={(e) => setResultForm({ ...resultForm, test2_score: e.target.value })}
                  placeholder="Enter score out of 100"
                />
              </div>

              <div>
                <Label htmlFor="exam">Exam Score (60%)</Label>
                <Input
                  id="exam"
                  type="number"
                  min="0"
                  max="100"
                  value={resultForm.exam_score}
                  onChange={(e) => setResultForm({ ...resultForm, exam_score: e.target.value })}
                  placeholder="Enter score out of 100"
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
                    const total = calculateTotal(test1, test2, exam);
                    const grade = calculateGrade(total);
                    
                    return (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Score: <strong>{total}</strong></span>
                        <Badge variant={grade === 'F' ? 'destructive' : 'default'}>
                          Grade: {grade}
                        </Badge>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsResultDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveResult}>
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