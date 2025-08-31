import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useAuth } from '../AuthContext';
import { useCalendar } from '../CalendarContext';

interface StudentScore {
  studentId: string;
  studentName: string;
  class: string;
  subject: string;
  test1: number;
  test2: number;
  exam: number;
  total: number;
  grade: string;
  position: number;
}

export function StudentImportExport() {
  const { user } = useAuth();
  const { currentTerm, currentSession } = useCalendar();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<StudentScore[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Sample data template
  const sampleData: StudentScore[] = [
    {
      studentId: 'gra25/pry/001',
      studentName: 'John Doe',
      class: 'Primary 1',
      subject: 'Mathematics',
      test1: 18,
      test2: 17,
      exam: 52,
      total: 87,
      grade: 'A',
      position: 1
    },
    {
      studentId: 'gra25/pry/002',
      studentName: 'Jane Smith',
      class: 'Primary 1',
      subject: 'Mathematics',
      test1: 16,
      test2: 15,
      exam: 48,
      total: 79,
      grade: 'B',
      position: 2
    },
    {
      studentId: 'gra25/pry/003',
      studentName: 'Mike Johnson',
      class: 'Primary 1',
      subject: 'Mathematics',
      test1: 14,
      test2: 16,
      exam: 45,
      total: 75,
      grade: 'B',
      position: 3
    }
  ];

  const generateTemplate = () => {
    const headers = [
      'Student ID',
      'Student Name',
      'Class',
      'Subject',
      'Test 1 (20%)',
      'Test 2 (20%)',
      'Exam (60%)',
      'Total',
      'Grade',
      'Position'
    ];

    const csvContent = [
      headers.join(','),
      ...sampleData.map(student => [
        student.studentId,
        student.studentName,
        student.class,
        student.subject,
        student.test1,
        student.test2,
        student.exam,
        student.total,
        student.grade,
        student.position
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `score_template_${currentTerm?.name?.replace(/\s+/g, '_')}_${currentSession?.name?.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportCurrentScores = () => {
    // Mock current scores - replace with actual data
    const currentScores = [
      {
        studentId: 'gra25/pry/001',
        studentName: 'John Doe',
        class: 'Primary 1',
        subject: user?.subject || 'Mathematics',
        test1: 18,
        test2: 17,
        exam: 52,
        total: 87,
        grade: 'A',
        position: 1
      },
      // Add more actual student scores here
    ];

    const headers = [
      'Student ID',
      'Student Name',
      'Class',
      'Subject',
      'Test 1 (20%)',
      'Test 2 (20%)',
      'Exam (60%)',
      'Total',
      'Grade',
      'Position'
    ];

    const csvContent = [
      headers.join(','),
      ...currentScores.map(student => [
        student.studentId,
        student.studentName,
        student.class,
        student.subject,
        student.test1,
        student.test2,
        student.exam,
        student.total,
        student.grade,
        student.position
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user?.subject || 'subject'}_scores_${currentTerm?.name?.replace(/\s+/g, '_')}_${currentSession?.name?.replace(/\s+/g, '_')}.csv`;
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

  const validateCSVData = (data: any[]): StudentScore[] => {
    const validatedData: StudentScore[] = [];
    const errors: string[] = [];

    data.forEach((row, index) => {
      if (index === 0) return; // Skip header row

      const [studentId, studentName, studentClass, subject, test1, test2, exam, total, grade, position] = row;

      // Validate required fields
      if (!studentId || !studentName || !studentClass || !subject) {
        errors.push(`Row ${index + 1}: Missing required fields`);
        return;
      }

      // Validate score ranges
      const test1Score = parseFloat(test1);
      const test2Score = parseFloat(test2);
      const examScore = parseFloat(exam);

      if (test1Score < 0 || test1Score > 20) {
        errors.push(`Row ${index + 1}: Test 1 score must be between 0 and 20`);
      }
      if (test2Score < 0 || test2Score > 20) {
        errors.push(`Row ${index + 1}: Test 2 score must be between 0 and 20`);
      }
      if (examScore < 0 || examScore > 60) {
        errors.push(`Row ${index + 1}: Exam score must be between 0 and 60`);
      }

      // Calculate total if not provided or validate if provided
      const calculatedTotal = test1Score + test2Score + examScore;
      const providedTotal = parseFloat(total);

      if (Math.abs(calculatedTotal - providedTotal) > 0.1) {
        errors.push(`Row ${index + 1}: Total score mismatch. Calculated: ${calculatedTotal}, Provided: ${providedTotal}`);
      }

      // Calculate grade
      const calculateGrade = (score: number): string => {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        if (score >= 50) return 'E';
        return 'F';
      };

      validatedData.push({
        studentId: studentId.trim(),
        studentName: studentName.trim(),
        class: studentClass.trim(),
        subject: subject.trim(),
        test1: test1Score,
        test2: test2Score,
        exam: examScore,
        total: calculatedTotal,
        grade: calculateGrade(calculatedTotal),
        position: parseInt(position) || 0
      });
    });

    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }

    // Sort by total score descending and assign positions
    validatedData.sort((a, b) => b.total - a.total);
    validatedData.forEach((student, index) => {
      student.position = index + 1;
    });

    return validatedData;
  };

  const processImport = async () => {
    if (!selectedFile) return;

    setImportStatus('processing');
    setErrorMessage('');

    try {
      const text = await selectedFile.text();
      const rows = text.split('\n').map(row => row.split(','));
      
      const validatedData = validateCSVData(rows);
      setImportData(validatedData);
      setImportStatus('success');
      
      // Here you would typically save the data to your backend
      console.log('Validated import data:', validatedData);
      
    } catch (error) {
      setImportStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Import failed');
    }
  };

  const confirmImport = () => {
    // Save the imported data
    console.log('Saving imported scores:', importData);
    setImportData([]);
    setSelectedFile(null);
    setImportStatus('idle');
    
    // Show success message or notification
    alert('Scores imported successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Scores
          </CardTitle>
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
            <Button 
              onClick={exportCurrentScores}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Current Scores
            </Button>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Use the template to maintain consistent formatting. The template includes sample data with the exact format required for import.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Scores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {selectedFile && (
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="text-sm">{selectedFile.name}</span>
              <Badge variant="outline">{(selectedFile.size / 1024).toFixed(1)} KB</Badge>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={processImport}
              disabled={!selectedFile || importStatus === 'processing'}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {importStatus === 'processing' ? 'Processing...' : 'Process Import'}
            </Button>
          </div>

          {/* Import Status */}
          {importStatus === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                File processed successfully! {importData.length} records ready for import.
              </AlertDescription>
            </Alert>
          )}

          {importStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Preview Import Data */}
          {importData.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Preview Import Data</h4>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setImportData([])}>
                    Cancel
                  </Button>
                  <Button onClick={confirmImport}>
                    Confirm Import
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Test 1</TableHead>
                      <TableHead>Test 2</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Position</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importData.map((student, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{student.studentId}</TableCell>
                        <TableCell>{student.studentName}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell>{student.subject}</TableCell>
                        <TableCell>{student.test1}</TableCell>
                        <TableCell>{student.test2}</TableCell>
                        <TableCell>{student.exam}</TableCell>
                        <TableCell className="font-medium">{student.total}</TableCell>
                        <TableCell>
                          <Badge variant={student.grade === 'F' ? 'destructive' : 'default'}>
                            {student.grade}
                          </Badge>
                        </TableCell>
                        <TableCell>{student.position}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Session Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Session:</span> {currentSession?.name}
            </div>
            <div>
              <span className="font-medium">Term:</span> {currentTerm?.name}
            </div>
            <div>
              <span className="font-medium">Subject:</span> {user?.subject || 'Not Set'}
            </div>
            <div>
              <span className="font-medium">Teacher:</span> {user?.name}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}