import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { useSession } from './SessionContext';
import { 
  Upload, 
  Download, 
  Save, 
  Calculator, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  Bell,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface StudentScore {
  id: string;
  name: string;
  rollNumber: string;
  scores: {
    [subject: string]: {
      [term: string]: {
        test1?: number;
        test2?: number;
        endOfTermExam?: number;
        termAverage?: number;
        grade?: string;
        position?: number;
      };
    };
  };
  errors: string[];
  lastUpdated: Date;
}

interface ValidationError {
  studentId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

interface CalculationResult {
  classAverage: number;
  rankings: { studentId: string; position: number; average: number }[];
  gradeDistribution: { [grade: string]: number };
  subjectAverages: { [subject: string]: number };
}

export function ResultCompilationSystem() {
  const { sessionSettings } = useSession();
  
  const [students, setStudents] = useState<StudentScore[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      rollNumber: '001',
      scores: {
        'Mathematics': {
          [sessionSettings.currentTerm]: { test1: 85, test2: 88, endOfTermExam: 87 }
        },
        'English': {
          [sessionSettings.currentTerm]: { test1: 88, test2: 85, endOfTermExam: 86 }
        },
        'Science': {
          [sessionSettings.currentTerm]: { test1: 82, test2: 85, endOfTermExam: 84 }
        }
      },
      errors: [],
      lastUpdated: new Date()
    },
    // Add more sample students...
  ]);

  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const subjects = ['Mathematics', 'English', 'Science'];

  // Real-time validation function
  const validateScore = useCallback((value: number, field: string): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    if (isNaN(value) || value < 0 || value > 100) {
      errors.push({
        studentId: '',
        field,
        message: `${field} must be between 0 and 100`,
        severity: 'error'
      });
    }
    
    if (value < 40) {
      errors.push({
        studentId: '',
        field,
        message: `${field} score is below pass mark (40)`,
        severity: 'warning'
      });
    }
    
    return errors;
  }, []);

  // Calculate weighted average: Test1 (20%) + Test2 (20%) + End of Term Exam (60%)
  const calculateTermAverage = useCallback((scores: any) => {
    const { test1, test2, endOfTermExam } = scores;
    
    if (test1 === undefined || test2 === undefined || endOfTermExam === undefined) {
      return 0;
    }
    
    return Math.round((test1 * 0.2 + test2 * 0.2 + endOfTermExam * 0.6) * 100) / 100;
  }, []);

  // Assign grade based on average
  const calculateGrade = useCallback((average: number): string => {
    if (average >= 90) return 'A';
    if (average >= 80) return 'B';
    if (average >= 70) return 'C';
    if (average >= 60) return 'D';
    if (average >= 40) return 'E';
    return 'F';
  }, []);

  // Automatic calculation engine
  const performCalculations = useCallback(async () => {
    setIsCalculating(true);
    
    // Simulate async calculation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedStudents = students.map(student => {
      const updatedScores = { ...student.scores };
      
      subjects.forEach(subject => {
        if (updatedScores[subject] && updatedScores[subject][sessionSettings.currentTerm]) {
          const termScores = updatedScores[subject][sessionSettings.currentTerm];
          const average = calculateTermAverage(termScores);
          const grade = calculateGrade(average);
          
          updatedScores[subject][sessionSettings.currentTerm] = {
            ...termScores,
            termAverage: average,
            grade
          };
        }
      });
      
      return { ...student, scores: updatedScores };
    });
    
    // Calculate class rankings
    const studentAverages = updatedStudents.map(student => {
      const subjectAverages = subjects.map(subject => {
        const termData = student.scores[subject]?.[sessionSettings.currentTerm];
        return termData?.termAverage || 0;
      });
      
      const overallAverage = subjectAverages.reduce((sum, avg) => sum + avg, 0) / subjects.length;
      
      return {
        studentId: student.id,
        average: Math.round(overallAverage * 100) / 100,
        position: 0
      };
    });
    
    // Sort and assign positions
    studentAverages.sort((a, b) => b.average - a.average);
    const rankings = studentAverages.map((student, index) => ({
      ...student,
      position: index + 1
    }));
    
    // Calculate class statistics
    const classAverage = rankings.reduce((sum, student) => sum + student.average, 0) / rankings.length;
    
    const gradeDistribution = rankings.reduce((dist, student) => {
      const grade = calculateGrade(student.average);
      dist[grade] = (dist[grade] || 0) + 1;
      return dist;
    }, {} as { [grade: string]: number });
    
    const subjectAverages = subjects.reduce((avgs, subject) => {
      const subjectTotal = updatedStudents.reduce((sum, student) => {
        const termData = student.scores[subject]?.[sessionSettings.currentTerm];
        return sum + (termData?.termAverage || 0);
      }, 0);
      
      avgs[subject] = Math.round((subjectTotal / updatedStudents.length) * 100) / 100;
      return avgs;
    }, {} as { [subject: string]: number });
    
    setCalculationResult({
      classAverage: Math.round(classAverage * 100) / 100,
      rankings,
      gradeDistribution,
      subjectAverages
    });
    
    setStudents(updatedStudents);
    setIsCalculating(false);
    
    // Trigger notifications
    triggerNotifications();
  }, [students, subjects, sessionSettings.currentTerm, calculateTermAverage, calculateGrade]);

  // Update score with real-time validation
  const updateScore = useCallback((studentId: string, subject: string, field: string, value: string) => {
    const numValue = parseFloat(value);
    const errors = validateScore(numValue, field);
    
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        const updatedScores = { ...student.scores };
        
        if (!updatedScores[subject]) {
          updatedScores[subject] = {};
        }
        
        if (!updatedScores[subject][sessionSettings.currentTerm]) {
          updatedScores[subject][sessionSettings.currentTerm] = {};
        }
        
        updatedScores[subject][sessionSettings.currentTerm] = {
          ...updatedScores[subject][sessionSettings.currentTerm],
          [field]: isNaN(numValue) ? undefined : numValue
        };
        
        return {
          ...student,
          scores: updatedScores,
          errors: errors.map(e => e.message),
          lastUpdated: new Date()
        };
      }
      return student;
    }));
    
    // Auto-calculate after score input
    setTimeout(performCalculations, 500);
  }, [sessionSettings.currentTerm, validateScore, performCalculations]);

  // CSV upload handler
  const handleCsvUpload = useCallback(async (csvContent: string) => {
    setUploadProgress(0);
    
    try {
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Validate CSV format
      const expectedHeaders = ['rollNumber', 'name', 'subject', 'test1', 'test2', 'endOfTermExam'];
      const hasValidHeaders = expectedHeaders.every(header => headers.includes(header));
      
      if (!hasValidHeaders) {
        throw new Error('Invalid CSV format. Expected headers: ' + expectedHeaders.join(', '));
      }
      
      const csvStudents: any[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const rowData: any = {};
        
        headers.forEach((header, index) => {
          rowData[header] = values[index];
        });
        
        csvStudents.push(rowData);
        setUploadProgress((i / (lines.length - 1)) * 100);
        
        // Simulate async processing
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Process CSV data and update students
      const updatedStudents = [...students];
      
      csvStudents.forEach(csvStudent => {
        let existingStudent = updatedStudents.find(s => s.rollNumber === csvStudent.rollNumber);
        
        if (!existingStudent) {
          existingStudent = {
            id: Date.now().toString() + csvStudent.rollNumber,
            name: csvStudent.name,
            rollNumber: csvStudent.rollNumber,
            scores: {},
            errors: [],
            lastUpdated: new Date()
          };
          updatedStudents.push(existingStudent);
        }
        
        if (!existingStudent.scores[csvStudent.subject]) {
          existingStudent.scores[csvStudent.subject] = {};
        }
        
        existingStudent.scores[csvStudent.subject][sessionSettings.currentTerm] = {
          test1: parseFloat(csvStudent.test1) || 0,
          test2: parseFloat(csvStudent.test2) || 0,
          endOfTermExam: parseFloat(csvStudent.endOfTermExam) || 0
        };
        
        existingStudent.lastUpdated = new Date();
      });
      
      setStudents(updatedStudents);
      performCalculations();
      
    } catch (error) {
      console.error('CSV upload error:', error);
      alert('Error processing CSV: ' + error);
    } finally {
      setUploadProgress(0);
    }
  }, [students, sessionSettings.currentTerm, performCalculations]);

  // Trigger notifications (mock implementation)
  const triggerNotifications = useCallback(() => {
    // In a real app, this would send notifications to parents/students
    console.log('Notifications sent to parents and students about new results');
    
    // Show toast notification
    if (typeof window !== 'undefined') {
      // Mock notification
      setTimeout(() => {
        alert('Results compiled successfully! Notifications sent to students and parents.');
      }, 1000);
    }
  }, []);

  // Generate report (mock implementation)
  const generateReport = useCallback((type: 'individual' | 'class' | 'summary') => {
    // In a real app, this would generate PDF reports
    console.log(`Generating ${type} report...`);
    alert(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully!`);
  }, []);

  // Auto-calculate on component mount
  useEffect(() => {
    performCalculations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Automated Result Compilation System</h2>
          <p className="text-muted-foreground">
            Real-time score processing for {sessionSettings.currentTerm} ({sessionSettings.academicYear})
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={performCalculations} disabled={isCalculating}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating ? 'Calculating...' : 'Recalculate'}
          </Button>
          <Button onClick={() => generateReport('class')}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Reports
          </Button>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {students.filter(s => s.errors.length === 0).length}
              </div>
              <p className="text-sm text-muted-foreground">Valid Records</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {students.filter(s => s.errors.length > 0).length}
              </div>
              <p className="text-sm text-muted-foreground">Records with Errors</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {calculationResult?.classAverage || 0}%
              </div>
              <p className="text-sm text-muted-foreground">Class Average</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {students.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="input" className="space-y-4">
        <TabsList>
          <TabsTrigger value="input">Score Input</TabsTrigger>
          <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Real-time Score Input</CardTitle>
                  <CardDescription>
                    Input scores with automatic validation and calculation
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  {subjects.map(subject => (
                    <Button
                      key={subject}
                      variant={selectedSubject === subject ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSubject(subject)}
                    >
                      {subject}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Test 1 (20%)</TableHead>
                      <TableHead>Test 2 (20%)</TableHead>
                      <TableHead>End Term Exam (60%)</TableHead>
                      <TableHead>Average</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const scores = student.scores[selectedSubject]?.[sessionSettings.currentTerm] || {};
                      const hasErrors = student.errors.length > 0;
                      
                      return (
                        <TableRow key={student.id} className={hasErrors ? 'bg-red-50' : ''}>
                          <TableCell>{student.rollNumber}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={scores.test1 || ''}
                              onChange={(e) => updateScore(student.id, selectedSubject, 'test1', e.target.value)}
                              className={`w-20 ${scores.test1 && (scores.test1 < 40) ? 'border-orange-400' : ''}`}
                              placeholder="--"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={scores.test2 || ''}
                              onChange={(e) => updateScore(student.id, selectedSubject, 'test2', e.target.value)}
                              className={`w-20 ${scores.test2 && (scores.test2 < 40) ? 'border-orange-400' : ''}`}
                              placeholder="--"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={scores.endOfTermExam || ''}
                              onChange={(e) => updateScore(student.id, selectedSubject, 'endOfTermExam', e.target.value)}
                              className={`w-20 ${scores.endOfTermExam && (scores.endOfTermExam < 40) ? 'border-orange-400' : ''}`}
                              placeholder="--"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              scores.termAverage >= 80 ? 'default' : 
                              scores.termAverage >= 70 ? 'secondary' : 
                              scores.termAverage >= 40 ? 'outline' : 'destructive'
                            }>
                              {scores.termAverage || 0}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {scores.grade || '--'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {hasErrors ? (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {validationErrors.length > 0 && (
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {validationErrors.length} validation error(s) found. Please review and correct the highlighted fields.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Bulk CSV Upload</CardTitle>
              <CardDescription>
                Upload student scores in bulk using CSV format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csvInput">CSV Data</Label>
                  <textarea
                    id="csvInput"
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    placeholder="rollNumber,name,subject,test1,test2,endOfTermExam&#10;001,Alice Johnson,Mathematics,85,88,87&#10;002,Bob Smith,Mathematics,92,89,91"
                    className="w-full h-32 p-3 border rounded-md resize-none font-mono text-sm"
                  />
                </div>
                
                {uploadProgress > 0 && (
                  <div>
                    <Label>Upload Progress</Label>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleCsvUpload(csvData)}
                    disabled={!csvData.trim() || uploadProgress > 0}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload CSV
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
                
                <Alert>
                  <AlertDescription>
                    <strong>CSV Format:</strong> Include columns: rollNumber, name, subject, test1, test2, endOfTermExam.
                    Scores should be numeric values between 0-100.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Performance Analytics</CardTitle>
                <CardDescription>Visual representation of class performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {calculationResult && (
                    <>
                      <div>
                        <h4 className="font-medium mb-2">Subject Averages</h4>
                        {Object.entries(calculationResult.subjectAverages).map(([subject, average]) => (
                          <div key={subject} className="flex justify-between items-center mb-2">
                            <span>{subject}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${average}%` }}
                                ></div>
                              </div>
                              <Badge>{average}%</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Grade Distribution</h4>
                        {Object.entries(calculationResult.gradeDistribution).map(([grade, count]) => (
                          <div key={grade} className="flex justify-between items-center mb-2">
                            <span>Grade {grade}</span>
                            <Badge variant="outline">{count} student{count !== 1 ? 's' : ''}</Badge>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Students ranked by overall performance</CardDescription>
              </CardHeader>
              <CardContent>
                {calculationResult && (
                  <div className="space-y-3">
                    {calculationResult.rankings.slice(0, 10).map((ranking, index) => {
                      const student = students.find(s => s.id === ranking.studentId);
                      return (
                        <div key={ranking.studentId} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            <Badge variant={index < 3 ? 'default' : 'outline'}>
                              #{ranking.position}
                            </Badge>
                            <span className="font-medium">{student?.name}</span>
                          </div>
                          <Badge>{ranking.average}%</Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Report Generation</CardTitle>
              <CardDescription>Generate various types of academic reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => generateReport('individual')}
                  className="h-20 flex flex-col"
                >
                  <FileText className="h-6 w-6 mb-2" />
                  Individual Report Cards
                </Button>
                <Button 
                  onClick={() => generateReport('class')}
                  className="h-20 flex flex-col"
                  variant="outline"
                >
                  <FileText className="h-6 w-6 mb-2" />
                  Class Summary Report
                </Button>
                <Button 
                  onClick={() => generateReport('summary')}
                  className="h-20 flex flex-col"
                  variant="outline"
                >
                  <FileText className="h-6 w-6 mb-2" />
                  Performance Analysis
                </Button>
              </div>
              
              <Alert className="mt-4">
                <Bell className="h-4 w-4" />
                <AlertDescription>
                  Reports are automatically generated and notifications are sent to students and parents when results are compiled.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}