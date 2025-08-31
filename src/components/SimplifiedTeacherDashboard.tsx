import { useState, useCallback } from 'react';
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
import { usePayment } from './payment/PaymentContext';
import { CalendarWidget } from './CalendarWidget';
import { PerformanceChart } from './PerformanceChart';
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
  Lock,
  Calendar
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
        exam?: number;
        total?: number;
        average?: number;
        grade?: string;
        rank?: number;
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

export function SimplifiedTeacherDashboard() {
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

  // Sample student data
  const [students, setStudents] = useState<StudentScore[]>([
    {
      id: 'GRA/2024/10A/001',
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
      id: 'GRA/2024/10A/002',
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
      id: 'GRA/2024/10A/003',
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
      id: 'GRA/2024/10A/004',
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
      id: 'GRA/2024/10A/005',
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
      id: 'GRA/2024/10A/006',
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
      id: 'GRA/2024/10A/007',
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
      id: 'GRA/2024/10A/008',
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
      id: 'GRA/2024/10A/009',
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
      id: 'GRA/2024/10A/010',
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

  // Calculation functions
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
    
    // Calculate rankings
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
          lastUpdated: new Date()
        };
      }
      return student;
    }));
    
    setTimeout(performCalculations, 300);
  }, [selectedSubject, sessionSettings.currentTerm, performCalculations]);

  // Single CSV Import for all students
  const handleCSVImport = useCallback(async (csvContent: string) => {
    setUploadProgress(0);
    
    try {
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const expectedHeaders = ['student_name', 'test1_score', 'test2_score', 'exam_score'];
      const hasValidHeaders = expectedHeaders.every(header => headers.includes(header));
      
      if (!hasValidHeaders) {
        throw new Error('Invalid CSV format. Expected: student_name,test1_score,test2_score,exam_score');
      }
      
      const subject = subjects.find(s => s.name === selectedSubject);
      if (!subject) throw new Error('Invalid subject selected');
      
      const updatedStudents = [...students];
      let updatedCount = 0;
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const rowData: any = {};
        
        headers.forEach((header, index) => {
          rowData[header] = values[index];
        });
        
        const studentIndex = updatedStudents.findIndex(s => 
          s.name.toLowerCase() === rowData.student_name.toLowerCase()
        );
        
        if (studentIndex !== -1) {
          const test1 = parseFloat(rowData.test1_score) || 0;
          const test2 = parseFloat(rowData.test2_score) || 0;
          const exam = parseFloat(rowData.exam_score) || 0;
          
          if (test1 > subject.maxScores.test1 || test2 > subject.maxScores.test2 || exam > subject.maxScores.exam) {
            throw new Error(`Invalid scores for ${rowData.student_name}`);
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
          updatedCount++;
        }
        
        setUploadProgress((i / (lines.length - 1)) * 100);
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      
      setStudents(updatedStudents);
      performCalculations();
      alert(`CSV imported successfully! Updated ${updatedCount} students.`);
      
    } catch (error) {
      alert('Error importing CSV: ' + error);
    } finally {
      setUploadProgress(0);
      setCsvData('');
    }
  }, [students, selectedSubject, sessionSettings.currentTerm, subjects, performCalculations]);

  // Single CSV Export for all students
  const handleCSVExport = useCallback(() => {
    const headers = 'student_name,test1_score,test2_score,exam_score';
    const rows = students.map(student => {
      const scores = student.scores[selectedSubject]?.[sessionSettings.currentTerm];
      return `${student.name},${scores?.test1 || ''},${scores?.test2 || ''},${scores?.exam || ''}`;
    });
    
    const csvContent = [headers, ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSubject}_${sessionSettings.currentTerm}_all_students.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [students, selectedSubject, sessionSettings.currentTerm]);

  // Generate sample CSV
  const generateSampleCSV = useCallback(() => {
    const headers = 'student_name,test1_score,test2_score,exam_score';
    const sampleRows = students.slice(0, 5).map(student => 
      `${student.name},18,17,52`
    );
    
    return [headers, ...sampleRows].join('\n');
  }, [students]);

  // Statistics
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
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
            Export All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
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
          <TabsTrigger value="import">Import/Export</TabsTrigger>
          <TabsTrigger value="calendar">School Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Score Input - {selectedSubject}</CardTitle>
                  <CardDescription>Input scores with automatic calculation</CardDescription>
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
                  <strong>Scoring:</strong> Test 1 (Max: 20), Test 2 (Max: 20), Exam (Max: 60). 
                  Total, Average, Grade, and Rank calculated automatically.
                </AlertDescription>
              </Alert>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Test 1<br/><span className="text-xs text-muted-foreground">(Max: 20)</span></TableHead>
                      <TableHead>Test 2<br/><span className="text-xs text-muted-foreground">(Max: 20)</span></TableHead>
                      <TableHead>Exam<br/><span className="text-xs text-muted-foreground">(Max: 60)</span></TableHead>
                      <TableHead>Total<br/><span className="text-xs text-muted-foreground">(Auto)</span></TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>Fee Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const scores = student.scores[selectedSubject]?.[sessionSettings.currentTerm] || {};
                      const hasAccess = canStudentAccessResults(student.id);
                      
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono text-xs">{student.id}</TableCell>
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
                            <Badge variant="outline">{scores.total || 0}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{scores.grade || '--'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={(scores.rank || 0) <= 3 ? 'default' : 'secondary'}>
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
              <CardTitle>CSV Import/Export</CardTitle>
              <CardDescription>Single CSV operation for all students in {selectedSubject}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>CSV Data (Format: student_name,test1_score,test2_score,exam_score)</Label>
                  <textarea
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    placeholder="Paste CSV data here or load sample..."
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
                    Import All Students
                  </Button>
                  <Button variant="outline" onClick={() => setCsvData(generateSampleCSV())}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Load Sample
                  </Button>
                  <Button variant="outline" onClick={handleCSVExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export All Students
                  </Button>
                </div>
                
                <Alert>
                  <AlertDescription>
                    <strong>Single CSV Operation:</strong> Import/export handles all students at once. 
                    CSV format excludes Total column - calculated automatically.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarWidget />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <PerformanceChart />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                  <CardDescription>{selectedSubject} - {sessionSettings.currentTerm}</CardDescription>
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
              
              <Card>
                <CardHeader>
                  <CardTitle>Class Statistics</CardTitle>
                  <CardDescription>Performance summary for {selectedSubject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Class Average:</span>
                      <Badge variant="outline">{stats.average}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Highest Score:</span>
                      <Badge variant="default">{stats.highest}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Lowest Score:</span>
                      <Badge variant="secondary">{stats.lowest}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Pass Rate:</span>
                      <Badge variant="outline">{stats.passRate}%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}