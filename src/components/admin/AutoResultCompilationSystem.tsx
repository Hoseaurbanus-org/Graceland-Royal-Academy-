import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  CheckCircle,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  FileText,
  BarChart3,
  Users,
  BookOpen,
  Calculator,
  Award,
  TrendingUp,
  Eye,
  Download
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner@2.0.3';

interface CompilationJob {
  id: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  session: string;
  term: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalStudents: number;
  processedStudents: number;
  progress: number;
  startedAt: string;
  completedAt?: string;
  errors: string[];
}

interface AutoCompilationSettings {
  enabled: boolean;
  autoApprove: boolean;
  autoCalculatePositions: boolean;
  autoGeneratePDFs: boolean;
  notifyOnCompletion: boolean;
  compilationDelay: number; // minutes after submission
}

export function AutoResultCompilationSystem() {
  const { 
    user, 
    students, 
    classes, 
    subjects, 
    results, 
    currentSession, 
    currentTerm 
  } = useAuth();

  const [compilationJobs, setCompilationJobs] = useState<CompilationJob[]>([]);
  const [settings, setSettings] = useState<AutoCompilationSettings>({
    enabled: true,
    autoApprove: false,
    autoCalculatePositions: true,
    autoGeneratePDFs: false,
    notifyOnCompletion: true,
    compilationDelay: 5
  });
  const [isRunning, setIsRunning] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const savedJobs = localStorage.getItem('gra_compilation_jobs');
    const savedSettings = localStorage.getItem('gra_compilation_settings');
    
    if (savedJobs) {
      try {
        setCompilationJobs(JSON.parse(savedJobs));
      } catch (error) {
        console.error('Failed to load compilation jobs:', error);
      }
    }
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load compilation settings:', error);
      }
    }
  }, []);

  // Save settings
  const saveSettings = (newSettings: AutoCompilationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('gra_compilation_settings', JSON.stringify(newSettings));
    toast.success('Compilation settings saved');
  };

  // Save jobs
  const saveJobs = (jobs: CompilationJob[]) => {
    setCompilationJobs(jobs);
    localStorage.setItem('gra_compilation_jobs', JSON.stringify(jobs));
  };

  // Monitor for new submissions and auto-compile
  useEffect(() => {
    if (!settings.enabled) return;

    const checkForNewSubmissions = () => {
      const submittedResults = results.filter(r => 
        r.status === 'submitted' && 
        r.session === currentSession && 
        r.term === currentTerm
      );

      // Group by class and subject
      const submissionGroups: Record<string, any> = {};
      submittedResults.forEach(result => {
        const key = `${result.class_id}-${result.subject_id}`;
        if (!submissionGroups[key]) {
          submissionGroups[key] = {
            classId: result.class_id,
            subjectId: result.subject_id,
            results: []
          };
        }
        submissionGroups[key].results.push(result);
      });

      // Check if any group needs compilation
      Object.values(submissionGroups).forEach((group: any) => {
        const existingJob = compilationJobs.find(job => 
          job.classId === group.classId && 
          job.subjectId === group.subjectId &&
          job.session === currentSession &&
          job.term === currentTerm &&
          (job.status === 'pending' || job.status === 'processing')
        );

        if (!existingJob && group.results.length > 0) {
          // Create compilation job
          startCompilation(group.classId, group.subjectId);
        }
      });
    };

    const interval = setInterval(checkForNewSubmissions, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [settings.enabled, results, currentSession, currentTerm, compilationJobs]);

  const startCompilation = async (classId: string, subjectId: string) => {
    const classInfo = classes.find(c => c.id === classId);
    const subjectInfo = subjects.find(s => s.id === subjectId);
    const classStudents = students.filter(s => s.class_id === classId && s.is_active);

    if (!classInfo || !subjectInfo) return;

    const job: CompilationJob = {
      id: `compilation-${Date.now()}`,
      classId,
      className: classInfo.name,
      subjectId,
      subjectName: subjectInfo.name,
      session: currentSession,
      term: currentTerm,
      status: 'pending',
      totalStudents: classStudents.length,
      processedStudents: 0,
      progress: 0,
      startedAt: new Date().toISOString(),
      errors: []
    };

    const updatedJobs = [job, ...compilationJobs];
    saveJobs(updatedJobs);

    // Start processing after delay
    setTimeout(() => {
      processCompilation(job.id);
    }, settings.compilationDelay * 60 * 1000);

    toast.info(`Compilation scheduled for ${classInfo.name} - ${subjectInfo.name}`);
  };

  const processCompilation = async (jobId: string) => {
    const job = compilationJobs.find(j => j.id === jobId);
    if (!job) return;

    // Update status to processing
    const updatedJobs = compilationJobs.map(j => 
      j.id === jobId ? { ...j, status: 'processing' as const } : j
    );
    saveJobs(updatedJobs);

    try {
      setIsRunning(true);

      // Get results for this class and subject
      const classResults = results.filter(r => 
        r.class_id === job.classId && 
        r.subject_id === job.subjectId &&
        r.session === job.session &&
        r.term === job.term &&
        r.status === 'submitted'
      );

      let processedCount = 0;
      const errors: string[] = [];

      // Process each result
      for (const result of classResults) {
        try {
          // Calculate total score (Test1: 20%, Test2: 20%, Exam: 60%)
          const test1Weight = (result.test1_score || 0) * 0.2;
          const test2Weight = (result.test2_score || 0) * 0.2;
          const examWeight = (result.exam_score || 0) * 0.6;
          const totalScore = test1Weight + test2Weight + examWeight;
          const percentage = Math.round(totalScore);

          // Calculate grade
          const grade = calculateGrade(percentage);

          // Update result
          const updatedResults = results.map(r => 
            r.id === result.id 
              ? { 
                  ...r, 
                  total_score: Math.round(totalScore),
                  percentage,
                  grade,
                  status: settings.autoApprove ? 'approved' : 'submitted'
                }
              : r
          );

          // This would normally update the database
          // For demo, we'll update local state
          processedCount++;

          // Update progress
          const progress = Math.round((processedCount / job.totalStudents) * 100);
          const jobUpdates = compilationJobs.map(j => 
            j.id === jobId 
              ? { ...j, processedStudents: processedCount, progress }
              : j
          );
          saveJobs(jobUpdates);

          // Simulate processing delay
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          errors.push(`Error processing student ${result.student_id}: ${error}`);
        }
      }

      // Calculate positions if enabled
      if (settings.autoCalculatePositions) {
        await calculatePositions(job.classId, job.subjectId);
      }

      // Complete the job
      const finalJobs = compilationJobs.map(j => 
        j.id === jobId 
          ? { 
              ...j, 
              status: 'completed' as const,
              completedAt: new Date().toISOString(),
              errors 
            }
          : j
      );
      saveJobs(finalJobs);

      if (settings.notifyOnCompletion) {
        toast.success(`Compilation completed for ${job.className} - ${job.subjectName}`);
      }

      // Auto-generate PDFs if enabled
      if (settings.autoGeneratePDFs) {
        // This would trigger PDF generation
        toast.info(`PDF generation started for ${job.className} - ${job.subjectName}`);
      }

    } catch (error) {
      // Mark job as failed
      const failedJobs = compilationJobs.map(j => 
        j.id === jobId 
          ? { 
              ...j, 
              status: 'failed' as const,
              errors: [`Compilation failed: ${error}`]
            }
          : j
      );
      saveJobs(failedJobs);
      toast.error(`Compilation failed for ${job.className} - ${job.subjectName}`);
    } finally {
      setIsRunning(false);
    }
  };

  const calculatePositions = async (classId: string, subjectId: string) => {
    // Get all results for this class and subject
    const classResults = results.filter(r => 
      r.class_id === classId && 
      r.subject_id === subjectId &&
      r.session === currentSession &&
      r.term === currentTerm
    );

    // Sort by percentage (highest first)
    const sortedResults = classResults.sort((a, b) => (b.percentage || 0) - (a.percentage || 0));

    // Assign positions
    sortedResults.forEach((result, index) => {
      result.position = index + 1;
    });

    toast.info('Positions calculated successfully');
  };

  const calculateGrade = (percentage: number): string => {
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    return 'F';
  };

  const retryFailedJob = (jobId: string) => {
    const job = compilationJobs.find(j => j.id === jobId);
    if (job) {
      const updatedJobs = compilationJobs.map(j => 
        j.id === jobId 
          ? { ...j, status: 'pending' as const, errors: [] }
          : j
      );
      saveJobs(updatedJobs);
      
      setTimeout(() => {
        processCompilation(jobId);
      }, 1000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  // Get compilation statistics
  const stats = {
    totalJobs: compilationJobs.length,
    completedJobs: compilationJobs.filter(j => j.status === 'completed').length,
    failedJobs: compilationJobs.filter(j => j.status === 'failed').length,
    processingJobs: compilationJobs.filter(j => j.status === 'processing').length,
    successRate: compilationJobs.length > 0 
      ? Math.round((compilationJobs.filter(j => j.status === 'completed').length / compilationJobs.length) * 100)
      : 0
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only administrators can access the auto-compilation system.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
            <Calculator className="h-5 w-5 sm:h-6 sm:w-6" />
            Auto Result Compilation System
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Automatically process supervisor submitted results</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={settings.enabled ? "default" : "secondary"} className="flex items-center gap-1">
            {settings.enabled ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            {settings.enabled ? 'Active' : 'Paused'}
          </Badge>
          {isRunning && (
            <Badge className="bg-blue-50 text-blue-600 flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Processing
            </Badge>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.totalJobs}</p>
            <p className="text-xs text-muted-foreground">Total Jobs</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.completedJobs}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-yellow-100 flex items-center justify-center">
              <RefreshCw className="h-4 w-4 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.processingJobs}</p>
            <p className="text-xs text-muted-foreground">Processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.failedJobs}</p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.successRate}%</p>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="jobs">Compilation Jobs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Recent Compilation Jobs
              </CardTitle>
              <CardDescription>
                Monitor automatic result compilation progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compilationJobs.slice(0, 10).map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(job.status)}
                            <Badge className={getStatusColor(job.status)}>
                              {job.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{job.className}</TableCell>
                        <TableCell>{job.subjectName}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress value={job.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground">{job.progress}%</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {job.processedStudents}/{job.totalStudents}
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(job.startedAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {job.status === 'failed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => retryFailedJob(job.id)}
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            )}
                            {job.errors.length > 0 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toast.error(job.errors.join(', '))}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {compilationJobs.length === 0 && (
                <div className="text-center py-12">
                  <Calculator className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No compilation jobs yet</p>
                  <p className="text-sm text-muted-foreground">Jobs will appear here when supervisors submit results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Compilation Settings</CardTitle>
              <CardDescription>
                Configure how results are automatically processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Enable Auto-Compilation</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically process submitted results
                    </p>
                  </div>
                  <Button
                    variant={settings.enabled ? "default" : "outline"}
                    onClick={() => saveSettings({ ...settings, enabled: !settings.enabled })}
                  >
                    {settings.enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Auto-Approve Results</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically approve compiled results
                    </p>
                  </div>
                  <Button
                    variant={settings.autoApprove ? "default" : "outline"}
                    onClick={() => saveSettings({ ...settings, autoApprove: !settings.autoApprove })}
                  >
                    {settings.autoApprove ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Auto-Calculate Positions</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically calculate student positions
                    </p>
                  </div>
                  <Button
                    variant={settings.autoCalculatePositions ? "default" : "outline"}
                    onClick={() => saveSettings({ ...settings, autoCalculatePositions: !settings.autoCalculatePositions })}
                  >
                    {settings.autoCalculatePositions ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Auto-Generate PDFs</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically generate PDF results
                    </p>
                  </div>
                  <Button
                    variant={settings.autoGeneratePDFs ? "default" : "outline"}
                    onClick={() => saveSettings({ ...settings, autoGeneratePDFs: !settings.autoGeneratePDFs })}
                  >
                    {settings.autoGeneratePDFs ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Notify on Completion</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications when compilation completes
                    </p>
                  </div>
                  <Button
                    variant={settings.notifyOnCompletion ? "default" : "outline"}
                    onClick={() => saveSettings({ ...settings, notifyOnCompletion: !settings.notifyOnCompletion })}
                  >
                    {settings.notifyOnCompletion ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}