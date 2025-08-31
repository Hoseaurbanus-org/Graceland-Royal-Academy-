import React, { useState, useEffect } from 'react';
import { Send, Upload, Download, FileSpreadsheet, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../AuthContext';
import { useCalendar } from '../CalendarContext';
import { useResults, StudentResult } from '../ResultContext';

interface StudentScore {
  studentId: string;
  studentName: string;
  class: string;
  test1: number;
  test2: number;
  exam: number;
  total: number;
  grade: string;
}

export function ResultSubmissionSystem() {
  const { user } = useAuth();
  const { currentTerm, currentSession } = useCalendar();
  const { 
    createResult, 
    updateResult, 
    submitResult, 
    getResultsByTeacher, 
    students, 
    getStudentsByClass 
  } = useResults();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<StudentScore[]>([]);
  const [manualScores, setManualScores] = useState<StudentScore[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // Get teacher's submitted results
  const teacherResults = getResultsByTeacher(
    user?.id || '', 
    currentTerm?.name, 
    currentSession?.name
  );

  // Get students for the teacher's classes
  const classStudents = user?.role === 'subject_supervisor' 
    ? (user.classes || []).flatMap(className => 
        getStudentsByClass(className).map(student => ({
          studentId: student.studentId,
          studentName: student.name,
          class: student.class
        }))
      )
    : user?.role === 'class_supervisor' && user.assignedClass
    ? getStudentsByClass(user.assignedClass).map(student => ({
        studentId: student.studentId,
        studentName: student.name,
        class: student.class
      }))
    : [];

  useEffect(() => {
    // Initialize manual scores with class students
    if (manualScores.length === 0 && classStudents.length > 0) {
      const initialScores = classStudents.map(student => ({
        ...student,
        test1: 0,
        test2: 0,
        exam: 0,
        total: 0,
        grade: 'F'
      }));
      setManualScores(initialScores);
    }
  }, [classStudents.length]);

  const generateTemplate = () => {
    const headers = [
      'Student ID',
      'Student Name',
      'Class',
      'Test 1 (Max: 20)',
      'Test 2 (Max: 20)',
      'Exam (Max: 60)',
      'Total',
      'Grade'
    ];

    const templateData = classStudents.map(student => [
      student.studentId,
      student.studentName,
      student.class,
      '', // Test 1 - empty for teacher to fill
      '', // Test 2 - empty for teacher to fill
      '', // Exam - empty for teacher to fill
      '', // Total - will be calculated
      ''  // Grade - will be calculated
    ]);

    const csvContent = [
      headers.join(','),
      ...templateData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user?.assignedSubject || user?.subject || 'subject'}_scores_template_${currentTerm?.name?.replace(/\s+/g, '_')}_${currentSession?.name?.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportCurrentScores = () => {
    const headers = [
      'Student ID',
      'Student Name',
      'Class',
      'Test 1 (Max: 20)',
      'Test 2 (Max: 20)',
      'Exam (Max: 60)',
      'Total',
      'Grade'
    ];

    const csvContent = [
      headers.join(','),
      ...manualScores.map(score => [
        score.studentId,
        score.studentName,
        score.class,
        score.test1,
        score.test2,
        score.exam,
        score.total,
        score.grade
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user?.assignedSubject || user?.subject || 'subject'}_scores_${currentTerm?.name?.replace(/\s+/g, '_')}_${currentSession?.name?.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportStatus('idle');
      setErrorMessage('');
    }
  };

  const calculateGrade = (total: number): string => {
    if (total >= 80) return 'A';
    if (total >= 70) return 'B';
    if (total >= 60) return 'C';
    if (total >= 50) return 'D';
    if (total >= 40) return 'E';
    return 'F';
  };

  const validateAndCalculateScores = (scores: any[]): StudentScore[] => {
    return scores.map(score => {
      const test1 = Math.max(0, Math.min(20, parseFloat(score.test1) || 0));
      const test2 = Math.max(0, Math.min(20, parseFloat(score.test2) || 0));
      const exam = Math.max(0, Math.min(60, parseFloat(score.exam) || 0));
      const total = test1 + test2 + exam;
      const grade = calculateGrade(total);

      return {
        studentId: score.studentId || score['Student ID'],
        studentName: score.studentName || score['Student Name'],
        class: score.class || score['Class'],
        test1,
        test2,
        exam,
        total,
        grade
      };
    });
  };

  const processImport = async () => {
    if (!selectedFile) return;

    setImportStatus('processing');
    setErrorMessage('');

    try {
      const text = await selectedFile.text();
      const rows = text.split('\n').map(row => row.split(','));
      
      if (rows.length < 2) {
        throw new Error('CSV file must have at least a header and one data row');
      }

      const headers = rows[0].map(h => h.trim().replace(/"/g, ''));
      const data = rows.slice(1).filter(row => row.some(cell => cell.trim())).map(row => {
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index]?.trim().replace(/"/g, '') || '';
        });
        return rowData;
      });

      const validatedScores = validateAndCalculateScores(data);
      setImportData(validatedScores);
      setImportStatus('success');
      
    } catch (error) {
      setImportStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Import failed');
    }
  };

  const confirmImport = () => {
    setManualScores(importData);
    setImportData([]);
    setSelectedFile(null);
    setImportStatus('idle');
  };

  const updateManualScore = (index: number, field: string, value: string) => {
    const updatedScores = [...manualScores];
    const numValue = parseFloat(value) || 0;
    
    // Validate ranges
    let validatedValue = numValue;
    if (field === 'test1' || field === 'test2') {
      validatedValue = Math.max(0, Math.min(20, numValue));
    } else if (field === 'exam') {
      validatedValue = Math.max(0, Math.min(60, numValue));
    }

    updatedScores[index] = {
      ...updatedScores[index],
      [field]: validatedValue
    };

    // Recalculate total and grade
    if (field === 'test1' || field === 'test2' || field === 'exam') {
      const total = updatedScores[index].test1 + updatedScores[index].test2 + updatedScores[index].exam;
      updatedScores[index].total = total;
      updatedScores[index].grade = calculateGrade(total);
    }

    setManualScores(updatedScores);
  };

  const submitResultsToAdmin = async () => {
    if (manualScores.some(score => score.test1 === 0 && score.test2 === 0 && score.exam === 0)) {
      if (!confirm('Some students have no scores entered. Do you want to continue?')) {
        return;
      }
    }

    setSubmissionStatus('submitting');

    try {
      // Calculate positions
      const sortedScores = [...manualScores].sort((a, b) => b.total - a.total);
      
      for (let i = 0; i < sortedScores.length; i++) {
        const score = sortedScores[i];
        const position = i + 1;

        // Create result using the context function
        createResult({
          studentId: score.studentId,
          studentName: score.studentName,
          class: score.class,
          subject: user?.assignedSubject || user?.subject || 'Unknown Subject',
          term: currentTerm?.name || 'First Term',
          session: currentSession?.name || '2024/2025',
          test1: score.test1,
          test2: score.test2,
          exam: score.exam,
          position,
          status: 'draft',
          submittedBy: user?.id || 'unknown'
        });
      }

      setSubmissionStatus('success');
      
      // Reset scores after successful submission
      setTimeout(() => {
        setSubmissionStatus('idle');
        // Reset manual scores
        const resetScores = classStudents.map(student => ({
          ...student,
          test1: 0,
          test2: 0,
          exam: 0,
          total: 0,
          grade: 'F'
        }));
        setManualScores(resetScores);
      }, 3000);

    } catch (error) {
      setSubmissionStatus('error');
      setErrorMessage('Failed to submit results. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'submitted': return <Clock className="h-4 w-4" />;
      case 'draft': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="import">Import Scores</TabsTrigger>
          <TabsTrigger value="submitted">Submitted Results</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Score Entry - {user?.assignedSubject || user?.subject}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {currentTerm?.name} • {currentSession?.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={exportCurrentScores}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    onClick={submitResultsToAdmin}
                    disabled={submissionStatus === 'submitting' || manualScores.length === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {submissionStatus === 'submitting' ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Results
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {submissionStatus === 'success' && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Results submitted successfully! Class supervisor can now review and approve.
                  </AlertDescription>
                </Alert>
              )}

              {manualScores.length === 0 ? (
                <div className="text-center py-8">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Students Found</h3>
                  <p className="text-muted-foreground">
                    No students are assigned to your classes. Please contact the admin.
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Test 1 (20)</TableHead>
                        <TableHead>Test 2 (20)</TableHead>
                        <TableHead>Exam (60)</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {manualScores.map((score, index) => (
                        <TableRow key={score.studentId}>
                          <TableCell className="font-medium">{score.studentId}</TableCell>
                          <TableCell>{score.studentName}</TableCell>
                          <TableCell>{score.class}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              value={score.test1}
                              onChange={(e) => updateManualScore(index, 'test1', e.target.value)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              value={score.test2}
                              onChange={(e) => updateManualScore(index, 'test2', e.target.value)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="60"
                              value={score.exam}
                              onChange={(e) => updateManualScore(index, 'exam', e.target.value)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell className="font-bold">{score.total}</TableCell>
                          <TableCell>
                            <Badge variant={score.grade === 'F' ? 'destructive' : 'default'}>
                              {score.grade}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Scores from CSV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={generateTemplate}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Download Template
                </Button>
                <div>
                  <Label htmlFor="csv-file">Select CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="mt-1"
                  />
                </div>
              </div>

              {selectedFile && (
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="text-sm">{selectedFile.name}</span>
                  <Badge variant="outline">{(selectedFile.size / 1024).toFixed(1)} KB</Badge>
                </div>
              )}

              <Button 
                onClick={processImport}
                disabled={!selectedFile || importStatus === 'processing'}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {importStatus === 'processing' ? 'Processing...' : 'Process Import'}
              </Button>

              {importStatus === 'success' && importData.length > 0 && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Successfully processed {importData.length} student records.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="border rounded-lg max-h-96 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Test 1</TableHead>
                          <TableHead>Test 2</TableHead>
                          <TableHead>Exam</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importData.map((student, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{student.studentId}</TableCell>
                            <TableCell>{student.studentName}</TableCell>
                            <TableCell>{student.class}</TableCell>
                            <TableCell>{student.test1}</TableCell>
                            <TableCell>{student.test2}</TableCell>
                            <TableCell>{student.exam}</TableCell>
                            <TableCell className="font-medium">{student.total}</TableCell>
                            <TableCell>
                              <Badge variant={student.grade === 'F' ? 'destructive' : 'default'}>
                                {student.grade}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setImportData([])}>
                      Cancel
                    </Button>
                    <Button onClick={confirmImport}>
                      Confirm Import
                    </Button>
                  </div>
                </div>
              )}

              {importStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submitted" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submitted Results</CardTitle>
            </CardHeader>
            <CardContent>
              {teacherResults.length === 0 ? (
                <div className="text-center py-8">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Results Submitted</h3>
                  <p className="text-muted-foreground">
                    Results you submit will appear here for tracking.
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Test 1</TableHead>
                        <TableHead>Test 2</TableHead>
                        <TableHead>Exam</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teacherResults.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{result.studentName}</div>
                              <div className="text-sm text-muted-foreground">{result.studentId}</div>
                            </div>
                          </TableCell>
                          <TableCell>{result.subject}</TableCell>
                          <TableCell>{result.test1}</TableCell>
                          <TableCell>{result.test2}</TableCell>
                          <TableCell>{result.exam}</TableCell>
                          <TableCell className="font-medium">{result.total}</TableCell>
                          <TableCell>
                            <Badge variant={result.grade === 'F' ? 'destructive' : 'default'}>
                              {result.grade}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(result.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(result.status)}
                                {result.status}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}