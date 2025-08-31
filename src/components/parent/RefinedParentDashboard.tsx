import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  User,
  TrendingUp,
  Calendar,
  BookOpen,
  Award,
  Clock,
  Target,
  Star,
  Eye,
  Download,
  MessageSquare,
  BarChart3,
  GraduationCap,
  Heart,
  Users,
  Activity
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner@2.0.3';

interface StudentProgress {
  studentId: string;
  studentName: string;
  className: string;
  totalSubjects: number;
  completedResults: number;
  averageScore: number;
  grade: string;
  position: number;
  trend: 'up' | 'down' | 'stable';
}

export function RefinedParentDashboard() {
  const { 
    user, 
    students, 
    classes, 
    subjects, 
    results, 
    currentSession, 
    currentTerm,
    getMyChildren,
    getResultsByStudent
  } = useAuth();

  const [selectedChild, setSelectedChild] = useState<string>('');
  const [childrenProgress, setChildrenProgress] = useState<StudentProgress[]>([]);

  // Get children for this parent
  const myChildren = typeof getMyChildren === 'function' 
    ? getMyChildren(user?.id || '') 
    : students.filter(s => s.parent_id === user?.id && s.is_active);

  // Calculate progress for each child
  useEffect(() => {
    const calculateProgress = () => {
      const progress: StudentProgress[] = myChildren.map(child => {
        const childClass = classes.find(c => c.id === child.class_id);
        const classSubjects = subjects.filter(s => s.is_active);
        
        const childResults = typeof getResultsByStudent === 'function'
          ? getResultsByStudent(child.id, currentSession, currentTerm)
          : results.filter(r => 
              r.student_id === child.id && 
              r.session === currentSession && 
              r.term === currentTerm &&
              r.status === 'approved'
            );

        const totalSubjects = classSubjects.length;
        const completedResults = childResults.length;
        const averageScore = childResults.length > 0 
          ? Math.round(childResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / childResults.length)
          : 0;

        const grade = calculateGrade(averageScore);

        return {
          studentId: child.id,
          studentName: child.name,
          className: childClass?.name || 'Unknown',
          totalSubjects,
          completedResults,
          averageScore,
          grade,
          position: 0, // Would be calculated from results
          trend: 'stable' as const
        };
      });

      setChildrenProgress(progress);
      
      // Auto-select first child if none selected
      if (!selectedChild && progress.length > 0) {
        setSelectedChild(progress[0].studentId);
      }
    };

    calculateProgress();
  }, [myChildren, results, currentSession, currentTerm, selectedChild]);

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
      case 'A': return 'text-green-600 bg-green-50 border-green-200';
      case 'B': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'C': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'D': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'E': return 'text-red-600 bg-red-50 border-red-200';
      case 'F': return 'text-red-800 bg-red-100 border-red-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default: return <TrendingUp className="h-3 w-3 text-gray-500" />;
    }
  };

  // Get selected child data
  const selectedChildData = childrenProgress.find(c => c.studentId === selectedChild);
  const selectedChildResults = selectedChild ? (
    typeof getResultsByStudent === 'function'
      ? getResultsByStudent(selectedChild, currentSession, currentTerm)
      : results.filter(r => 
          r.student_id === selectedChild && 
          r.session === currentSession && 
          r.term === currentTerm &&
          r.status === 'approved'
        )
  ) : [];

  if (!user || user.role !== 'parent') {
    return (
      <div className="p-6">
        <Alert>
          <User className="h-4 w-4" />
          <AlertDescription>
            Access denied. This dashboard is only available to parents.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (myChildren.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Children Found</h3>
            <p className="text-muted-foreground mb-4">
              No student records are linked to your parent account yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Please contact the school administrator to link your child's records to your account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Parent Dashboard</h1>
          <p className="text-muted-foreground">Monitor your child's academic progress and achievements</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {currentSession}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {currentTerm}
          </Badge>
        </div>
      </div>

      {/* Children Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {childrenProgress.map((child) => (
          <motion.div
            key={child.studentId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`cursor-pointer transition-all ${selectedChild === child.studentId ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'}`}
              onClick={() => setSelectedChild(child.studentId)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-academic-gold/20 flex items-center justify-center">
                      <GraduationCap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{child.studentName}</p>
                      <p className="text-xs text-muted-foreground">{child.className}</p>
                    </div>
                  </div>
                  {getTrendIcon(child.trend)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-medium">
                      {child.completedResults}/{child.totalSubjects} subjects
                    </span>
                  </div>
                  <Progress 
                    value={child.totalSubjects > 0 ? (child.completedResults / child.totalSubjects) * 100 : 0} 
                    className="h-1"
                  />
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">Average</span>
                    <Badge className={`text-xs ${getGradeColor(child.grade)}`}>
                      {child.averageScore}% ({child.grade})
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed View for Selected Child */}
      {selectedChildData && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Results
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              Behavior
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Calendar
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Summary */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Academic Performance
                    </CardTitle>
                    <CardDescription>
                      {selectedChildData.studentName}'s current academic standing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <BookOpen className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                        <p className="text-lg font-bold text-blue-600">{selectedChildData.completedResults}</p>
                        <p className="text-xs text-muted-foreground">Subjects Completed</p>
                      </div>
                      
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Target className="h-5 w-5 mx-auto mb-2 text-green-600" />
                        <p className="text-lg font-bold text-green-600">{selectedChildData.averageScore}%</p>
                        <p className="text-xs text-muted-foreground">Average Score</p>
                      </div>
                      
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <Award className="h-5 w-5 mx-auto mb-2 text-yellow-600" />
                        <p className="text-lg font-bold text-yellow-600">{selectedChildData.grade}</p>
                        <p className="text-xs text-muted-foreground">Current Grade</p>
                      </div>
                      
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Star className="h-5 w-5 mx-auto mb-2 text-purple-600" />
                        <p className="text-lg font-bold text-purple-600">#{selectedChildData.position || 'TBD'}</p>
                        <p className="text-xs text-muted-foreground">Class Position</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Subject Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Subject Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedChildResults.map((result) => {
                        const subject = subjects.find(s => s.id === result.subject_id);
                        if (!subject) return null;
                        
                        return (
                          <div key={result.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                                <BookOpen className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{subject.name}</p>
                                <p className="text-xs text-muted-foreground">{subject.code}</p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <Badge className={`${getGradeColor(result.grade || calculateGrade(result.percentage))}`}>
                                {result.percentage}% ({result.grade || calculateGrade(result.percentage)})
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                Pos: #{result.position || 'TBD'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      
                      {selectedChildResults.length === 0 && (
                        <div className="text-center py-8">
                          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No results available yet</p>
                          <p className="text-sm text-muted-foreground">Results will appear here once published</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions & Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report Card
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Results
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Teacher
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      View School Calendar
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Child Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{selectedChildData.studentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Class:</span>
                        <span className="font-medium">{selectedChildData.className}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Session:</span>
                        <span className="font-medium">{currentSession}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Term:</span>
                        <span className="font-medium">{currentTerm}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Academic Results - {selectedChildData.studentName}
                </CardTitle>
                <CardDescription>
                  Detailed subject performance and grades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Subject</th>
                        <th className="text-center p-2 font-medium">Test 1 (20%)</th>
                        <th className="text-center p-2 font-medium">Test 2 (20%)</th>
                        <th className="text-center p-2 font-medium">Exam (60%)</th>
                        <th className="text-center p-2 font-medium">Total</th>
                        <th className="text-center p-2 font-medium">Grade</th>
                        <th className="text-center p-2 font-medium">Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedChildResults.map((result) => {
                        const subject = subjects.find(s => s.id === result.subject_id);
                        if (!subject) return null;
                        
                        return (
                          <tr key={result.id} className="border-b hover:bg-muted/30">
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-3 w-3 text-muted-foreground" />
                                <span className="font-medium">{subject.name}</span>
                              </div>
                            </td>
                            <td className="text-center p-2">{result.test1_score || '-'}</td>
                            <td className="text-center p-2">{result.test2_score || '-'}</td>
                            <td className="text-center p-2">{result.exam_score || '-'}</td>
                            <td className="text-center p-2 font-bold">{result.percentage}%</td>
                            <td className="text-center p-2">
                              <Badge className={`${getGradeColor(result.grade || calculateGrade(result.percentage))}`}>
                                {result.grade || calculateGrade(result.percentage)}
                              </Badge>
                            </td>
                            <td className="text-center p-2">
                              {result.position ? `#${result.position}` : 'TBD'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {selectedChildResults.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">No results available</p>
                      <p className="text-sm text-muted-foreground">
                        Results will be published here once available
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Behavioral Assessment
                </CardTitle>
                <CardDescription>
                  Character traits and behavioral observations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">Behavioral assessment not available</p>
                  <p className="text-sm text-muted-foreground">
                    Behavioral assessments will be available once completed by teachers
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  School Calendar
                </CardTitle>
                <CardDescription>
                  Important dates and school events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">Calendar integration coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    School events and important dates will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}