import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  CheckCircle, 
  Clock, 
  Eye, 
  FileText,
  Printer,
  AlertCircle,
  Users,
  BookOpen,
  Send,
  Download,
  Calendar
} from 'lucide-react';
import { useAuth } from '../AuthContext';

interface ResultSubmission {
  id: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  supervisorId: string;
  supervisorName: string;
  scores: Array<{
    studentId: string;
    studentName: string;
    test1: number;
    test2: number;
    exam: number;
    total: number;
    grade: string;
    position: number;
  }>;
  status: 'submitted' | 'approved' | 'printed';
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  term: string;
  session: string;
}

export function ResultApprovalSystem() {
  const { user, staff, subjects, classes } = useAuth();
  const [submissions, setSubmissions] = useState<ResultSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ResultSubmission | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = () => {
    const savedResults = localStorage.getItem('gra_results');
    if (savedResults) {
      const allResults = JSON.parse(savedResults);
      const submittedResults = allResults
        .filter((result: any) => result.status === 'submitted' || result.status === 'approved' || result.status === 'printed')
        .map((result: any) => ({
          ...result,
          term: 'First Term',
          session: '2024/2025'
        }));
      
      setSubmissions(submittedResults);
    }
  };

  const approveResult = (submissionId: string) => {
    const updatedSubmissions = submissions.map(submission => {
      if (submission.id === submissionId) {
        return {
          ...submission,
          status: 'approved' as const,
          approvedAt: new Date().toISOString(),
          approvedBy: user?.id
        };
      }
      return submission;
    });
    
    setSubmissions(updatedSubmissions);
    
    // Update in localStorage
    const savedResults = localStorage.getItem('gra_results');
    if (savedResults) {
      const allResults = JSON.parse(savedResults);
      const updatedResults = allResults.map((result: any) => {
        const submission = updatedSubmissions.find(s => 
          s.subjectId === result.subjectId && s.classId === result.classId
        );
        if (submission) {
          return {
            ...result,
            status: submission.status,
            approvedAt: submission.approvedAt,
            approvedBy: submission.approvedBy
          };
        }
        return result;
      });
      localStorage.setItem('gra_results', JSON.stringify(updatedResults));
    }
    
    alert('Result approved successfully! Students can now access their results after fee payment.');
  };

  const markAsPrinted = (submissionId: string) => {
    const updatedSubmissions = submissions.map(submission => {
      if (submission.id === submissionId) {
        return {
          ...submission,
          status: 'printed' as const
        };
      }
      return submission;
    });
    
    setSubmissions(updatedSubmissions);
    
    // Update in localStorage
    const savedResults = localStorage.getItem('gra_results');
    if (savedResults) {
      const allResults = JSON.parse(savedResults);
      const updatedResults = allResults.map((result: any) => {
        const submission = updatedSubmissions.find(s => 
          s.subjectId === result.subjectId && s.classId === result.classId
        );
        if (submission) {
          return {
            ...result,
            status: submission.status
          };
        }
        return result;
      });
      localStorage.setItem('gra_results', JSON.stringify(updatedResults));
    }
    
    alert('Result marked as printed!');
  };

  const printResultPDF = (submission: ResultSubmission) => {
    // In a real application, this would generate a PDF
    const pdfContent = `
      GRACELAND ROYAL ACADEMY
      STUDENT RESULT REPORT
      
      Subject: ${submission.subjectName}
      Class: ${submission.className}
      Term: ${submission.term}
      Session: ${submission.session}
      
      Students: ${submission.scores.length}
      
      TOP PERFORMERS:
      ${submission.scores
        .sort((a, b) => a.position - b.position)
        .slice(0, 3)
        .map(score => `${score.position}. ${score.studentName} - ${score.total}% (${score.grade})`)
        .join('\n')}
      
      Supervisor: ${submission.supervisorName}
      Approved by: Admin
      Date: ${new Date().toLocaleDateString()}
    `;
    
    alert('PDF Generated!\n\n' + pdfContent);
    markAsPrinted(submission.id);
  };

  const filteredSubmissions = submissions.filter(submission => {
    const statusMatch = filterStatus === 'all' || submission.status === filterStatus;
    const classMatch = filterClass === 'all' || submission.classId === filterClass;
    const subjectMatch = filterSubject === 'all' || submission.subjectId === filterSubject;
    
    return statusMatch && classMatch && subjectMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'submitted': return 'bg-yellow-500 text-black';
      case 'printed': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'submitted': return <Clock className="h-3 w-3" />;
      case 'printed': return <Printer className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'submitted').length;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;
  const printedCount = submissions.filter(s => s.status === 'printed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Result Approval System</h2>
          <p className="text-muted-foreground">Review and approve student results for publication</p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          <FileText className="h-4 w-4 mr-2" />
          {submissions.length} Total Submissions
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Require review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for printing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Printed</CardTitle>
            <Printer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{printedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {submissions.length > 0 ? Math.round((printedCount / submissions.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This term
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
          <TabsTrigger value="printed">Printed ({printedCount})</TabsTrigger>
          <TabsTrigger value="all">All Results</TabsTrigger>
        </TabsList>

        <div className="flex gap-4 mb-6">
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Approvals
              </CardTitle>
              <CardDescription>
                Results submitted by supervisors awaiting your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResultsTable 
                submissions={filteredSubmissions.filter(s => s.status === 'submitted')}
                onApprove={approveResult}
                onPreview={(submission) => {
                  setSelectedSubmission(submission);
                  setShowPreview(true);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Approved Results
              </CardTitle>
              <CardDescription>
                Results approved and ready for PDF printing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResultsTable 
                submissions={filteredSubmissions.filter(s => s.status === 'approved')}
                onPrint={printResultPDF}
                onPreview={(submission) => {
                  setSelectedSubmission(submission);
                  setShowPreview(true);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="printed">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Printed Results
              </CardTitle>
              <CardDescription>
                Completed results that have been printed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResultsTable 
                submissions={filteredSubmissions.filter(s => s.status === 'printed')}
                onPreview={(submission) => {
                  setSelectedSubmission(submission);
                  setShowPreview(true);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                All Results
              </CardTitle>
              <CardDescription>
                Complete overview of all result submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResultsTable 
                submissions={filteredSubmissions}
                onApprove={approveResult}
                onPrint={printResultPDF}
                onPreview={(submission) => {
                  setSelectedSubmission(submission);
                  setShowPreview(true);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Result Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Result Preview</DialogTitle>
            <DialogDescription>
              {selectedSubmission && `${selectedSubmission.subjectName} - ${selectedSubmission.className}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Subject:</strong> {selectedSubmission.subjectName}
                </div>
                <div>
                  <strong>Class:</strong> {selectedSubmission.className}
                </div>
                <div>
                  <strong>Supervisor:</strong> {selectedSubmission.supervisorName}
                </div>
                <div>
                  <strong>Students:</strong> {selectedSubmission.scores.length}
                </div>
                <div>
                  <strong>Submitted:</strong> {new Date(selectedSubmission.submittedAt).toLocaleDateString()}
                </div>
                <div>
                  <strong>Status:</strong>
                  <Badge className={`ml-2 ${getStatusColor(selectedSubmission.status)}`}>
                    {getStatusIcon(selectedSubmission.status)}
                    <span className="ml-1">{selectedSubmission.status.toUpperCase()}</span>
                  </Badge>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Test 1</TableHead>
                      <TableHead>Test 2</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSubmission.scores
                      .sort((a, b) => a.position - b.position)
                      .map((score, index) => (
                        <TableRow key={index}>
                          <TableCell>{score.position}</TableCell>
                          <TableCell className="font-medium">{score.studentName || `Student ${index + 1}`}</TableCell>
                          <TableCell>{score.test1}</TableCell>
                          <TableCell>{score.test2}</TableCell>
                          <TableCell>{score.exam}</TableCell>
                          <TableCell className="font-semibold">{score.total}</TableCell>
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

              <div className="flex justify-end gap-2">
                {selectedSubmission.status === 'submitted' && (
                  <Button onClick={() => {
                    approveResult(selectedSubmission.id);
                    setShowPreview(false);
                  }}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Result
                  </Button>
                )}
                
                {selectedSubmission.status === 'approved' && (
                  <Button onClick={() => {
                    printResultPDF(selectedSubmission);
                    setShowPreview(false);
                  }}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print PDF
                  </Button>
                )}
                
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ResultsTableProps {
  submissions: ResultSubmission[];
  onApprove?: (id: string) => void;
  onPrint?: (submission: ResultSubmission) => void;
  onPreview: (submission: ResultSubmission) => void;
}

function ResultsTable({ submissions, onApprove, onPrint, onPreview }: ResultsTableProps) {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No results found.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'submitted': return 'bg-yellow-500 text-black';
      case 'printed': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'submitted': return <Clock className="h-3 w-3" />;
      case 'printed': return <Printer className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject & Class</TableHead>
            <TableHead>Supervisor</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={`${submission.subjectId}_${submission.classId}`}>
              <TableCell>
                <div>
                  <div className="font-medium">{submission.subjectName}</div>
                  <div className="text-sm text-muted-foreground">{submission.className}</div>
                </div>
              </TableCell>
              <TableCell>{submission.supervisorName}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  {submission.scores.length}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(submission.submittedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(submission.status)}>
                  {getStatusIcon(submission.status)}
                  <span className="ml-1">{submission.status.toUpperCase()}</span>
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPreview(submission)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {submission.status === 'submitted' && onApprove && (
                    <Button
                      size="sm"
                      onClick={() => onApprove(submission.id)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  )}
                  
                  {submission.status === 'approved' && onPrint && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPrint(submission)}
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}