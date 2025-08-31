import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner@2.0.3';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Printer, 
  Users, 
  BookOpen,
  TrendingUp,
  Eye,
  Download,
  Send
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { motion } from 'motion/react';

interface ScoreEntry {
  id: string;
  student_id: string;
  student_name: string;
  subject_id: string;
  subject_name: string;
  class_id: string;
  class_name: string;
  test1: number;
  test2: number;
  exam: number;
  total: number;
  grade: string;
  term: string;
  session: string;
  submitted_by: string;
  submitted_at: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'printed';
  reviewed_by?: string;
  reviewed_at?: string;
  approved_by?: string;
  approved_at?: string;
}

interface WorkflowStatus {
  total_scores: number;
  pending_review: number;
  approved: number;
  ready_to_print: number;
  completed: number;
}

export const EnhancedScoreWorkflowSystem: React.FC = () => {
  const { user } = useAuth();
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>({
    total_scores: 0,
    pending_review: 0,
    approved: 0,
    ready_to_print: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [selectedSession, setSelectedSession] = useState('2024/2025');

  useEffect(() => {
    loadScoreData();
  }, [selectedTerm, selectedSession]);

  const loadScoreData = async () => {
    setLoading(true);
    try {
      // Load from localStorage for demo
      const localScores = localStorage.getItem('graceland_scores_workflow');
      let scoresData: ScoreEntry[] = [];
      
      if (localScores) {
        scoresData = JSON.parse(localScores);
      } else {
        // Create demo data
        scoresData = generateDemoScores();
        localStorage.setItem('graceland_scores_workflow', JSON.stringify(scoresData));
      }

      // Filter by term and session
      const filteredScores = scoresData.filter(score => 
        score.term === selectedTerm && score.session === selectedSession
      );

      setScores(filteredScores);
      updateWorkflowStatus(filteredScores);
    } catch (error) {
      console.error('Error loading score data:', error);
      toast.error('Failed to load score data');
    } finally {
      setLoading(false);
    }
  };

  const generateDemoScores = (): ScoreEntry[] => {
    const students = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'];
    const subjects = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology'];
    const classes = ['JSS 1A', 'JSS 2A', 'SS 1A'];
    const terms = ['First Term', 'Second Term', 'Third Term'];
    const sessions = ['2024/2025'];
    const statuses: Array<'draft' | 'submitted' | 'approved' | 'rejected' | 'printed'> = 
      ['draft', 'submitted', 'approved', 'rejected', 'printed'];

    const demoScores: ScoreEntry[] = [];

    students.forEach((student, studentIndex) => {
      subjects.forEach((subject, subjectIndex) => {
        classes.forEach((className, classIndex) => {
          terms.forEach((term, termIndex) => {
            const test1 = Math.floor(Math.random() * 20) + 1;
            const test2 = Math.floor(Math.random() * 20) + 1;
            const exam = Math.floor(Math.random() * 60) + 1;
            const total = test1 + test2 + exam;
            
            let grade = 'F';
            if (total >= 70) grade = 'A';
            else if (total >= 60) grade = 'B';
            else if (total >= 50) grade = 'C';
            else if (total >= 40) grade = 'D';
            else if (total >= 35) grade = 'E';

            const score: ScoreEntry = {
              id: `${studentIndex}-${subjectIndex}-${classIndex}-${termIndex}`,
              student_id: `STU${studentIndex + 1}`,
              student_name: student,
              subject_id: `SUB${subjectIndex + 1}`,
              subject_name: subject,
              class_id: `CLS${classIndex + 1}`,
              class_name: className,
              test1,
              test2,
              exam,
              total,
              grade,
              term,
              session: '2024/2025',
              submitted_by: `teacher${subjectIndex + 1}`,
              submitted_at: new Date().toISOString(),
              status: statuses[Math.floor(Math.random() * statuses.length)],
            };

            if (score.status === 'approved' || score.status === 'printed') {
              score.reviewed_by = `supervisor${classIndex + 1}`;
              score.reviewed_at = new Date().toISOString();
              score.approved_by = 'admin';
              score.approved_at = new Date().toISOString();
            }

            demoScores.push(score);
          });
        });
      });
    });

    return demoScores;
  };

  const updateWorkflowStatus = (scoresData: ScoreEntry[]) => {
    const status: WorkflowStatus = {
      total_scores: scoresData.length,
      pending_review: scoresData.filter(s => s.status === 'submitted').length,
      approved: scoresData.filter(s => s.status === 'approved').length,
      ready_to_print: scoresData.filter(s => s.status === 'approved').length,
      completed: scoresData.filter(s => s.status === 'printed').length,
    };
    setWorkflowStatus(status);
  };

  const handleApproveScore = async (scoreId: string) => {
    setLoading(true);
    try {
      const updatedScores = scores.map(score => {
        if (score.id === scoreId && score.status === 'submitted') {
          return {
            ...score,
            status: 'approved' as const,
            approved_by: user?.id || 'admin',
            approved_at: new Date().toISOString(),
          };
        }
        return score;
      });

      setScores(updatedScores);
      localStorage.setItem('graceland_scores_workflow', JSON.stringify(updatedScores));
      updateWorkflowStatus(updatedScores);
      toast.success('Score approved successfully');
    } catch (error) {
      console.error('Error approving score:', error);
      toast.error('Failed to approve score');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintResults = async (classId: string) => {
    setLoading(true);
    try {
      const updatedScores = scores.map(score => {
        if (score.class_id === classId && score.status === 'approved') {
          return {
            ...score,
            status: 'printed' as const,
          };
        }
        return score;
      });

      setScores(updatedScores);
      localStorage.setItem('graceland_scores_workflow', JSON.stringify(updatedScores));
      updateWorkflowStatus(updatedScores);
      toast.success('Results printed successfully');
    } catch (error) {
      console.error('Error printing results:', error);
      toast.error('Failed to print results');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800">Pending Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'printed':
        return <Badge className="bg-purple-100 text-purple-800">Printed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'submitted':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'printed':
        return <Printer className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const groupScoresByClass = () => {
    const grouped: { [key: string]: ScoreEntry[] } = {};
    scores.forEach(score => {
      if (!grouped[score.class_id]) {
        grouped[score.class_id] = [];
      }
      grouped[score.class_id].push(score);
    });
    return grouped;
  };

  const getClassCompletionRate = (classScores: ScoreEntry[]) => {
    const approvedOrPrinted = classScores.filter(s => 
      s.status === 'approved' || s.status === 'printed'
    ).length;
    return Math.round((approvedOrPrinted / classScores.length) * 100);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy">Score Workflow Management</h2>
          <p className="text-gray-600">Monitor and manage the complete scoring workflow</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="First Term">First Term</option>
            <option value="Second Term">Second Term</option>
            <option value="Third Term">Third Term</option>
          </select>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="2024/2025">2024/2025</option>
            <option value="2023/2024">2023/2024</option>
          </select>
        </div>
      </div>

      {/* Workflow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Scores</p>
                <p className="text-2xl font-bold">{workflowStatus.total_scores}</p>
              </div>
              <FileText className="w-8 h-8 text-white/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Pending Review</p>
                <p className="text-2xl font-bold">{workflowStatus.pending_review}</p>
              </div>
              <Clock className="w-8 h-8 text-white/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Approved</p>
                <p className="text-2xl font-bold">{workflowStatus.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-white/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Ready to Print</p>
                <p className="text-2xl font-bold">{workflowStatus.ready_to_print}</p>
              </div>
              <Printer className="w-8 h-8 text-white/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-navy to-blue-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Completed</p>
                <p className="text-2xl font-bold">{workflowStatus.completed}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-white/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Ready to Print</TabsTrigger>
          <TabsTrigger value="class-overview">Class Overview</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-navy">
                <Eye className="w-5 h-5 mr-2" />
                Scores Pending Approval ({workflowStatus.pending_review})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading scores...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-navy text-white">
                        <th className="border border-gray-300 px-4 py-2 text-left">Student</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Subject</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Class</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Test 1</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Test 2</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Exam</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Total</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Grade</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scores
                        .filter(score => score.status === 'submitted')
                        .map((score) => (
                          <motion.tr 
                            key={score.id} 
                            className="hover:bg-gray-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <td className="border border-gray-300 px-4 py-2">{score.student_name}</td>
                            <td className="border border-gray-300 px-4 py-2">{score.subject_name}</td>
                            <td className="border border-gray-300 px-4 py-2">{score.class_name}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{score.test1}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{score.test2}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{score.exam}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center font-bold">{score.total}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              <Badge variant={score.grade === 'A' ? 'default' : 'outline'}>{score.grade}</Badge>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {getStatusBadge(score.status)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveScore(score.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                            </td>
                          </motion.tr>
                        ))}
                    </tbody>
                  </table>
                  {scores.filter(score => score.status === 'submitted').length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
                      <p className="text-gray-500">No scores pending approval</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-navy">
                <Printer className="w-5 h-5 mr-2" />
                Results Ready for Printing ({workflowStatus.ready_to_print})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(groupScoresByClass()).map(([classId, classScores]) => {
                const approvedScores = classScores.filter(s => s.status === 'approved');
                if (approvedScores.length === 0) return null;

                return (
                  <motion.div
                    key={classId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border rounded-lg mb-4 bg-green-50 border-green-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-navy">
                          {approvedScores[0].class_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {approvedScores.length} approved scores ready for printing
                        </p>
                        <div className="mt-2">
                          <Progress 
                            value={getClassCompletionRate(classScores)} 
                            className="w-48 h-2" 
                          />
                          <span className="text-xs text-gray-500 mt-1 block">
                            {getClassCompletionRate(classScores)}% completion rate
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handlePrintResults(classId)}
                        className="bg-navy hover:bg-navy/80 text-white"
                        disabled={loading}
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Print Results
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="class-overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(groupScoresByClass()).map(([classId, classScores]) => (
              <Card key={classId} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-navy/10 to-gold/10 rounded-bl-full"></div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-navy">{classScores[0].class_name}</CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{classScores.length} total scores</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completion Rate</span>
                      <span className="font-bold text-navy">{getClassCompletionRate(classScores)}%</span>
                    </div>
                    <Progress value={getClassCompletionRate(classScores)} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <p className="text-xs text-blue-600">Submitted</p>
                        <p className="font-bold text-blue-800">
                          {classScores.filter(s => s.status === 'submitted').length}
                        </p>
                      </div>
                      <div className="bg-green-50 p-2 rounded text-center">
                        <p className="text-xs text-green-600">Approved</p>
                        <p className="font-bold text-green-800">
                          {classScores.filter(s => s.status === 'approved').length}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-navy">
                <TrendingUp className="w-5 h-5 mr-2" />
                Completed Results ({workflowStatus.completed})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(groupScoresByClass()).map(([classId, classScores]) => {
                  const printedScores = classScores.filter(s => s.status === 'printed');
                  if (printedScores.length === 0) return null;

                  return (
                    <motion.div
                      key={classId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg bg-purple-50 border-purple-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-navy">
                            {printedScores[0].class_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {printedScores.length} results printed
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-purple-100 text-purple-800">
                            Completed
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-navy border-navy hover:bg-navy hover:text-white"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedScoreWorkflowSystem;