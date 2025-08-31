import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { FileText, Download, PrinterIcon, Eye } from 'lucide-react';
import { supabase, supabaseHelpers, Student, StudentScore, Class, Subject, SchoolConfig } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface StudentResult {
  student: Student;
  scores: StudentScore[];
  totalScore: number;
  averageScore: number;
  position: number;
}

export function ComprehensivePDFResultGenerator() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig | null>(null);
  const [currentSession] = useState('2024/2025');
  const [currentTerm] = useState('First Term');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadClassData();
    }
  }, [selectedClass]);

  const loadInitialData = async () => {
    try {
      // Load classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (classesError) {
        toast.error('Failed to load classes');
        return;
      }

      setClasses(classesData || []);

      // Load subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (subjectsError) {
        toast.error('Failed to load subjects');
        return;
      }

      setSubjects(subjectsData || []);

      // Load school config
      const { data: configData, error: configError } = await supabaseHelpers.getSchoolConfig();
      
      if (configError) {
        console.error('Failed to load school config:', configError);
      } else {
        setSchoolConfig(configData);
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load initial data');
    }
  };

  const loadClassData = async () => {
    if (!selectedClass) return;

    setLoading(true);
    try {
      // Load students for the class
      const { data: studentsData, error: studentsError } = await supabaseHelpers.getStudents(selectedClass);
      
      if (studentsError) {
        toast.error('Failed to load students');
        return;
      }

      setStudents(studentsData || []);

      // Load all scores for the class
      const { data: scoresData, error: scoresError } = await supabase
        .from('student_scores')
        .select(`
          *,
          students:student_id (*),
          subjects:subject_id (*)
        `)
        .eq('class_id', selectedClass)
        .eq('session', currentSession)
        .eq('term', currentTerm)
        .eq('is_approved', true);

      if (scoresError) {
        console.error('Error loading scores:', scoresError);
        return;
      }

      // Process student results
      const results: StudentResult[] = [];
      
      for (const student of studentsData || []) {
        const studentScores = scoresData?.filter(score => score.student_id === student.id) || [];
        const totalScore = studentScores.reduce((sum, score) => sum + score.total_score, 0);
        const averageScore = studentScores.length > 0 ? totalScore / studentScores.length : 0;

        results.push({
          student,
          scores: studentScores,
          totalScore,
          averageScore,
          position: 0, // Will be calculated after sorting
        });
      }

      // Sort by average score and assign positions
      results.sort((a, b) => b.averageScore - a.averageScore);
      results.forEach((result, index) => {
        result.position = index + 1;
      });

      setStudentResults(results);

    } catch (error) {
      console.error('Error loading class data:', error);
      toast.error('Failed to load class data');
    } finally {
      setLoading(false);
    }
  };

  const generateSchoolHeader = (doc: jsPDF, y: number = 20): number => {
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // School logo (simple text-based representation)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138); // Navy blue
    doc.text('👑 GRACELAND ROYAL ACADEMY', pageWidth / 2, y, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(251, 191, 36); // Gold
    doc.text('WISDOM & ILLUMINATION', pageWidth / 2, y + 8, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Excellence in Education Since 1995', pageWidth / 2, y + 16, { align: 'center' });
    
    // Watermark
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(80);
    doc.text('GRA', pageWidth / 2, doc.internal.pageSize.getHeight() / 2, { 
      align: 'center',
      angle: 45 
    });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    return y + 25;
  };

  const generateStudentResult = async (studentResult: StudentResult) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    let currentY = generateSchoolHeader(doc);
    
    // Result sheet header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT RESULT SHEET', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;
    
    // Student information
    const selectedClassName = classes.find(c => c.id === selectedClass)?.name || '';
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const studentInfo = [
      ['Student Name:', `${studentResult.student.first_name} ${studentResult.student.last_name}`],
      ['Admission Number:', studentResult.student.admission_number],
      ['Class:', selectedClassName],
      ['Session:', currentSession],
      ['Term:', currentTerm],
      ['Position:', `${studentResult.position} of ${studentResults.length}`],
    ];
    
    studentInfo.forEach(([label, value], index) => {
      const y = currentY + (index * 8);
      doc.text(label, 20, y);
      doc.setFont('helvetica', 'bold');
      doc.text(value, 80, y);
      doc.setFont('helvetica', 'normal');
    });
    
    currentY += 60;
    
    // Scores table
    const tableData = studentResult.scores.map(score => {
      const subject = subjects.find(s => s.id === score.subject_id);
      return [
        subject?.name || 'Unknown Subject',
        score.test1_score.toString(),
        score.test2_score.toString(),
        score.exam_score.toString(),
        score.total_score.toString(),
        score.grade,
        getGradeRemark(score.grade),
      ];
    });
    
    doc.autoTable({
      head: [['Subject', 'Test 1 (20)', 'Test 2 (20)', 'Exam (60)', 'Total (100)', 'Grade', 'Remark']],
      body: tableData,
      startY: currentY,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 58, 138], // Navy blue
        textColor: [255, 255, 255],
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 20;
    
    // Summary
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SUMMARY', 20, currentY);
    currentY += 10;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const summaryInfo = [
      [`Total Subjects: ${studentResult.scores.length}`],
      [`Total Score: ${studentResult.totalScore.toFixed(1)}`],
      [`Average Score: ${studentResult.averageScore.toFixed(1)}`],
      [`Position: ${studentResult.position} of ${studentResults.length}`],
      [`Overall Grade: ${getOverallGrade(studentResult.averageScore)}`],
    ];
    
    summaryInfo.forEach(([text], index) => {
      doc.text(text, 20, currentY + (index * 7));
    });
    
    currentY += 50;
    
    // Signatures
    doc.setFontSize(9);
    doc.text('Class Teacher: ____________________', 20, currentY);
    doc.text('Principal: ____________________', pageWidth - 100, currentY);
    doc.text('Date: ____________________', pageWidth / 2 - 40, currentY + 15);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by Graceland Royal Academy Management System', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    
    return doc;
  };

  const generateClassResult = async () => {
    if (studentResults.length === 0) {
      toast.error('No approved results found for this class');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    let currentY = generateSchoolHeader(doc);
    
    // Class result header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CLASS RESULT SUMMARY', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;
    
    // Class information
    const selectedClassName = classes.find(c => c.id === selectedClass)?.name || '';
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const classInfo = [
      ['Class:', selectedClassName],
      ['Session:', currentSession],
      ['Term:', currentTerm],
      ['Total Students:', studentResults.length.toString()],
    ];
    
    classInfo.forEach(([label, value], index) => {
      const y = currentY + (index * 8);
      doc.text(label, 20, y);
      doc.setFont('helvetica', 'bold');
      doc.text(value, 80, y);
      doc.setFont('helvetica', 'normal');
    });
    
    currentY += 40;
    
    // Class summary table
    const tableData = studentResults.map((result, index) => [
      (index + 1).toString(),
      result.student.admission_number,
      `${result.student.first_name} ${result.student.last_name}`,
      result.totalScore.toFixed(1),
      result.averageScore.toFixed(1),
      getOverallGrade(result.averageScore),
      result.position.toString(),
    ]);
    
    doc.autoTable({
      head: [['S/N', 'Admission No.', 'Student Name', 'Total Score', 'Average', 'Grade', 'Position']],
      body: tableData,
      startY: currentY,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 58, 138], // Navy blue
        textColor: [255, 255, 255],
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });
    
    return doc;
  };

  const getGradeRemark = (grade: string): string => {
    const remarks: Record<string, string> = {
      'A': 'Excellent',
      'B': 'Very Good',
      'C': 'Good',
      'D': 'Fair',
      'E': 'Pass',
      'F': 'Fail',
    };
    return remarks[grade] || 'N/A';
  };

  const getOverallGrade = (average: number): string => {
    if (average >= 70) return 'A';
    if (average >= 60) return 'B';
    if (average >= 50) return 'C';
    if (average >= 45) return 'D';
    if (average >= 40) return 'E';
    return 'F';
  };

  const handlePrintStudentResult = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    const studentResult = studentResults.find(r => r.student.id === selectedStudent);
    if (!studentResult) {
      toast.error('Student result not found');
      return;
    }

    try {
      const doc = await generateStudentResult(studentResult);
      doc.save(`${studentResult.student.first_name}_${studentResult.student.last_name}_Result_${currentTerm.replace(' ', '_')}.pdf`);
      toast.success('Student result PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handlePrintClassResult = async () => {
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }

    try {
      const doc = await generateClassResult();
      if (doc) {
        const className = classes.find(c => c.id === selectedClass)?.name || 'Class';
        doc.save(`${className}_Result_Summary_${currentTerm.replace(' ', '_')}.pdf`);
        toast.success('Class result PDF generated successfully');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">Result PDF Generator</h2>
        <p className="text-muted-foreground">Generate and print student results with school watermarks</p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Results
          </CardTitle>
          <CardDescription>
            Select class and student to generate PDF results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Select Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(classItem => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Select Student (Optional)</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student or leave blank for all" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name} ({student.admission_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handlePrintStudentResult}
              disabled={!selectedClass || !selectedStudent || loading}
              className="bg-navy hover:bg-navy/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Student Result
            </Button>

            <Button 
              onClick={handlePrintClassResult}
              disabled={!selectedClass || loading}
              variant="outline"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Generate Class Summary
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Preview */}
      {selectedClass && studentResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Results Preview
            </CardTitle>
            <CardDescription>
              {classes.find(c => c.id === selectedClass)?.name} - {currentSession} {currentTerm}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Average Score</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentResults.map(result => (
                  <TableRow key={result.student.id}>
                    <TableCell className="font-medium">{result.position}</TableCell>
                    <TableCell>
                      {result.student.first_name} {result.student.last_name}
                    </TableCell>
                    <TableCell>{result.student.admission_number}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{result.scores.length} subjects</Badge>
                    </TableCell>
                    <TableCell>{result.averageScore.toFixed(1)}</TableCell>
                    <TableCell>
                      <Badge variant={getOverallGrade(result.averageScore) === 'F' ? 'destructive' : 'default'}>
                        {getOverallGrade(result.averageScore)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedStudent(result.student.id);
                          handlePrintStudentResult();
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}