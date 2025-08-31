import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { useSession } from './SessionContext';
import { usePayment } from './payment/PaymentContext';
import { PerformanceChart } from './PerformanceChart';
import { StudentImportExport } from './teacher/StudentImportExport';
import { 
  Users, 
  Calculator,
  Save,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  FileSpreadsheet,
  TrendingUp,
  Award,
  Lock
} from 'lucide-react';

interface StudentScore {
  id: string;
  name: string;
  rollNumber: string;
  scores: {
    [subject: string]: {
      [term: string]: {
        test1?: number;  // Max 20
        test2?: number;  // Max 20
        exam?: number;   // Max 60
        total?: number;  // Calculated: test1 + test2 + exam
        average?: number; // Calculated: total / 3
        grade?: string;  // Calculated based on average
        rank?: number;   // Calculated based on total in class
      };
    };
  };
  errors: string[];
  lastUpdated: Date;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  maxScores: {
    test1: number;
    test2: number;
    exam: number;
  };
}

export function EnhancedTeacherDashboard() {
  const { sessionSettings } = useSession();
  const { canStudentAccessResults, paymentData } = usePayment();
  
  const [subjects] = useState<Subject[]>([
    { 
      id: '1', 
      name: 'Mathematics', 
      code: 'MATH',
      maxScores: { test1: 20, test2: 20, exam: 60 }
    },
    { 
      id: '2', 
      name: 'English Language', 
      code: 'ENG',
      maxScores: { test1: 20, test2: 20, exam: 60 }
    },
    { 
      id: '3', 
      name: 'Science', 
      code: 'SCI',
      maxScores: { test1: 20, test2: 20, exam: 60 }
    },
  ]);

  // Sample student data with the 10 students from requirements
  const [students, setStudents] = useState<StudentScore[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      rollNumber: '001',
      scores: {
        'Mathematics': {
          [sessionSettings.currentTerm]: { test1: 18, test2: 17, exam: 52 }
        },
        'English Language': {
          [sessionSettings.currentTerm]: { test1: 17, test2: 18, exam: 51 }
        },
        'Science': {
          [sessionSettings.currentTerm]: { test1: 16, test2: 17, exam: 50 }
        }
      },
      errors: [],
      lastUpdated: new Date()
    },
    {
      id: '2',
      name: 'Bob Smith',
      rollNumber: '002',
      scores: {
        'Mathematics': {
          [sessionSettings.currentTerm]: { test1: 19, test2: 18, exam: 54 }
        },
        'English Language': {
          [sessionSettings.currentTerm]: { test1: 15, test2: 16, exam: 48 }
        },
        'Science': {
          [sessionSettings.currentTerm]: { test1: 17, test2: 18, exam: 51 }
        }
      },
      errors: [],
      lastUpdated: new Date()
    },
    {
      id: '3',
      name: 'Carol Davis',
      rollNumber: '003',
      scores: {
        'Mathematics': {
          [sessionSettings.currentTerm]: { test1: 16, test2: 16, exam: 48 }
        },
        'English Language': {
          [sessionSettings.currentTerm]: { test1: 17, test2: 18, exam: 53 }
        },
        'Science': {
          [sessionSettings.currentTerm]: { test1: 18, test2: 18, exam: 53 }
        }
      },
      errors: [],
      lastUpdated: new Date()
    },
    {
      id: '4',
      name: 'David Wilson',
      rollNumber: '004',
      scores: {
        'Mathematics': {
          [sessionSettings.currentTerm]: { test1: 17, test2: 17, exam: 52 }
        },
        'English Language': {
          [sessionSettings.currentTerm]: { test1: 18, test2: 18, exam: 55 }
        },
        'Science': {
          [sessionSettings.currentTerm]: { test1: 17, test2: 18, exam: 53 }
        }
      },
      errors: [],
      lastUpdated: new Date()
    },
    {
      id: '5',
      name: 'Emma Brown',
      rollNumber: '005',
      scores: {
        'Mathematics': {
          [sessionSettings.currentTerm]: { test1: 19, test2: 18, exam: 57 }
        },
        'English Language': {
          [sessionSettings.currentTerm]: { test1: 18, test2: 18, exam: 54 }
        },
        'Science': {
          [sessionSettings.currentTerm]: { test1: 19, test2: 19, exam: 56 }
        }
      },
      errors: [],
      lastUpdated: new Date()
    },
    {
      id: '6',
      name: 'Frank Miller',
      rollNumber: '006',
      scores: {
        'Mathematics': {
          [sessionSettings.currentTerm]: { test1: 16, test2: 17, exam: 49 }
        },
        'English Language': {
          [sessionSettings.currentTerm]: { test1: 17, test2: 17, exam: 51 }
        },
        'Science': {
          [sessionSettings.currentTerm]: { test1: 16, test2: 17, exam: 50 }
        }
      },
      errors: [],
      lastUpdated: new Date()
    },
    {
      id: '7',
      name: 'Grace Lee',
      rollNumber: '007',
      scores: {
        'Mathematics': {
          [sessionSettings.currentTerm]: { test1: 18, test2: 17, exam: 53 }
        },
        'English Language': {
          [sessionSettings.currentTerm]: { test1: 17, test2: 17, exam: 52 }
        },
        'Science': {
          [sessionSettings.currentTerm]: { test1: 18, test2: 18, exam: 54 }
        }
      },
      errors: [],
      lastUpdated: new Date()
    },
    {
      id: '8',
      name: 'Henry Taylor',
      rollNumber: '008',
      scores: {
        'Mathematics': {
          [sessionSettings.currentTerm]: { test1: 17, test2: 17, exam: 51 }
        },
        'English Language': {
          [sessionSettings.currentTerm]: { test1: 16, test2: 17, exam: 50 }
        },
        'Science': {
          [sessionSettings.currentTerm]: { test1: 17, test2: 17, exam: 52 }
        }
      },
      errors: [],
      lastUpdated: new Date()
    },
    {
      id: '9',
      name: 'Ivy Chen',
      rollNumber: '009',
      scores: {
        'Mathematics': {
          [sessionSettings.currentTerm]: { test1: 18, test2: 18, exam: 56 }
        },
        'English Language': {
          [sessionSettings.currentTerm]: { test1: 18, test2: 17, exam: 53 }
        },
        'Science': {
          [sessionSettings.currentTerm]: { test1: 18, test2: 19, exam: 55 }
        }
      },
      errors: [],
      lastUpdated: new Date()
    },
    {
      id: '10',
      name: 'Jack Brown',
      rollNumber: '010',
      scores: {
        'Mathematics': {
          [sessionSettings.currentTerm]: { test1: 18, test2: 18, exam: 53 }
        },
        'English Language': {
          [sessionSettings.currentTerm]: { test1: 18, test2: 18, exam: 56 }
        },
        'Science': {
          [sessionSettings.currentTerm]: { test1: 17, test2: 18, exam: 53 }
        }
      },
      errors: [],
      lastUpdated: new Date()
    }
  ]);

  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [csvData, setCsvData] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // Validation functions
  const validateScore = useCallback((value: number, field: string, maxScore: number) => {
    const errors: string[] = [];
    
    if (isNaN(value) || value < 0 || value > maxScore) {
      errors.push(`${field} must be between 0 and ${maxScore}`);
    }
    
    return errors;
  }, []);

  // Automatic calculation functions
  const calculateTotal = useCallback((test1: number, test2: number, exam: number) => {
    if (isNaN(test1) || isNaN(test2) || isNaN(exam)) return 0;
    return test1 + test2 + exam;
  }, []);

  const calculateAverage = useCallback((total: number) => {
    return Math.round((total / 3) * 100) / 100;
  }, []);

  const calculateGrade = useCallback((average: number): string => {
    if (average >= 80) return 'A';
    if (average >= 70) return 'B';
    if (average >= 60) return 'C';
    if (average >= 50) return 'D';
    return 'F';
  }, []);

  // Perform automatic calculations
  const performCalculations = useCallback(async () => {
    setIsCalculating(true);
    
    // Simulate async calculation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedStudents = students.map(student => {
      const updatedScores = { ...student.scores };
      
      if (updatedScores[selectedSubject] && updatedScores[selectedSubject][sessionSettings.currentTerm]) {
        const termScores = updatedScores[selectedSubject][sessionSettings.currentTerm];
        
        const test1 = termScores.test1 || 0;
        const test2 = termScores.test2 || 0;
        const exam = termScores.exam || 0;
        
        const total = calculateTotal(test1, test2, exam);
        const average = calculateAverage(total);
        const grade = calculateGrade(average);
        
        updatedScores[selectedSubject][sessionSettings.currentTerm] = {
          ...termScores,
          total,
          average,
          grade
        };
      }
      
      return { ...student, scores: updatedScores };
    });
    
    // Calculate rankings based on total scores
    const studentsWithTotals = updatedStudents.map(student => ({
      id: student.id,
      total: student.scores[selectedSubject]?.[sessionSettings.currentTerm]?.total || 0
    }));
    
    studentsWithTotals.sort((a, b) => b.total - a.total);
    
    const finalStudents = updatedStudents.map(student => {
      const rank = studentsWithTotals.findIndex(s => s.id === student.id) + 1;
      
      if (student.scores[selectedSubject] && student.scores[selectedSubject][sessionSettings.currentTerm]) {
        student.scores[selectedSubject][sessionSettings.currentTerm].rank = rank;
      }
      
      return student;
    });
    
    setStudents(finalStudents);
    setIsCalculating(false);
  }, [students, selectedSubject, sessionSettings.currentTerm, calculateTotal, calculateAverage, calculateGrade]);

  // Update individual score
  const updateScore = useCallback((studentId: string, field: 'test1' | 'test2' | 'exam', value: string) => {
    const numValue = parseFloat(value);
    const subject = subjects.find(s => s.name === selectedSubject);
    const maxScore = subject?.maxScores[field] || 100;
    
    const errors = validateScore(numValue, field, maxScore);
    
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        const updatedScores = { ...student.scores };
        
        if (!updatedScores[selectedSubject]) {
          updatedScores[selectedSubject] = {};
        }
        
        if (!updatedScores[selectedSubject][sessionSettings.currentTerm]) {
          updatedScores[selectedSubject][sessionSettings.currentTerm] = {};
        }
        
        updatedScores[selectedSubject][sessionSettings.currentTerm] = {
          ...updatedScores[selectedSubject][sessionSettings.currentTerm],
          [field]: isNaN(numValue) ? undefined : numValue
        };
        
        return {
          ...student,
          scores: updatedScores,
          errors,
          lastUpdated: new Date()
        };
      }
      return student;
    }));
    
    // Auto-calculate after score input
    setTimeout(performCalculations, 300);
  }, [selectedSubject, sessionSettings.currentTerm, subjects, validateScore, performCalculations]);

  // CSV Import (without Total column)
  const handleCSVImport = useCallback(async (csvContent: string) => {
    setUploadProgress(0);
    
    try {
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Expected format: student_name,test1_score,test2_score,exam_score (NO total column)
      const expectedHeaders = ['student_name', 'test1_score', 'test2_score', 'exam_score'];
      const hasValidHeaders = expectedHeaders.every(header => headers.includes(header));
      
      if (!hasValidHeaders) {
        throw new Error('Invalid CSV format. Expected: student_name,test1_score,test2_score,exam_score');
      }
      
      const subject = subjects.find(s => s.name === selectedSubject);
      if (!subject) throw new Error('Invalid subject selected');
      
      const updatedStudents = [...students];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const rowData: any = {};
        
        headers.forEach((header, index) => {
          rowData[header] = values[index];
        });
        
        // Find student by name
        const studentIndex = updatedStudents.findIndex(s => 
          s.name.toLowerCase() === rowData.student_name.toLowerCase()
        );
        
        if (studentIndex !== -1) {
          const test1 = parseFloat(rowData.test1_score) || 0;
          const test2 = parseFloat(rowData.test2_score) || 0;
          const exam = parseFloat(rowData.exam_score) || 0;
          
          // Validate scores against max values
          if (test1 > subject.maxScores.test1 || test2 > subject.maxScores.test2 || exam > subject.maxScores.exam) {
            throw new Error(`Invalid scores for ${rowData.student_name}. Max values: Test1=${subject.maxScores.test1}, Test2=${subject.maxScores.test2}, Exam=${subject.maxScores.exam}`);
          }
          
          if (!updatedStudents[studentIndex].scores[selectedSubject]) {
            updatedStudents[studentIndex].scores[selectedSubject] = {};
          }
          
          updatedStudents[studentIndex].scores[selectedSubject][sessionSettings.currentTerm] = {
            test1,
            test2,
            exam
          };
          
          updatedStudents[studentIndex].lastUpdated = new Date();
        }
        
        setUploadProgress((i / (lines.length - 1)) * 100);
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      
      setStudents(updatedStudents);
      performCalculations();
      alert('CSV imported successfully! Totals and grades calculated automatically.');
      
    } catch (error) {
      alert('Error importing CSV: ' + error);
    } finally {
      setUploadProgress(0);
      setCsvData('');
    }
  }, [students, selectedSubject, sessionSettings.currentTerm, subjects, performCalculations]);

  // CSV Export (without Total column)
  const handleCSVExport = useCallback(() => {
    const headers = 'student_name,test1_score,test2_score,exam_score';
    const rows = students.map(student => {
      const scores = student.scores[selectedSubject]?.[sessionSettings.currentTerm];
      return `${student.name},${scores?.test1 || ''},${scores?.test2 || ''},${scores?.exam || ''}`;
    });
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSubject}_${sessionSettings.currentTerm}_scores.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [students, selectedSubject, sessionSettings.currentTerm]);

  // Generate sample CSV for import
  const generateSampleCSV = useCallback(() => {
    const subject = subjects.find(s => s.name === selectedSubject);
    if (!subject) return '';
    
    const headers = 'student_name,test1_score,test2_score,exam_score';
    const sampleRows = students.slice(0, 3).map(student => 
      `${student.name},${Math.floor(Math.random() * subject.maxScores.test1)},${Math.floor(Math.random() * subject.maxScores.test2)},${Math.floor(Math.random() * subject.maxScores.exam)}`
    );
    
    return [headers, ...sampleRows].join('\n');
  }, [students, selectedSubject, subjects]);

  // Calculate class statistics
  const classStats = useCallback(() => {
    const subjectStudents = students.filter(s => 
      s.scores[selectedSubject]?.[sessionSettings.currentTerm]?.total !== undefined
    );
    
    if (subjectStudents.length === 0) return { average: 0, highest: 0, lowest: 0, passRate: 0 };
    
    const totals = subjectStudents.map(s => s.scores[selectedSubject][sessionSettings.currentTerm].total!);
    const average = totals.reduce((sum, total) => sum + total, 0) / totals.length;
    const highest = Math.max(...totals);
    const lowest = Math.min(...totals);
    const passed = totals.filter(total => (total / 3) >= 50).length;
    const passRate = (passed / totals.length) * 100;
    
    return {
      average: Math.round(average * 100) / 100,
      highest,
      lowest,
      passRate: Math.round(passRate * 100) / 100
    };
  }, [students, selectedSubject, sessionSettings.currentTerm]);

  const stats = classStats();

  // Check payment status for results access
  const getStudentPaymentStatus = (studentId: string) => {
    return canStudentAccessResults(studentId);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Grade 10A - Score Management for {sessionSettings.currentTerm} ({sessionSettings.academicYear})
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={performCalculations} disabled={isCalculating}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating ? 'Calculating...' : 'Recalculate'}
          </Button>
          <Button onClick={handleCSVExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Average</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.average}</div>
            <p className="text-xs text-muted-foreground">Out of 100 total points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highest}</div>
            <p className="text-xs text-muted-foreground">Best performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <Award className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.passRate}%</div>
            <p className="text-xs text-muted-foreground">Students above 50%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Status</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentData.filter(p => p.status === 'cleared').length}/{students.length}
            </div>
            <p className="text-xs text-muted-foreground">Paid / Total students</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="input" className="space-y-4">
        <TabsList>
          <TabsTrigger value="input">Score Input</TabsTrigger>
          <TabsTrigger value="import">CSV Import</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Score Input - {selectedSubject}</CardTitle>
                  <CardDescription>
                    Input scores with automatic calculation and per-student import/export
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  {subjects.map(subject => (
                    <Button
                      key={subject.id}
                      variant={selectedSubject === subject.name ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSubject(subject.name)}
                    >
                      {subject.code}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Scoring System:</strong> Test 1 (Max: 20), Test 2 (Max: 20), Exam (Max: 60). 
                  Total, Average, Grade, and Rank are calculated automatically.
                </AlertDescription>
              </Alert>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Test 1<br/><span className="text-xs text-muted-foreground">(Max: 20)</span></TableHead>
                      <TableHead>Test 2<br/><span className="text-xs text-muted-foreground">(Max: 20)</span></TableHead>
                      <TableHead>Exam<br/><span className="text-xs text-muted-foreground">(Max: 60)</span></TableHead>
                      <TableHead>Total<br/><span className="text-xs text-muted-foreground">(Auto)</span></TableHead>
                      <TableHead>Grade<br/><span className="text-xs text-muted-foreground">(Auto)</span></TableHead>
                      <TableHead>Rank<br/><span className="text-xs text-muted-foreground">(Auto)</span></TableHead>
                      <TableHead>Fee Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const scores = student.scores[selectedSubject]?.[sessionSettings.currentTerm] || {};
                      const hasErrors = student.errors.length > 0;
                      const hasAccess = getStudentPaymentStatus(student.id);
                      
                      return (
                        <TableRow key={student.id} className={hasErrors ? 'bg-red-50' : ''}>
                          <TableCell>{student.rollNumber}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              value={scores.test1 || ''}
                              onChange={(e) => updateScore(student.id, 'test1', e.target.value)}
                              className="w-16"
                              placeholder="--"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              value={scores.test2 || ''}
                              onChange={(e) => updateScore(student.id, 'test2', e.target.value)}
                              className="w-16"
                              placeholder="--"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="60"
                              value={scores.exam || ''}
                              onChange={(e) => updateScore(student.id, 'exam', e.target.value)}
                              className="w-16"
                              placeholder="--"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {scores.total || 0}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {scores.grade || '--'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              (scores.rank || 0) <= 3 ? 'default' : 'secondary'
                            }>
                              #{scores.rank || '--'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {hasAccess ? (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Paid
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">
                                <Lock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <StudentImportExport
                              student={student}
                              subject={selectedSubject}
                              term={sessionSettings.currentTerm}
                              onScoreUpdate={updateScore}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Bulk CSV Import/Export</CardTitle>
              <CardDescription>
                Import scores via CSV (excluding Total column) or export current data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>CSV Data (Format: student_name,test1_score,test2_score,exam_score)</Label>
                  <textarea
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    placeholder="student_name,test1_score,test2_score,exam_score&#10;Alice Johnson,18,17,52&#10;Bob Smith,19,18,54"
                    className="w-full h-32 p-3 border rounded-md resize-none font-mono text-sm"
                  />
                </div>
                
                {uploadProgress > 0 && (
                  <div>
                    <Label>Import Progress</Label>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleCSVImport(csvData)}
                    disabled={!csvData.trim() || uploadProgress > 0}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>
                  <Button variant="outline" onClick={() => setCsvData(generateSampleCSV())}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Load Sample
                  </Button>
                  <Button variant="outline" onClick={handleCSVExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                
                <Alert>
                  <AlertDescription>
                    <strong>Important:</strong> CSV import/export excludes the Total column. 
                    Totals, averages, grades, and ranks are calculated automatically upon import.
                    Use per-student import/export buttons in the score input table for individual student management.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <PerformanceChart />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Status Overview</CardTitle>
                  <CardDescription>Student fee payment status affecting result access</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {students.map(student => {
                      const hasAccess = getStudentPaymentStatus(student.id);
                      const paymentInfo = paymentData.find(p => p.studentId === student.id);
                      
                      return (
                        <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Roll: {student.rollNumber}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={hasAccess ? 'default' : 'destructive'}>
                              {hasAccess ? 'Paid' : 'Pending'}
                            </Badge>
                            {paymentInfo && (
                              <span className="text-sm text-muted-foreground">
                                ₦{paymentInfo.totalPaid.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                  <CardDescription>Student performance by grade - {selectedSubject}</CardDescription>
                </CardHeader>
                <CardContent>
                  {['A', 'B', 'C', 'D', 'F'].map(grade => {
                    const count = students.filter(s => 
                      s.scores[selectedSubject]?.[sessionSettings.currentTerm]?.grade === grade
                    ).length;
                    
                    return (
                      <div key={grade} className="flex justify-between items-center mb-2">
                        <span>Grade {grade}</span>
                        <Badge variant={grade === 'A' ? 'default' : grade === 'F' ? 'destructive' : 'outline'}>
                          {count} student{count !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rankings">
          <Card>
            <CardHeader>
              <CardTitle>Class Rankings - {selectedSubject}</CardTitle>
              <CardDescription>Students ranked by total score (automatically calculated)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students
                  .filter(s => s.scores[selectedSubject]?.[sessionSettings.currentTerm]?.total)
                  .sort((a, b) => (b.scores[selectedSubject][sessionSettings.currentTerm].total || 0) - 
                                  (a.scores[selectedSubject][sessionSettings.currentTerm].total || 0))
                  .map((student, index) => {
                    const scores = student.scores[selectedSubject][sessionSettings.currentTerm];
                    const hasAccess = getStudentPaymentStatus(student.id);
                    
                    return (
                      <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant={index < 3 ? 'default' : 'outline'} className="w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div>
                            <span className="font-medium">{student.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">({student.rollNumber})</span>
                            {!hasAccess && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                <Lock className="h-3 w-3 mr-1" />
                                No Access
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-medium">Total: {scores.total}</div>
                            <div className="text-sm text-muted-foreground">
                              T1: {scores.test1}, T2: {scores.test2}, Exam: {scores.exam}
                            </div>
                          </div>
                          <Badge variant="outline">Grade {scores.grade}</Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}