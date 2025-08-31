import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  BookOpen, 
  Users, 
  FileText, 
  Upload, 
  Download, 
  Plus, 
  Edit, 
  Save, 
  X, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  BarChart3,
  User,
  Calendar,
  School
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useCalendar } from './CalendarContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import schoolLogo from 'figma:asset/fb26b4b240c171a6f425a75dbfc39e0ff4799694.png';

interface ScoreEntry {
  studentId: string;
  studentName: string;
  test1: number | '';
  test2: number | '';
  exam: number | '';
}

export function SubjectSupervisorDashboard() {
  const { 
    user, 
    students, 
    subjects, 
    classes, 
    resultRecords, 
    getSubjectsByStaff, 
    getStudentsByClass,
    addResultRecord,
    updateResultRecord,
    getResultsBySubject,
    addNotification
  } = useAuth();
  
  const { currentSession, currentTerm } = useCalendar();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [scoreEntries, setScoreEntries] = useState<ScoreEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [csvData, setCsvData] = useState('');

  // Get allocated subjects for current staff
  const allocatedSubjects = user ? getSubjectsByStaff(user.id) : [];
  
  // Get classes for selected subject
  const getClassesForSubject = (subjectId: string) => {
    const subject = allocatedSubjects.find(s => s.id === subjectId);
    if (!subject || !subject.assignedClasses) return [];
    
    return classes.filter(c => 
      subject.assignedClasses.includes(c.id) || 
      subject.assignedClasses.includes(c.name)
    );
  };

  // Get students for selected class with proper data
  const getStudentsForScoreEntry = () => {
    if (!selectedClass) return [];
    
    const classStudents = getStudentsByClass(selectedClass);
    console.log(`Students in ${selectedClass}:`, classStudents); // Debug log
    
    return classStudents.filter(student => student.isActive);
  };

  // Initialize score entries when class/subject changes
  useEffect(() => {
    if (selectedSubject && selectedClass) {
      const classStudents = getStudentsForScoreEntry();
      console.log('Initializing score entries for students:', classStudents.length); // Debug log
      
      const entries: ScoreEntry[] = classStudents.map(student => {
        // Check if results already exist
        const existingResults = getResultsBySubject(
          selectedSubject, 
          selectedClass, 
          currentSession?.name, 
          currentTerm?.name
        );
        
        const existingResult = existingResults.find(r => r.studentId === student.studentId);
        
        return {
          studentId: student.studentId,
          studentName: student.fullName,
          test1: existingResult?.scores.test1 || '',
          test2: existingResult?.scores.test2 || '',
          exam: existingResult?.scores.exam || ''
        };
      });
      
      setScoreEntries(entries);
      console.log('Score entries initialized:', entries.length); // Debug log
    } else {
      setScoreEntries([]);
    }
  }, [selectedSubject, selectedClass, currentSession, currentTerm]);

  const handleScoreChange = (studentId: string, scoreType: 'test1' | 'test2' | 'exam', value: string) => {
    const numValue = value === '' ? '' : Math.max(0, Math.min(100, parseInt(value) || 0));
    
    setScoreEntries(prev => 
      prev.map(entry => 
        entry.studentId === studentId 
          ? { ...entry, [scoreType]: numValue }
          : entry
      )
    );
  };

  const validateScores = () => {
    const subject = subjects.find(s => s.id === selectedSubject);
    if (!subject) return { isValid: false, errors: ['Subject not found'] };

    const errors: string[] = [];
    let hasScores = false;

    scoreEntries.forEach(entry => {
      const hasAnyScore = entry.test1 !== '' || entry.test2 !== '' || entry.exam !== '';
      if (hasAnyScore) {
        hasScores = true;
        
        // Validate score ranges
        if (entry.test1 !== '' && (entry.test1 < 0 || entry.test1 > subject.maxScores.test1)) {
          errors.push(`${entry.studentName}: Test 1 score must be between 0 and ${subject.maxScores.test1}`);
        }
        if (entry.test2 !== '' && (entry.test2 < 0 || entry.test2 > subject.maxScores.test2)) {
          errors.push(`${entry.studentName}: Test 2 score must be between 0 and ${subject.maxScores.test2}`);
        }
        if (entry.exam !== '' && (entry.exam < 0 || entry.exam > subject.maxScores.exam)) {
          errors.push(`${entry.studentName}: Exam score must be between 0 and ${subject.maxScores.exam}`);
        }
      }
    });

    if (!hasScores) {
      errors.push('Please enter at least one score before submitting');
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleSubmitScores = async () => {
    if (!selectedSubject || !selectedClass || !currentSession || !currentTerm) {
      addNotification({
        type: 'error',
        title: 'Missing Information',
        message: 'Please select subject, class, session, and term before submitting scores.'
      });
      return;
    }

    const validation = validateScores();
    if (!validation.isValid) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: validation.errors[0]
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const subject = subjects.find(s => s.id === selectedSubject);
      const classData = classes.find(c => c.name === selectedClass);
      
      if (!subject || !classData) {
        throw new Error('Subject or class not found');
      }

      let submittedCount = 0;
      let updatedCount = 0;

      for (const entry of scoreEntries) {
        // Only process entries that have at least one score
        const hasScores = entry.test1 !== '' || entry.test2 !== '' || entry.exam !== '';
        if (!hasScores) continue;

        const student = students.find(s => s.studentId === entry.studentId);
        if (!student) continue;

        // Check if result already exists
        const existingResults = getResultsBySubject(
          selectedSubject, 
          selectedClass, 
          currentSession.name, 
          currentTerm.name
        );
        
        const existingResult = existingResults.find(r => r.studentId === entry.studentId);

        const scores = {
          test1: typeof entry.test1 === 'number' ? entry.test1 : 0,
          test2: typeof entry.test2 === 'number' ? entry.test2 : 0,
          exam: typeof entry.exam === 'number' ? entry.exam : 0
        };

        if (existingResult) {
          // Update existing result
          await updateResultRecord(existingResult.id, { scores });
          updatedCount++;
        } else {
          // Create new result
          await addResultRecord({
            studentId: entry.studentId,
            studentName: entry.studentName,
            subjectId: selectedSubject,
            subjectName: subject.name,
            subjectCode: subject.code,
            classId: classData.id,
            className: selectedClass,
            session: currentSession.name,
            term: currentTerm.name,
            scores,
            submittedBy: user?.id || '',
            submittedByName: user?.name || '',
            isApproved: false
          });
          submittedCount++;
        }
      }

      addNotification({
        type: 'success',
        title: 'Scores Submitted',
        message: `Successfully submitted ${submittedCount} new scores and updated ${updatedCount} existing scores.`
      });

      // Reset form
      setSelectedSubject('');
      setSelectedClass('');
      setScoreEntries([]);

    } catch (error) {
      console.error('Error submitting scores:', error);
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'Failed to submit scores. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCSVImport = () => {
    if (!csvData.trim()) {
      addNotification({
        type: 'error',
        title: 'No Data',
        message: 'Please paste CSV data before importing.'
      });
      return;
    }

    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Validate headers
      const requiredHeaders = ['student_id', 'student_name'];
      const scoreHeaders = ['test1', 'test2', 'exam'];
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        addNotification({
          type: 'error',
          title: 'Invalid CSV Format',
          message: `Missing required columns: ${missingHeaders.join(', ')}`
        });
        return;
      }

      const importedEntries: ScoreEntry[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const entry: any = {};
        
        headers.forEach((header, index) => {
          entry[header] = values[index] || '';
        });

        // Validate student exists
        const student = students.find(s => 
          s.studentId === entry.student_id && 
          s.class === selectedClass &&
          s.isActive
        );

        if (student) {
          importedEntries.push({
            studentId: entry.student_id,
            studentName: entry.student_name || student.fullName,
            test1: entry.test1 ? parseInt(entry.test1) || '' : '',
            test2: entry.test2 ? parseInt(entry.test2) || '' : '',
            exam: entry.exam ? parseInt(entry.exam) || '' : ''
          });
        }
      }

      if (importedEntries.length === 0) {
        addNotification({
          type: 'warning',
          title: 'No Valid Data',
          message: 'No valid student records found in the CSV data.'
        });
        return;
      }

      // Merge with existing entries
      setScoreEntries(prev => {
        const updated = [...prev];
        
        importedEntries.forEach(imported => {
          const existingIndex = updated.findIndex(e => e.studentId === imported.studentId);
          if (existingIndex >= 0) {
            // Update existing entry
            updated[existingIndex] = {
              ...updated[existingIndex],
              test1: imported.test1 !== '' ? imported.test1 : updated[existingIndex].test1,
              test2: imported.test2 !== '' ? imported.test2 : updated[existingIndex].test2,
              exam: imported.exam !== '' ? imported.exam : updated[existingIndex].exam
            };
          }
        });
        
        return updated;
      });

      addNotification({
        type: 'success',
        title: 'CSV Imported',
        message: `Successfully imported scores for ${importedEntries.length} students.`
      });

      setImportDialogOpen(false);
      setCsvData('');

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Import Failed',
        message: 'Failed to parse CSV data. Please check the format.'
      });
    }
  };

  const exportTemplate = () => {
    if (!selectedClass) {
      addNotification({
        type: 'warning',
        title: 'Select Class',
        message: 'Please select a class before downloading the template.'
      });
      return;
    }

    const classStudents = getStudentsForScoreEntry();
    if (classStudents.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Students',
        message: 'No students found in the selected class.'
      });
      return;
    }

    const headers = ['student_id', 'student_name', 'test1', 'test2', 'exam'];
    const csvContent = [
      headers.join(','),
      ...classStudents.map(student => 
        `${student.studentId},"${student.fullName}",,,`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedClass}_score_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Template Downloaded',
      message: `Score template for ${selectedClass} has been downloaded.`
    });
  };

  // Filter score entries based on search
  const filteredScoreEntries = scoreEntries.filter(entry =>
    entry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get statistics
  const getStats = () => {
    const totalStudents = students.filter(s => s.isActive).length;
    const myResults = resultRecords.filter(r => r.submittedBy === user?.id);
    const pendingApproval = myResults.filter(r => !r.isApproved).length;
    const currentTermResults = myResults.filter(r => 
      r.session === currentSession?.name && 
      r.term === currentTerm?.name
    ).length;

    return {
      totalSubjects: allocatedSubjects.length,
      totalStudents,
      submittedResults: myResults.length,
      pendingApproval,
      currentTermResults
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-4 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <ImageWithFallback 
              src={schoolLogo} 
              alt="Graceland Royal Academy"
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
            />
            <div>
              <h1 className="text-lg sm:text-xl font-semibold">Subject Supervisor Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Score Management • {currentTerm?.name} - {currentSession?.name}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
            <BookOpen className="h-3 w-3 mr-1" />
            Subject Supervisor
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {allocatedSubjects.length} Subjects
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-10">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="score-entry" className="text-xs">Score Entry</TabsTrigger>
          <TabsTrigger value="my-submissions" className="text-xs">My Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">My Subjects</p>
                    <p className="text-lg font-semibold">{stats.totalSubjects}</p>
                  </div>
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Students</p>
                    <p className="text-lg font-semibold">{stats.totalStudents}</p>
                  </div>
                  <Users className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Results Submitted</p>
                    <p className="text-lg font-semibold">{stats.submittedResults}</p>
                  </div>
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Pending Approval</p>
                    <p className="text-lg font-semibold">{stats.pendingApproval}</p>
                  </div>
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">This Term</p>
                    <p className="text-lg font-semibold">{stats.currentTermResults}</p>
                  </div>
                  <Calendar className="h-4 w-4 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Allocated Subjects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">My Allocated Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              {allocatedSubjects.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground mb-2">No subjects allocated yet</p>
                  <p className="text-sm text-muted-foreground">Contact your administrator to get subject assignments</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allocatedSubjects.map((subject) => {
                    const subjectClasses = getClassesForSubject(subject.id);
                    const subjectResults = resultRecords.filter(r => 
                      r.subjectId === subject.id && 
                      r.submittedBy === user?.id
                    );

                    return (
                      <Card key={subject.id} className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-medium">{subject.name}</h3>
                            <p className="text-sm text-muted-foreground">Code: {subject.code}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Classes:</span>
                              <span>{subjectClasses.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Results:</span>
                              <span>{subjectResults.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Approved:</span>
                              <span>{subjectResults.filter(r => r.isApproved).length}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {subjectClasses.slice(0, 3).map(cls => (
                              <Badge key={cls.id} variant="outline" className="text-xs">
                                {cls.name}
                              </Badge>
                            ))}
                            {subjectClasses.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{subjectClasses.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="score-entry" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base">Student Score Entry</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter scores for your allocated subjects and classes
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={exportTemplate}
                    disabled={!selectedClass}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Template
                  </Button>
                  <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={!selectedClass}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import CSV
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Import Scores from CSV</DialogTitle>
                        <DialogDescription>
                          Paste your CSV data with columns: student_id, student_name, test1, test2, exam
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="csvData">CSV Data</Label>
                          <textarea
                            id="csvData"
                            className="w-full h-64 p-3 border rounded-md text-sm font-mono"
                            value={csvData}
                            onChange={(e) => setCsvData(e.target.value)}
                            placeholder="student_id,student_name,test1,test2,exam&#10;GRA001,John Doe,18,16,55&#10;GRA002,Jane Smith,20,19,60"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCSVImport}>
                            Import Scores
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subject and Class Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Select Subject *</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {allocatedSubjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="class">Select Class *</Label>
                  <Select 
                    value={selectedClass} 
                    onValueChange={setSelectedClass}
                    disabled={!selectedSubject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedSubject && getClassesForSubject(selectedSubject).map(classData => (
                        <SelectItem key={classData.id} value={classData.name}>
                          {classData.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search and Student Count */}
              {selectedSubject && selectedClass && (
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Badge variant="outline">
                    {filteredScoreEntries.length} students
                  </Badge>
                </div>
              )}

              {/* Students Score Entry Table */}
              {selectedSubject && selectedClass && (
                <div className="space-y-4">
                  {filteredScoreEntries.length === 0 ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {scoreEntries.length === 0 
                          ? `No students found in ${selectedClass}. Please check if students are properly registered.`
                          : 'No students match your search criteria.'
                        }
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[200px]">Student</TableHead>
                              <TableHead className="w-[100px]">Test 1</TableHead>
                              <TableHead className="w-[100px]">Test 2</TableHead>
                              <TableHead className="w-[100px]">Exam</TableHead>
                              <TableHead className="w-[100px]">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredScoreEntries.map((entry) => {
                              const subject = subjects.find(s => s.id === selectedSubject);
                              const total = (entry.test1 || 0) + (entry.test2 || 0) + (entry.exam || 0);
                              const maxTotal = subject ? 
                                subject.maxScores.test1 + subject.maxScores.test2 + subject.maxScores.exam : 100;
                              
                              return (
                                <TableRow key={entry.studentId}>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="font-medium text-sm">{entry.studentName}</div>
                                      <div className="text-xs text-muted-foreground font-mono">
                                        ID: {entry.studentId}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="0"
                                      max={subject?.maxScores.test1 || 20}
                                      value={entry.test1}
                                      onChange={(e) => handleScoreChange(entry.studentId, 'test1', e.target.value)}
                                      placeholder="0"
                                      className="w-20 text-sm"
                                    />
                                    <div className="text-xs text-muted-foreground mt-1">
                                      /{subject?.maxScores.test1 || 20}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="0"
                                      max={subject?.maxScores.test2 || 20}
                                      value={entry.test2}
                                      onChange={(e) => handleScoreChange(entry.studentId, 'test2', e.target.value)}
                                      placeholder="0"
                                      className="w-20 text-sm"
                                    />
                                    <div className="text-xs text-muted-foreground mt-1">
                                      /{subject?.maxScores.test2 || 20}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="0"
                                      max={subject?.maxScores.exam || 60}
                                      value={entry.exam}
                                      onChange={(e) => handleScoreChange(entry.studentId, 'exam', e.target.value)}
                                      placeholder="0"
                                      className="w-20 text-sm"
                                    />
                                    <div className="text-xs text-muted-foreground mt-1">
                                      /{subject?.maxScores.exam || 60}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm font-medium">
                                      {total > 0 ? `${total}/${maxTotal}` : '-'}
                                    </div>
                                    {total > 0 && (
                                      <div className="text-xs text-muted-foreground">
                                        {((total / maxTotal) * 100).toFixed(1)}%
                                      </div>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end pt-4">
                        <Button 
                          onClick={handleSubmitScores}
                          disabled={isSubmitting}
                          className="min-w-[140px]"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Submit Scores
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Instructions */}
              {!selectedSubject && (
                <Alert>
                  <BookOpen className="h-4 w-4" />
                  <AlertDescription>
                    Select a subject and class to begin entering student scores. You can only enter scores for subjects allocated to you.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">My Result Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Results Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Scores</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultRecords
                      .filter(r => r.submittedBy === user?.id)
                      .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
                      .slice(0, 50) // Show recent 50 results
                      .map((result) => (
                        <TableRow key={result.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{result.studentName}</div>
                              <div className="text-xs text-muted-foreground">
                                ID: {result.studentId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{result.subjectName}</div>
                              <div className="text-xs text-muted-foreground">
                                {result.subjectCode}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{result.className}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              T1: {result.scores.test1}, T2: {result.scores.test2}, E: {result.scores.exam}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {result.total} ({result.grade})
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={result.isApproved ? "default" : "secondary"}
                              className={result.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                            >
                              {result.isApproved ? 'Approved' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(result.submittedDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              {resultRecords.filter(r => r.submittedBy === user?.id).length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground mb-2">No submissions yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start by entering scores in the Score Entry tab
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}