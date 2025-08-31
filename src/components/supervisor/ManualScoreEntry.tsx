import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Calculator, 
  Save, 
  Send,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../AuthContext';

interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  class: string;
  scores?: {
    test1: number | null;
    test2: number | null;
    exam: number | null;
  };
}

interface ScoreEntry {
  studentId: string;
  test1: number | null;
  test2: number | null;
  exam: number | null;
  total: number;
  grade: string;
  position?: number;
}

interface ManualScoreEntryProps {
  selectedClass: string;
  selectedSubject: string;
}

export function ManualScoreEntry({ selectedClass, selectedSubject }: ManualScoreEntryProps) {
  const { user, staff, subjects, classes } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<Record<string, ScoreEntry>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get staff member info
  const staffMember = staff.find(s => s.email === user?.email);

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    }
  }, [selectedClass]);

  const loadStudents = () => {
    // Load students from localStorage for the selected class
    const savedStudents = localStorage.getItem('gra_students');
    if (savedStudents) {
      const allStudents: Student[] = JSON.parse(savedStudents);
      const classStudents = allStudents.filter(student => student.class === selectedClass);
      setStudents(classStudents);
      
      // Initialize scores for students
      const initialScores: Record<string, ScoreEntry> = {};
      classStudents.forEach(student => {
        initialScores[student.id] = {
          studentId: student.id,
          test1: student.scores?.test1 || null,
          test2: student.scores?.test2 || null,
          exam: student.scores?.exam || null,
          total: 0,
          grade: '',
          position: 0
        };
      });
      
      // Load existing scores if any
      const savedScores = localStorage.getItem(`gra_scores_${selectedSubject}_${selectedClass}`);
      if (savedScores) {
        const existingScores = JSON.parse(savedScores);
        Object.keys(existingScores).forEach(studentId => {
          if (initialScores[studentId]) {
            initialScores[studentId] = { ...initialScores[studentId], ...existingScores[studentId] };
            
            // Recalculate total and grade
            const test1 = initialScores[studentId].test1 || 0;
            const test2 = initialScores[studentId].test2 || 0;
            const exam = initialScores[studentId].exam || 0;
            const total = test1 + test2 + exam;
            
            initialScores[studentId].total = total;
            initialScores[studentId].grade = calculateGrade(total);
          }
        });
      }
      
      setScores(initialScores);
    }
  };

  const handleScoreChange = (studentId: string, field: 'test1' | 'test2' | 'exam', value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    const maxScores = { test1: 20, test2: 20, exam: 60 };
    
    // Validate score doesn't exceed maximum
    if (numValue !== null && (numValue < 0 || numValue > maxScores[field])) {
      return;
    }
    
    setScores(prev => {
      const updated = { ...prev };
      if (!updated[studentId]) {
        updated[studentId] = {
          studentId,
          test1: null,
          test2: null,
          exam: null,
          total: 0,
          grade: '',
          position: 0
        };
      }
      
      updated[studentId][field] = numValue;
      
      // Calculate total and grade
      const test1 = updated[studentId].test1 || 0;
      const test2 = updated[studentId].test2 || 0;
      const exam = updated[studentId].exam || 0;
      const total = test1 + test2 + exam;
      
      updated[studentId].total = total;
      updated[studentId].grade = calculateGrade(total);
      
      return updated;
    });
  };

  const calculateGrade = (total: number): string => {
    if (total >= 90) return 'A+';
    if (total >= 80) return 'A';
    if (total >= 70) return 'B+';
    if (total >= 60) return 'B';
    if (total >= 50) return 'C+';
    if (total >= 40) return 'C';
    if (total >= 30) return 'D';
    return 'F';
  };

  const calculatePositions = () => {
    const sortedScores = Object.values(scores).sort((a, b) => b.total - a.total);
    const updatedScores = { ...scores };
    
    sortedScores.forEach((score, index) => {
      updatedScores[score.studentId].position = index + 1;
    });
    
    setScores(updatedScores);
  };

  const saveScores = () => {
    calculatePositions();
    localStorage.setItem(`gra_scores_${selectedSubject}_${selectedClass}`, JSON.stringify(scores));
    
    // Save to results context for approval workflow
    const resultData = {
      id: `${selectedSubject}_${selectedClass}`,
      subjectId: selectedSubject,
      subjectName: subjects.find(s => s.id === selectedSubject)?.name,
      classId: selectedClass,
      className: classes.find(c => c.id === selectedClass)?.name,
      supervisorId: staffMember?.id,
      supervisorName: staffMember?.name,
      scores: Object.values(scores),
      status: 'saved',
      submittedAt: null,
      createdAt: new Date().toISOString()
    };
    
    const savedResults = localStorage.getItem('gra_results');
    const results = savedResults ? JSON.parse(savedResults) : [];
    const existingIndex = results.findIndex((r: any) => 
      r.subjectId === selectedSubject && r.classId === selectedClass && r.supervisorId === staffMember?.id
    );
    
    if (existingIndex !== -1) {
      results[existingIndex] = resultData;
    } else {
      results.push(resultData);
    }
    
    localStorage.setItem('gra_results', JSON.stringify(results));
    alert('Scores saved as draft successfully!');
  };

  const submitForApproval = () => {
    setIsSubmitting(true);
    calculatePositions();
    
    setTimeout(() => {
      const resultData = {
        id: `${selectedSubject}_${selectedClass}`,
        subjectId: selectedSubject,
        subjectName: subjects.find(s => s.id === selectedSubject)?.name,
        classId: selectedClass,
        className: classes.find(c => c.id === selectedClass)?.name,
        supervisorId: staffMember?.id,
        supervisorName: staffMember?.name,
        scores: Object.values(scores),
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      const savedResults = localStorage.getItem('gra_results');
      const results = savedResults ? JSON.parse(savedResults) : [];
      const existingIndex = results.findIndex((r: any) => 
        r.subjectId === selectedSubject && r.classId === selectedClass && r.supervisorId === staffMember?.id
      );
      
      if (existingIndex !== -1) {
        results[existingIndex] = resultData;
      } else {
        results.push(resultData);
      }
      
      localStorage.setItem('gra_results', JSON.stringify(results));
      setIsSubmitting(false);
      
      // Show success message
      alert('Scores submitted for approval successfully!');
    }, 1000);
  };

  const isFormComplete = () => {
    return Object.keys(scores).length > 0 &&
           Object.values(scores).some(score => 
             score.test1 !== null || score.test2 !== null || score.exam !== null
           );
  };

  const getSubjectName = () => subjects.find(s => s.id === selectedSubject)?.name || 'Selected Subject';
  const getClassName = () => classes.find(c => c.id === selectedClass)?.name || 'Selected Class';

  if (!staffMember) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Staff member not found. Please contact the administrator.
        </AlertDescription>
      </Alert>
    );
  }

  if (students.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No students found for the selected class. Please contact the administrator to register students for {getClassName()}.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Manual Score Entry - {getSubjectName()} ({getClassName()})
            </CardTitle>
            <CardDescription>
              Enter scores for Test 1 (0-20 marks), Test 2 (0-20 marks), and Exam (0-60 marks)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={saveScores} disabled={!isFormComplete()}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            
            <Button 
              onClick={submitForApproval}
              disabled={!isFormComplete() || isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Approval
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S/N</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Admission No.</TableHead>
                <TableHead className="text-center">Test 1 (20)</TableHead>
                <TableHead className="text-center">Test 2 (20)</TableHead>
                <TableHead className="text-center">Exam (60)</TableHead>
                <TableHead className="text-center">Total (100)</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-center">Position</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, index) => {
                const studentScore = scores[student.id] || {
                  test1: null, test2: null, exam: null, total: 0, grade: '', position: 0
                };
                
                return (
                  <TableRow key={student.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.admissionNumber}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={studentScore.test1 ?? ''}
                        onChange={(e) => handleScoreChange(student.id, 'test1', e.target.value)}
                        className="w-20 text-center"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={studentScore.test2 ?? ''}
                        onChange={(e) => handleScoreChange(student.id, 'test2', e.target.value)}
                        className="w-20 text-center"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="60"
                        step="0.5"
                        value={studentScore.exam ?? ''}
                        onChange={(e) => handleScoreChange(student.id, 'exam', e.target.value)}
                        className="w-20 text-center"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {studentScore.total.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={studentScore.grade === 'F' ? 'destructive' : 'default'}>
                        {studentScore.grade || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {studentScore.position > 0 && (
                        <Badge variant="outline">
                          {studentScore.position}
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
  );
}