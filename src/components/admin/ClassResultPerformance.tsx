import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Medal, 
  Star,
  Trophy,
  Target,
  BarChart3,
  Users,
  BookOpen,
  Printer,
  Eye
} from 'lucide-react';
import { useAuth } from '../AuthContext';

interface StudentPerformance {
  student_id: string;
  student_name: string;
  student_photo: string;
  admission_number: string;
  total_score: number;
  average_score: number;
  grade: string;
  position: number;
  subjects_completed: number;
  total_subjects: number;
  performance_trend: 'up' | 'down' | 'stable';
}

interface ClassPerformance {
  class_id: string;
  class_name: string;
  students: StudentPerformance[];
  class_average: number;
  highest_score: number;
  lowest_score: number;
  total_students: number;
  subjects_count: number;
}

export function ClassResultPerformance() {
  const { students, classes, subjects, results } = useAuth();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [selectedSession, setSelectedSession] = useState('2024/2025');
  const [showPrintApprove, setShowPrintApprove] = useState(false);

  // Calculate class performance data
  const classPerformanceData = useMemo(() => {
    if (!selectedClass) return null;

    const classData = classes.find(c => c.id === selectedClass);
    if (!classData) return null;

    const classStudents = students.filter(s => s.class_id === selectedClass && s.is_active);
    const classResults = results.filter(r => 
      r.class_id === selectedClass && 
      r.term === selectedTerm && 
      r.session === selectedSession &&
      r.status === 'approved'
    );

    // Group results by student
    const studentResults = classStudents.map(student => {
      const studentSubjectResults = classResults.filter(r => r.student_id === student.id);
      
      if (studentSubjectResults.length === 0) {
        return {
          student_id: student.id,
          student_name: student.name,
          student_photo: student.photo_url,
          admission_number: student.admission_number,
          total_score: 0,
          average_score: 0,
          grade: 'N/A',
          position: 0,
          subjects_completed: 0,
          total_subjects: subjects.length,
          performance_trend: 'stable' as const
        };
      }

      // Calculate total and average scores
      const totalScore = studentSubjectResults.reduce((sum, r) => sum + (r.total_score || 0), 0);
      const averageScore = totalScore / studentSubjectResults.length;
      
      // Determine overall grade based on average
      const getOverallGrade = (avg: number) => {
        if (avg >= 80) return 'A';
        if (avg >= 70) return 'B';
        if (avg >= 60) return 'C';
        if (avg >= 50) return 'D';
        if (avg >= 40) return 'E';
        return 'F';
      };

      // Simulate performance trend (in real app, compare with previous term)
      const getPerformanceTrend = (score: number) => {
        if (score >= 70) return 'up';
        if (score >= 50) return 'stable';
        return 'down';
      };

      return {
        student_id: student.id,
        student_name: student.name,
        student_photo: student.photo_url,
        admission_number: student.admission_number,
        total_score: totalScore,
        average_score: Math.round(averageScore * 100) / 100,
        grade: getOverallGrade(averageScore),
        position: 0, // Will be set after sorting
        subjects_completed: studentSubjectResults.length,
        total_subjects: subjects.length,
        performance_trend: getPerformanceTrend(averageScore)
      };
    });

    // Sort by average score (descending) and assign positions
    const sortedStudents = studentResults
      .sort((a, b) => b.average_score - a.average_score)
      .map((student, index) => ({
        ...student,
        position: index + 1
      }));

    // Calculate class statistics
    const validScores = sortedStudents.filter(s => s.average_score > 0);
    const classAverage = validScores.length > 0 
      ? validScores.reduce((sum, s) => sum + s.average_score, 0) / validScores.length 
      : 0;
    
    const highestScore = validScores.length > 0 
      ? Math.max(...validScores.map(s => s.average_score)) 
      : 0;
    
    const lowestScore = validScores.length > 0 
      ? Math.min(...validScores.map(s => s.average_score)) 
      : 0;

    return {
      class_id: selectedClass,
      class_name: classData.name,
      students: sortedStudents,
      class_average: Math.round(classAverage * 100) / 100,
      highest_score: highestScore,
      lowest_score: lowestScore,
      total_students: classStudents.length,
      subjects_count: subjects.length
    };
  }, [selectedClass, selectedTerm, selectedSession, students, classes, subjects, results]);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'E': return 'bg-red-100 text-red-800 border-red-200';
      case 'F': return 'bg-red-200 text-red-900 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleClassSelection = (classId: string) => {
    setSelectedClass(classId);
    setShowPrintApprove(!!classId);
  };

  const handlePrintResults = () => {
    if (!classPerformanceData) return;
    
    // Create print window with results
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Class Performance Report - ${classPerformanceData.class_name}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .stats { display: flex; justify-content: space-around; margin-bottom: 20px; }
              .stat-box { text-align: center; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              .position { font-weight: bold; }
              .grade-A { background-color: #dcfce7; }
              .grade-B { background-color: #dbeafe; }
              .grade-C { background-color: #fef3c7; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>GRACELAND ROYAL ACADEMY</h1>
              <h2>Class Performance Report</h2>
              <p><strong>Class:</strong> ${classPerformanceData.class_name} | <strong>Term:</strong> ${selectedTerm} | <strong>Session:</strong> ${selectedSession}</p>
            </div>
            
            <div class="stats">
              <div class="stat-box">
                <h3>Class Average</h3>
                <p><strong>${classPerformanceData.class_average}%</strong></p>
              </div>
              <div class="stat-box">
                <h3>Highest Score</h3>
                <p><strong>${classPerformanceData.highest_score}%</strong></p>
              </div>
              <div class="stat-box">
                <h3>Lowest Score</h3>
                <p><strong>${classPerformanceData.lowest_score}%</strong></p>
              </div>
              <div class="stat-box">
                <h3>Total Students</h3>
                <p><strong>${classPerformanceData.total_students}</strong></p>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Student Name</th>
                  <th>Admission No.</th>
                  <th>Average Score</th>
                  <th>Grade</th>
                  <th>Subjects Completed</th>
                </tr>
              </thead>
              <tbody>
                ${classPerformanceData.students.map(student => `
                  <tr class="grade-${student.grade}">
                    <td class="position">${student.position}</td>
                    <td>${student.student_name}</td>
                    <td>${student.admission_number}</td>
                    <td>${student.average_score}%</td>
                    <td><strong>${student.grade}</strong></td>
                    <td>${student.subjects_completed}/${student.total_subjects}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div style="margin-top: 30px; text-align: center; color: #666;">
              <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              <p>WISDOM & ILLUMINATION</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Student Result Performance
          </CardTitle>
          <CardDescription>
            View compiled class performance rankings from best to lowest performing students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Class</label>
              <Select value={selectedClass} onValueChange={handleClassSelection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Term</label>
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

            <div>
              <label className="text-sm font-medium mb-2 block">Session</label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                  <SelectItem value="2023/2024">2023/2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Print and Approve Buttons */}
          {showPrintApprove && classPerformanceData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 mb-6"
            >
              <Button onClick={handlePrintResults} variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                Print Report
              </Button>
              <Button variant="outline" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </motion.div>
          )}

          {/* Class Performance Display */}
          {classPerformanceData ? (
            <div className="space-y-6">
              {/* Class Statistics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-sm text-blue-600 font-medium">Class Average</p>
                      <p className="text-2xl font-bold text-blue-800">{classPerformanceData.class_average}%</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Trophy className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-sm text-green-600 font-medium">Highest Score</p>
                      <p className="text-2xl font-bold text-green-800">{classPerformanceData.highest_score}%</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Target className="h-6 w-6 text-red-600" />
                      </div>
                      <p className="text-sm text-red-600 font-medium">Lowest Score</p>
                      <p className="text-2xl font-bold text-red-800">{classPerformanceData.lowest_score}%</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <p className="text-sm text-purple-600 font-medium">Total Students</p>
                      <p className="text-2xl font-bold text-purple-800">{classPerformanceData.total_students}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Performance Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Position</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Admission No.</TableHead>
                      <TableHead>Average Score</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classPerformanceData.students.map((student, index) => (
                      <motion.tr
                        key={student.student_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className={`hover:bg-muted/50 ${
                          student.position <= 3 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100' : ''
                        }`}
                      >
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            {getPositionIcon(student.position)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={student.student_photo} alt={student.student_name} />
                              <AvatarFallback className="text-xs">
                                {student.student_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.student_name}</p>
                              {student.position <= 3 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span className="text-xs text-yellow-600 font-medium">
                                    {student.position === 1 ? 'Top Performer' : 
                                     student.position === 2 ? '2nd Best' : '3rd Best'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.admission_number}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">{student.average_score}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getGradeColor(student.grade)} font-bold`}>
                            {student.grade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">{student.subjects_completed}</span>
                            <span className="text-muted-foreground">/{student.total_subjects}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {getTrendIcon(student.performance_trend)}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Performance Summary */}
              <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Excellent (A-B)</p>
                      <p className="text-2xl font-bold text-green-600">
                        {classPerformanceData.students.filter(s => ['A', 'B'].includes(s.grade)).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Good (C-D)</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {classPerformanceData.students.filter(s => ['C', 'D'].includes(s.grade)).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Needs Improvement (E-F)</p>
                      <p className="text-2xl font-bold text-red-600">
                        {classPerformanceData.students.filter(s => ['E', 'F'].includes(s.grade)).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Select a class to view performance rankings</p>
              <p className="text-sm text-muted-foreground mt-2">
                Performance data shows students ranked from highest to lowest average scores
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ClassResultPerformance;