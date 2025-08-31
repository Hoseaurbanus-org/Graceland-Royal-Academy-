import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { 
  BarChart3,
  TrendingUp,
  Download,
  FileText,
  Calculator,
  Star,
  Target,
  Award,
  Users,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner@2.0.3';

interface BroadsheetData {
  student_id: string;
  student_name: string;
  admission_number: string;
  term_scores: Record<string, Record<string, number>>; // term -> subject -> score
  cumulative_scores: Record<string, number>; // subject -> cumulative average
  total_average: number;
  position: number;
  grade: string;
}

function BroadsheetAnalytics() {
  const { 
    students, 
    classes, 
    subjects, 
    results, 
    currentSession 
  } = useAuth();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('term-wise');

  // Calculate broadsheet data
  const broadsheetData = useMemo(() => {
    if (!selectedClass) return [];

    const classStudents = students.filter(s => s.class_id === selectedClass && s.is_active);
    const classResults = results.filter(r => r.class_id === selectedClass && r.session === currentSession);
    
    const data: BroadsheetData[] = classStudents.map(student => {
      const studentResults = classResults.filter(r => r.student_id === student.id);
      
      // Term-wise scores
      const termScores: Record<string, Record<string, number>> = {};
      const cumulativeScores: Record<string, number> = {};
      
      ['First Term', 'Second Term', 'Third Term'].forEach(term => {
        termScores[term] = {};
        const termResults = studentResults.filter(r => r.term === term);
        
        termResults.forEach(result => {
          const subject = subjects.find(s => s.id === result.subject_id);
          if (subject) {
            termScores[term][subject.code] = result.percentage;
          }
        });
      });

      // Calculate cumulative scores per subject
      subjects.forEach(subject => {
        const subjectScores = ['First Term', 'Second Term', 'Third Term']
          .map(term => termScores[term][subject.code] || 0)
          .filter(score => score > 0);
        
        if (subjectScores.length > 0) {
          cumulativeScores[subject.code] = Math.round(
            subjectScores.reduce((sum, score) => sum + score, 0) / subjectScores.length
          );
        }
      });

      // Calculate total average
      const allScores = Object.values(cumulativeScores);
      const totalAverage = allScores.length > 0 
        ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length)
        : 0;

      return {
        student_id: student.id,
        student_name: student.name,
        admission_number: student.admission_number,
        term_scores: termScores,
        cumulative_scores: cumulativeScores,
        total_average: totalAverage,
        position: 0, // Will be calculated after sorting
        grade: calculateGrade(totalAverage)
      };
    });

    // Calculate positions
    const sortedData = data.sort((a, b) => b.total_average - a.total_average);
    sortedData.forEach((item, index) => {
      item.position = index + 1;
    });

    return sortedData;
  }, [selectedClass, students, results, subjects, currentSession]);

  // Filter data based on search
  const filteredData = broadsheetData.filter(data =>
    data.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    data.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Subject-specific analytics
  const subjectAnalytics = useMemo(() => {
    if (!selectedClass || !selectedSubject) return null;

    const subject = subjects.find(s => s.id === selectedSubject);
    if (!subject) return null;

    const subjectData = filteredData.map(data => ({
      student_name: data.student_name,
      admission_number: data.admission_number,
      term_scores: data.term_scores,
      cumulative_score: data.cumulative_scores[subject.code] || 0,
      grade: calculateGrade(data.cumulative_scores[subject.code] || 0)
    })).sort((a, b) => b.cumulative_score - a.cumulative_score);

    const scores = subjectData.map(d => d.cumulative_score).filter(s => s > 0);
    const analytics = {
      subject_name: subject.name,
      subject_code: subject.code,
      total_students: subjectData.length,
      attempted_students: scores.length,
      highest_score: Math.max(...scores, 0),
      lowest_score: Math.min(...scores, 100),
      average_score: scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0,
      pass_rate: scores.length > 0 ? Math.round((scores.filter(s => s >= 40).length / scores.length) * 100) : 0,
      grade_distribution: {
        A: scores.filter(s => s >= 80).length,
        B: scores.filter(s => s >= 70 && s < 80).length,
        C: scores.filter(s => s >= 60 && s < 70).length,
        D: scores.filter(s => s >= 50 && s < 60).length,
        E: scores.filter(s => s >= 40 && s < 50).length,
        F: scores.filter(s => s < 40).length,
      },
      student_data: subjectData
    };

    return analytics;
  }, [selectedClass, selectedSubject, filteredData, subjects]);

  const calculateGrade = (percentage: number): string => {
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    return 'F';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-50';
      case 'B': return 'text-blue-600 bg-blue-50';
      case 'C': return 'text-yellow-600 bg-yellow-50';
      case 'D': return 'text-orange-600 bg-orange-50';
      case 'E': return 'text-red-600 bg-red-50';
      case 'F': return 'text-red-800 bg-red-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const exportBroadsheet = () => {
    if (!selectedClass) {
      toast.error('Please select a class first');
      return;
    }

    const className = classes.find(c => c.id === selectedClass)?.name || 'Unknown Class';
    
    // Create CSV content for term-wise data
    const headers = [
      'S/N', 'Admission No.', 'Student Name', 
      ...subjects.map(s => `${s.code} (1st)`),
      ...subjects.map(s => `${s.code} (2nd)`),
      ...subjects.map(s => `${s.code} (3rd)`),
      ...subjects.map(s => `${s.code} (Cum)`),
      'Total Average', 'Grade', 'Position'
    ];

    const csvRows = filteredData.map((data, index) => [
      index + 1,
      data.admission_number,
      data.student_name,
      ...subjects.map(s => data.term_scores['First Term'][s.code] || ''),
      ...subjects.map(s => data.term_scores['Second Term'][s.code] || ''),
      ...subjects.map(s => data.term_scores['Third Term'][s.code] || ''),
      ...subjects.map(s => data.cumulative_scores[s.code] || ''),
      data.total_average,
      data.grade,
      data.position
    ]);

    const csvContent = [headers, ...csvRows]
      .map(row => row.join(','))
      .join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${className}_Broadsheet_${currentSession}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Broadsheet exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary">Broadsheet Analytics</h2>
          <p className="text-muted-foreground">Comprehensive term-wise and cumulative performance analysis</p>
        </div>
        <Button onClick={exportBroadsheet} disabled={!selectedClass}>
          <Download className="h-4 w-4 mr-2" />
          Export Broadsheet
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Analytics Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Class *</label>
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
              <label className="text-sm font-medium">Subject (For Subject Analytics)</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.filter(s => s.is_active).map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Search Students</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search by name or admission no."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClass && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="term-wise">Term-wise Scores</TabsTrigger>
            <TabsTrigger value="cumulative">Cumulative Analysis</TabsTrigger>
            <TabsTrigger value="subject-specific">Subject Analytics</TabsTrigger>
          </TabsList>

          {/* Term-wise Scores */}
          <TabsContent value="term-wise">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Term-wise Student Performance
                </CardTitle>
                <CardDescription>
                  Individual student scores across all three terms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">S/N</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Adm. No.</TableHead>
                        {subjects.filter(s => s.is_active).map(subject => (
                          <TableHead key={`${subject.id}-1st`} className="text-center">
                            {subject.code} (1st)
                          </TableHead>
                        ))}
                        {subjects.filter(s => s.is_active).map(subject => (
                          <TableHead key={`${subject.id}-2nd`} className="text-center">
                            {subject.code} (2nd)
                          </TableHead>
                        ))}
                        {subjects.filter(s => s.is_active).map(subject => (
                          <TableHead key={`${subject.id}-3rd`} className="text-center">
                            {subject.code} (3rd)
                          </TableHead>
                        ))}
                        <TableHead className="text-center">Total Avg.</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead className="text-center">Position</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((data, index) => (
                        <TableRow key={data.student_id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{data.student_name}</TableCell>
                          <TableCell>{data.admission_number}</TableCell>
                          
                          {/* First Term Scores */}
                          {subjects.filter(s => s.is_active).map(subject => (
                            <TableCell key={`${subject.id}-1st`} className="text-center">
                              {data.term_scores['First Term'][subject.code] || '-'}
                            </TableCell>
                          ))}
                          
                          {/* Second Term Scores */}
                          {subjects.filter(s => s.is_active).map(subject => (
                            <TableCell key={`${subject.id}-2nd`} className="text-center">
                              {data.term_scores['Second Term'][subject.code] || '-'}
                            </TableCell>
                          ))}
                          
                          {/* Third Term Scores */}
                          {subjects.filter(s => s.is_active).map(subject => (
                            <TableCell key={`${subject.id}-3rd`} className="text-center">
                              {data.term_scores['Third Term'][subject.code] || '-'}
                            </TableCell>
                          ))}
                          
                          <TableCell className="text-center font-bold">
                            {data.total_average}%
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={getGradeColor(data.grade)}>
                              {data.grade}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {data.position === 1 && <Star className="h-4 w-4 text-yellow-500 mx-auto" />}
                            {data.position}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {filteredData.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No student data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cumulative Analysis */}
          <TabsContent value="cumulative">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Cumulative Performance Analysis
                </CardTitle>
                <CardDescription>
                  Average scores across all terms with rankings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Pos.</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Adm. No.</TableHead>
                        {subjects.filter(s => s.is_active).map(subject => (
                          <TableHead key={subject.id} className="text-center">
                            {subject.code} (Avg)
                          </TableHead>
                        ))}
                        <TableHead className="text-center">Total Average</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead className="text-center">Performance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((data) => (
                        <TableRow key={data.student_id}>
                          <TableCell className="font-bold">
                            {data.position === 1 && <Star className="h-4 w-4 text-yellow-500 inline mr-1" />}
                            {data.position}
                          </TableCell>
                          <TableCell className="font-medium">{data.student_name}</TableCell>
                          <TableCell>{data.admission_number}</TableCell>
                          
                          {/* Cumulative Subject Scores */}
                          {subjects.filter(s => s.is_active).map(subject => (
                            <TableCell key={subject.id} className="text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-medium">
                                  {data.cumulative_scores[subject.code] || '-'}
                                </span>
                                {data.cumulative_scores[subject.code] && (
                                  <div className="w-12 h-1 bg-gray-200 rounded mt-1">
                                    <div 
                                      className="h-full bg-primary rounded"
                                      style={{ width: `${Math.min(data.cumulative_scores[subject.code], 100)}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          ))}
                          
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-bold text-lg">{data.total_average}%</span>
                              <Progress value={data.total_average} className="w-16 h-2 mt-1" />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={getGradeColor(data.grade)}>
                              {data.grade}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {data.total_average >= 80 && <Award className="h-4 w-4 text-yellow-500 mx-auto" />}
                            {data.total_average >= 60 && data.total_average < 80 && <Target className="h-4 w-4 text-blue-500 mx-auto" />}
                            {data.total_average < 60 && <TrendingUp className="h-4 w-4 text-orange-500 mx-auto" />}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subject-specific Analytics */}
          <TabsContent value="subject-specific">
            {subjectAnalytics ? (
              <div className="space-y-6">
                {/* Subject Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      {subjectAnalytics.subject_name} ({subjectAnalytics.subject_code}) - Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                        <p className="text-2xl font-bold text-blue-600">{subjectAnalytics.attempted_students}</p>
                        <p className="text-sm text-muted-foreground">Students Attempted</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                        <p className="text-2xl font-bold text-green-600">{subjectAnalytics.average_score}%</p>
                        <p className="text-sm text-muted-foreground">Class Average</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <Star className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                        <p className="text-2xl font-bold text-yellow-600">{subjectAnalytics.highest_score}%</p>
                        <p className="text-sm text-muted-foreground">Highest Score</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                        <p className="text-2xl font-bold text-purple-600">{subjectAnalytics.pass_rate}%</p>
                        <p className="text-sm text-muted-foreground">Pass Rate</p>
                      </div>
                    </div>

                    {/* Grade Distribution */}
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Grade Distribution</h4>
                      <div className="grid grid-cols-6 gap-2">
                        {Object.entries(subjectAnalytics.grade_distribution).map(([grade, count]) => (
                          <div key={grade} className="text-center p-2 border rounded">
                            <p className="font-bold text-lg">{count}</p>
                            <p className="text-sm text-muted-foreground">Grade {grade}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Student Performance Table */}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Adm. No.</TableHead>
                            <TableHead className="text-center">1st Term</TableHead>
                            <TableHead className="text-center">2nd Term</TableHead>
                            <TableHead className="text-center">3rd Term</TableHead>
                            <TableHead className="text-center">Cumulative</TableHead>
                            <TableHead className="text-center">Grade</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subjectAnalytics.student_data.map((student, index) => (
                            <TableRow key={student.admission_number}>
                              <TableCell className="font-bold">
                                {index + 1}
                                {index === 0 && <Star className="h-4 w-4 text-yellow-500 inline ml-1" />}
                              </TableCell>
                              <TableCell className="font-medium">{student.student_name}</TableCell>
                              <TableCell>{student.admission_number}</TableCell>
                              <TableCell className="text-center">
                                {student.term_scores['First Term'][subjectAnalytics.subject_code] || '-'}
                              </TableCell>
                              <TableCell className="text-center">
                                {student.term_scores['Second Term'][subjectAnalytics.subject_code] || '-'}
                              </TableCell>
                              <TableCell className="text-center">
                                {student.term_scores['Third Term'][subjectAnalytics.subject_code] || '-'}
                              </TableCell>
                              <TableCell className="text-center font-bold">
                                {student.cumulative_score}%
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className={getGradeColor(student.grade)}>
                                  {student.grade}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calculator className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a subject to view detailed analytics</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {!selectedClass && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a class to view broadsheet analytics</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default BroadsheetAnalytics;