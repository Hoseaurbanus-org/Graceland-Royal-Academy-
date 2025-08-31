import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { 
  Printer,
  FileText,
  Download,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Users,
  GraduationCap,
  Calendar,
  Star,
  Award,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner@2.0.3';

interface PrintJob {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  session: string;
  term: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export function AdminResultPrintingSystem() {
  const { 
    user, 
    students, 
    classes, 
    subjects, 
    results, 
    currentSession, 
    currentTerm,
    getStudentsByClass,
    getResultsByStudent
  } = useAuth();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState(currentSession);
  const [selectedTerm, setSelectedTerm] = useState(currentTerm);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewStudent, setPreviewStudent] = useState<string | null>(null);

  // Load print jobs from localStorage
  useEffect(() => {
    const savedJobs = localStorage.getItem('gra_print_jobs');
    if (savedJobs) {
      try {
        setPrintJobs(JSON.parse(savedJobs));
      } catch (error) {
        console.error('Failed to load print jobs:', error);
      }
    }
  }, []);

  // Save print jobs to localStorage
  const savePrintJobs = (jobs: PrintJob[]) => {
    setPrintJobs(jobs);
    localStorage.setItem('gra_print_jobs', JSON.stringify(jobs));
  };

  // Get students for selected class
  const classStudents = selectedClass 
    ? (typeof getStudentsByClass === 'function' 
       ? getStudentsByClass(selectedClass) 
       : students.filter(s => s.class_id === selectedClass && s.is_active))
    : [];

  // Filter students based on search
  const filteredStudents = classStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if student has results for selected session/term
  const hasResults = (studentId: string) => {
    const studentResults = typeof getResultsByStudent === 'function'
      ? getResultsByStudent(studentId, selectedSession, selectedTerm)
      : results.filter(r => 
          r.student_id === studentId && 
          r.session === selectedSession && 
          r.term === selectedTerm &&
          r.status === 'approved'
        );
    return studentResults.length > 0;
  };

  // Calculate student's overall performance
  const getStudentPerformance = (studentId: string) => {
    const studentResults = typeof getResultsByStudent === 'function'
      ? getResultsByStudent(studentId, selectedSession, selectedTerm)
      : results.filter(r => 
          r.student_id === studentId && 
          r.session === selectedSession && 
          r.term === selectedTerm &&
          r.status === 'approved'
        );

    if (studentResults.length === 0) return { average: 0, grade: 'N/A', subjects: 0 };

    const totalPercentage = studentResults.reduce((sum, r) => sum + (r.percentage || 0), 0);
    const average = Math.round(totalPercentage / studentResults.length);
    const grade = calculateGrade(average);

    return {
      average,
      grade,
      subjects: studentResults.length
    };
  };

  const calculateGrade = (percentage: number): string => {
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    return 'F';
  };

  // Handle student selection
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Select all students
  const selectAllStudents = () => {
    const studentsWithResults = filteredStudents
      .filter(student => hasResults(student.id))
      .map(student => student.id);
    setSelectedStudents(studentsWithResults);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedStudents([]);
  };

  // Generate PDF for selected students
  const generatePDFResults = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setIsGenerating(true);
    try {
      const newJobs: PrintJob[] = selectedStudents.map(studentId => {
        const student = students.find(s => s.id === studentId);
        const className = classes.find(c => c.id === student?.class_id)?.name || 'Unknown';
        
        return {
          id: `job-${Date.now()}-${studentId}`,
          studentId,
          studentName: student?.name || 'Unknown',
          admissionNumber: student?.admission_number || 'N/A',
          className,
          session: selectedSession,
          term: selectedTerm,
          status: 'pending' as const,
          createdAt: new Date().toISOString()
        };
      });

      const updatedJobs = [...printJobs, ...newJobs];
      savePrintJobs(updatedJobs);

      // Simulate PDF generation process
      for (const job of newJobs) {
        // Update status to processing
        setTimeout(() => {
          const processingJobs = updatedJobs.map(j => 
            j.id === job.id ? { ...j, status: 'processing' as const } : j
          );
          savePrintJobs(processingJobs);
        }, 500);

        // Update status to completed
        setTimeout(() => {
          const completedJobs = updatedJobs.map(j => 
            j.id === job.id 
              ? { ...j, status: 'completed' as const, completedAt: new Date().toISOString() } 
              : j
          );
          savePrintJobs(completedJobs);
        }, 2000 + Math.random() * 1000);
      }

      toast.success(`PDF generation started for ${selectedStudents.length} student(s)`);
      setSelectedStudents([]);
      
    } catch (error) {
      toast.error('Failed to generate PDF results');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download completed PDF
  const downloadPDF = (job: PrintJob) => {
    // In a real implementation, this would download the actual PDF file
    const fileName = `${job.studentName}_${job.session}_${job.term}_Result.pdf`;
    toast.success(`Downloading ${fileName}`);
    
    // Simulate file download
    const link = document.createElement('a');
    link.href = '#'; // Would be actual file URL
    link.download = fileName;
    link.click();
  };

  // Preview student result
  const previewResult = (studentId: string) => {
    setPreviewStudent(studentId);
    // In a real implementation, this would show a preview modal
    toast.info('Result preview opened');
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'processing': return <Clock className="h-3 w-3" />;
      case 'failed': return <AlertTriangle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only administrators can access the result printing system.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Printer className="h-6 w-6" />
            Result PDF Printing System
          </h1>
          <p className="text-muted-foreground">Generate and manage PDF result printouts for students</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {printJobs.filter(j => j.status === 'completed').length} Generated
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {printJobs.filter(j => j.status === 'processing').length} Processing
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Selection Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Selection Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Class *</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.filter(c => c.is_active).map(classItem => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.name} - {classItem.level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Session</Label>
                  <Select value={selectedSession} onValueChange={setSelectedSession}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024/2025">2024/2025</SelectItem>
                      <SelectItem value="2023/2024">2023/2024</SelectItem>
                      <SelectItem value="2022/2023">2022/2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Term</Label>
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
              </div>
              
              <div className="mt-4">
                <Label>Search Students</Label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or admission number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student List */}
          {selectedClass && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Students ({filteredStudents.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllStudents}
                      disabled={filteredStudents.filter(s => hasResults(s.id)).length === 0}
                    >
                      Select All with Results
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                      disabled={selectedStudents.length === 0}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      onClick={generatePDFResults}
                      disabled={selectedStudents.length === 0 || isGenerating}
                      className="flex items-center gap-2"
                    >
                      <Printer className="h-4 w-4" />
                      Generate PDF ({selectedStudents.length})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              filteredStudents.filter(s => hasResults(s.id)).length > 0 &&
                              filteredStudents.filter(s => hasResults(s.id)).every(s => selectedStudents.includes(s.id))
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                selectAllStudents();
                              } else {
                                clearSelection();
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Admission No.</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => {
                        const performance = getStudentPerformance(student.id);
                        const studentHasResults = hasResults(student.id);
                        
                        return (
                          <TableRow key={student.id} className={!studentHasResults ? 'opacity-50' : ''}>
                            <TableCell>
                              <Checkbox
                                checked={selectedStudents.includes(student.id)}
                                onCheckedChange={() => toggleStudentSelection(student.id)}
                                disabled={!studentHasResults}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{student.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{student.admission_number}</TableCell>
                            <TableCell>
                              {studentHasResults ? (
                                <div className="flex items-center gap-2">
                                  <Badge className={`${performance.grade === 'A' ? 'bg-green-100 text-green-800' : 
                                    performance.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                    performance.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                    performance.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {performance.average}% ({performance.grade})
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {performance.subjects} subjects
                                  </span>
                                </div>
                              ) : (
                                <Badge variant="secondary">No Results</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {studentHasResults ? (
                                <Badge className="bg-green-50 text-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Ready
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => previewResult(student.id)}
                                disabled={!studentHasResults}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredStudents.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No students found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Print Jobs Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Print Jobs
              </CardTitle>
              <CardDescription>
                Track PDF generation progress and downloads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {printJobs.slice(0, 10).map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 border rounded-lg bg-card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{job.studentName}</p>
                        <p className="text-xs text-muted-foreground">{job.admissionNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.className} • {job.session} • {job.term}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`text-xs ${getJobStatusColor(job.status)}`}>
                          {getJobStatusIcon(job.status)}
                          <span className="ml-1 capitalize">{job.status}</span>
                        </Badge>
                        
                        {job.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadPDF(job)}
                            className="h-6 px-2 text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-muted-foreground">
                      Created: {new Date(job.createdAt).toLocaleString()}
                    </div>
                  </motion.div>
                ))}
                
                {printJobs.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-sm">No print jobs yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Print Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Generated</span>
                  <Badge variant="outline">
                    {printJobs.filter(j => j.status === 'completed').length}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <Badge variant="secondary">
                    {printJobs.filter(j => j.status === 'processing').length}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Failed</span>
                  <Badge variant="destructive">
                    {printJobs.filter(j => j.status === 'failed').length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}