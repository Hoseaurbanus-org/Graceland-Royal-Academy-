import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { motion } from 'motion/react';
import { 
  Printer, 
  Download, 
  FileText, 
  GraduationCap,
  Search,
  Award,
  Calendar,
  User,
  BookOpen,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNotifications } from '../NotificationContext';
import { toast } from 'sonner@2.0.3';

export function ResultPrintingSystem() {
  const { 
    user,
    students,
    classes,
    subjects,
    results,
    currentSession,
    currentTerm,
    generateResultPDF
  } = useAuth();
  
  const { addNotification } = useNotifications();
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(currentTerm);
  const [selectedSession, setSelectedSession] = useState(currentSession);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Filter students by selected class
  const classStudents = selectedClass 
    ? students.filter(s => s.class_id === selectedClass && s.is_active)
    : [];

  // Get results for selected student/term/session
  const getStudentResults = (studentId: string) => {
    return results.filter(r => 
      r.student_id === studentId &&
      r.term === selectedTerm &&
      r.session === selectedSession
    );
  };

  // Calculate student statistics
  const calculateStudentStats = (studentId: string) => {
    const studentResults = getStudentResults(studentId);
    if (studentResults.length === 0) return null;

    const totalMarks = studentResults.reduce((sum, r) => sum + r.total_score, 0);
    const averageScore = totalMarks / studentResults.length;
    const totalSubjects = studentResults.length;
    const passedSubjects = studentResults.filter(r => r.total_score >= 40).length;

    // Calculate grade
    let overallGrade = 'F';
    if (averageScore >= 80) overallGrade = 'A';
    else if (averageScore >= 70) overallGrade = 'B';
    else if (averageScore >= 60) overallGrade = 'C';
    else if (averageScore >= 50) overallGrade = 'D';
    else if (averageScore >= 40) overallGrade = 'E';

    return {
      totalMarks: Math.round(totalMarks),
      averageScore: Math.round(averageScore * 100) / 100,
      totalSubjects,
      passedSubjects,
      overallGrade,
      hasResults: studentResults.length > 0
    };
  };

  // Generate comprehensive result report
  const generateStudentReport = (student: any) => {
    const studentResults = getStudentResults(student.id);
    const stats = calculateStudentStats(student.id);
    const classInfo = classes.find(c => c.id === student.class_id);

    if (!stats || !stats.hasResults) {
      return null;
    }

    // Create detailed report data
    const reportData = {
      student: {
        name: student.name,
        admission_number: student.admission_number,
        photo_url: student.photo_url,
        class: classInfo?.name || 'Unknown Class',
        level: classInfo?.level || 'Unknown Level'
      },
      academic: {
        session: selectedSession,
        term: selectedTerm,
        results: studentResults.map(result => {
          const subject = subjects.find(s => s.id === result.subject_id);
          return {
            subject: subject?.name || 'Unknown Subject',
            code: subject?.code || 'UNK',
            test1: result.test1_score || 0,
            test2: result.test2_score || 0,
            exam: result.exam_score || 0,
            total: result.total_score,
            grade: result.grade,
            position: result.position || '-'
          };
        }).sort((a, b) => a.subject.localeCompare(b.subject))
      },
      statistics: stats,
      school: {
        name: 'Graceland Royal Academy',
        motto: 'WISDOM & ILLUMINATION',
        address: 'Excellence in Education',
        session: selectedSession,
        term: selectedTerm
      }
    };

    return reportData;
  };

  // Handle PDF generation and download
  const handleGeneratePDF = async (student: any) => {
    setGeneratingPDF(true);
    
    try {
      const reportData = generateStudentReport(student);
      
      if (!reportData) {
        toast.error('No results found for this student');
        return;
      }

      // Generate HTML content for PDF
      const htmlContent = generateResultHTML(reportData);
      
      // Create and download PDF
      const element = document.createElement('div');
      element.innerHTML = htmlContent;
      element.style.display = 'none';
      document.body.appendChild(element);

      // Use window.print for now (in production, you'd use a proper PDF library)
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
      }

      document.body.removeChild(element);

      toast.success(`Result report generated for ${student.name}`);
      addNotification({
        type: 'success',
        title: 'Result Report Generated',
        message: `PDF report for ${student.name} - ${selectedTerm} ${selectedSession} has been generated`,
        autoHide: true
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Generate HTML content for PDF
  const generateResultHTML = (data: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Student Result Report - ${data.student.name}</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            margin: 20px;
            color: #1e293b;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .school-name {
            font-size: 28px;
            font-weight: bold;
            color: #1e40af;
            margin: 0;
          }
          .school-motto {
            font-size: 14px;
            color: #f59e0b;
            font-style: italic;
            margin: 5px 0;
          }
          .report-title {
            font-size: 18px;
            font-weight: bold;
            margin: 15px 0 5px 0;
          }
          .student-info {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
            padding: 15px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
          }
          .student-photo {
            width: 120px;
            height: 150px;
            border: 2px solid #1e40af;
            object-fit: cover;
          }
          .student-details {
            flex: 1;
            margin-left: 20px;
          }
          .detail-row {
            margin: 8px 0;
          }
          .detail-label {
            font-weight: bold;
            display: inline-block;
            width: 150px;
          }
          .results-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .results-table th,
          .results-table td {
            border: 1px solid #1e40af;
            padding: 8px;
            text-align: center;
          }
          .results-table th {
            background: #1e40af;
            color: white;
            font-weight: bold;
          }
          .results-table tbody tr:nth-child(even) {
            background: #f8fafc;
          }
          .grade-a { background: #dcfce7; color: #166534; }
          .grade-b { background: #dbeafe; color: #1e40af; }
          .grade-c { background: #fef3c7; color: #a16207; }
          .grade-d { background: #fed7d7; color: #991b1b; }
          .grade-e { background: #fecaca; color: #991b1b; }
          .grade-f { background: #fee2e2; color: #dc2626; }
          .summary-section {
            margin: 30px 0;
            padding: 20px;
            background: #f8fafc;
            border: 2px solid #1e40af;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 15px 0;
          }
          .summary-item {
            text-align: center;
            padding: 10px;
            background: white;
            border: 1px solid #e2e8f0;
          }
          .summary-value {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
          }
          .summary-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
          }
          .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            border-top: 1px solid #000;
            margin: 30px 0 5px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
          }
          @media print {
            body { margin: 15px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="school-name">GRACELAND ROYAL ACADEMY</h1>
          <p class="school-motto">"WISDOM & ILLUMINATION"</p>
          <p class="report-title">STUDENT ACADEMIC REPORT</p>
          <p>${data.academic.term} - ${data.academic.session}</p>
        </div>

        <div class="student-info">
          <div>
            ${data.student.photo_url ? 
              `<img src="${data.student.photo_url}" alt="Student Photo" class="student-photo" />` : 
              `<div class="student-photo" style="display: flex; align-items: center; justify-content: center; background: #f1f5f9; color: #64748b;">No Photo</div>`
            }
          </div>
          <div class="student-details">
            <div class="detail-row">
              <span class="detail-label">Student Name:</span>
              <span>${data.student.name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Admission Number:</span>
              <span>${data.student.admission_number}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Class:</span>
              <span>${data.student.class}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Level:</span>
              <span>${data.student.level}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Academic Session:</span>
              <span>${data.academic.session}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Term:</span>
              <span>${data.academic.term}</span>
            </div>
          </div>
        </div>

        <table class="results-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Code</th>
              <th>Test 1<br/>(20%)</th>
              <th>Test 2<br/>(20%)</th>
              <th>Exam<br/>(60%)</th>
              <th>Total<br/>(100%)</th>
              <th>Grade</th>
              <th>Position</th>
            </tr>
          </thead>
          <tbody>
            ${data.academic.results.map((result: any) => `
              <tr>
                <td style="text-align: left;">${result.subject}</td>
                <td>${result.code}</td>
                <td>${result.test1}</td>
                <td>${result.test2}</td>
                <td>${result.exam}</td>
                <td><strong>${result.total}</strong></td>
                <td class="grade-${result.grade.toLowerCase()}"><strong>${result.grade}</strong></td>
                <td>${result.position}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary-section">
          <h3 style="text-align: center; margin-bottom: 20px; color: #1e40af;">ACADEMIC PERFORMANCE SUMMARY</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${data.statistics.totalSubjects}</div>
              <div class="summary-label">Total Subjects</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${data.statistics.passedSubjects}</div>
              <div class="summary-label">Subjects Passed</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${data.statistics.totalMarks}</div>
              <div class="summary-label">Total Marks</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${data.statistics.averageScore}%</div>
              <div class="summary-label">Average Score</div>
            </div>
            <div class="summary-item">
              <div class="summary-value grade-${data.statistics.overallGrade.toLowerCase()}">${data.statistics.overallGrade}</div>
              <div class="summary-label">Overall Grade</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${Math.round((data.statistics.passedSubjects / data.statistics.totalSubjects) * 100)}%</div>
              <div class="summary-label">Pass Rate</div>
            </div>
          </div>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <p>Class Teacher</p>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <p>Principal</p>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <p>Date</p>
          </div>
        </div>

        <div class="footer">
          <p>This report is computer generated and contains the official academic performance of the student.</p>
          <p>Generated on ${new Date().toLocaleDateString()} | Graceland Royal Academy - Excellence in Education</p>
        </div>
      </body>
      </html>
    `;
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
        <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-primary" />
            Student Result Printing System
          </CardTitle>
          <CardDescription>
            Generate and print comprehensive PDF result reports for individual students with all subjects and performance metrics
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium">Academic Session</label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                  <SelectItem value="2023/2024">2023/2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="mt-1">
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
              <label className="text-sm font-medium">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="mt-1">
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
              <label className="text-sm font-medium">Student (Optional)</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Students</SelectItem>
                  {classStudents.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.admission_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Statistics */}
          {selectedClass && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Students in Class</p>
                        <p className="text-2xl font-bold text-primary">{classStudents.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-primary" />
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
                        <p className="text-sm text-muted-foreground">With Results</p>
                        <p className="text-2xl font-bold text-primary">
                          {classStudents.filter(s => calculateStudentStats(s.id)?.hasResults).length}
                        </p>
                      </div>
                      <FileText className="h-8 w-8 text-primary" />
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
                        <p className="text-sm text-muted-foreground">Available Subjects</p>
                        <p className="text-2xl font-bold text-primary">{subjects.filter(s => s.is_active).length}</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-primary" />
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
                        <p className="text-sm text-muted-foreground">Class Average</p>
                        <p className="text-2xl font-bold text-primary">
                          {(() => {
                            const studentsWithResults = classStudents.filter(s => calculateStudentStats(s.id)?.hasResults);
                            if (studentsWithResults.length === 0) return '0%';
                            const totalAverage = studentsWithResults.reduce((sum, s) => {
                              const stats = calculateStudentStats(s.id);
                              return sum + (stats?.averageScore || 0);
                            }, 0);
                            return Math.round(totalAverage / studentsWithResults.length) + '%';
                          })()}
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Students Table */}
          {selectedClass ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Students in {classes.find(c => c.id === selectedClass)?.name}
                </h3>
                <div className="text-sm text-muted-foreground">
                  {selectedTerm} - {selectedSession}
                </div>
              </div>

              {classStudents.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No students found in this class</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Admission No.</TableHead>
                        <TableHead>Total Subjects</TableHead>
                        <TableHead>Average Score</TableHead>
                        <TableHead>Overall Grade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classStudents
                        .filter(student => !selectedStudent || student.id === selectedStudent)
                        .map((student, index) => {
                          const stats = calculateStudentStats(student.id);
                          return (
                            <motion.tr
                              key={student.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 * index }}
                              className="hover:bg-muted/50"
                            >
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarImage src={student.photo_url} alt={student.name} />
                                    <AvatarFallback className="text-xs">
                                      {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{student.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {student.date_of_birth ? `DOB: ${new Date(student.date_of_birth).toLocaleDateString()}` : ''}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono">
                                {student.admission_number}
                              </TableCell>
                              <TableCell>
                                {stats ? stats.totalSubjects : 0}
                              </TableCell>
                              <TableCell>
                                {stats ? `${stats.averageScore}%` : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {stats ? (
                                  <Badge variant={stats.overallGrade === 'F' ? 'destructive' : 'default'}>
                                    {stats.overallGrade}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">No Grade</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {stats?.hasResults ? (
                                  <Badge variant="default">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Results Available
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    No Results
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleGeneratePDF(student)}
                                    disabled={!stats?.hasResults || generatingPDF}
                                    className="flex items-center gap-2"
                                  >
                                    {generatingPDF ? (
                                      <>
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        Generating...
                                      </>
                                    ) : (
                                      <>
                                        <Download className="h-4 w-4" />
                                        Print PDF
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Select a class to view students</p>
              <p className="text-sm text-muted-foreground">
                Choose a class from the dropdown above to see students and generate their result reports
              </p>
            </div>
          )}

          {/* Help Information */}
          <Alert className="mt-6">
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <strong>PDF Report Features:</strong> Each report includes student photo, complete subject breakdown with Test 1 (20%), Test 2 (20%), and Exam (60%) scores, overall statistics, grade calculations, and official school formatting suitable for printing and distribution.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}