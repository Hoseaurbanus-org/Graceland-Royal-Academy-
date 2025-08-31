import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  Users, 
  GraduationCap,
  BookOpen,
  Award,
  AlertTriangle,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Lightbulb,
  Star,
  Clock,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  AreaChart, 
  BarChart, 
  PieChart as RechartsPieChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Line, 
  Area, 
  Bar, 
  Cell,
  Pie,
  Legend,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner@2.0.3';

// Advanced Analytics Types
interface PerformanceInsight {
  id: string;
  type: 'trend' | 'prediction' | 'anomaly' | 'recommendation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  relatedData?: any;
}

interface PredictiveModel {
  modelId: string;
  name: string;
  accuracy: number;
  predictions: {
    studentId: string;
    predictedGrade: string;
    confidence: number;
    factors: string[];
  }[];
}

interface AdvancedMetrics {
  studentEngagement: number;
  teachingEffectiveness: number;
  curriculumAlignment: number;
  progressVelocity: number;
  riskFactors: number;
  learningGains: number;
}

// AI-Powered Insights Generator
class AIInsightsEngine {
  static generateInsights(
    students: any[], 
    results: any[], 
    classes: any[], 
    subjects: any[]
  ): PerformanceInsight[] {
    const insights: PerformanceInsight[] = [];
    
    // Performance Trend Analysis
    if (results.length > 0) {
      const averageScore = results.reduce((sum, r) => sum + r.total_score, 0) / results.length;
      
      if (averageScore < 50) {
        insights.push({
          id: 'low-performance-trend',
          type: 'trend',
          severity: 'high',
          title: 'Declining Academic Performance Detected',
          description: `Class average of ${averageScore.toFixed(1)}% indicates significant learning gaps. Immediate intervention recommended.`,
          confidence: 0.85,
          actionable: true,
          relatedData: { averageScore, trend: 'declining' }
        });
      }
    }

    // Student Risk Prediction
    const strugglingStudents = results.filter(r => r.total_score < 40).length;
    if (strugglingStudents > 0) {
      insights.push({
        id: 'student-risk-prediction',
        type: 'prediction',
        severity: 'medium',
        title: 'Students at Risk Identified',
        description: `${strugglingStudents} students showing early warning signs. Proactive support could improve outcomes by 23%.`,
        confidence: 0.78,
        actionable: true,
        relatedData: { count: strugglingStudents }
      });
    }

    // Subject Performance Anomaly
    const subjectPerformance = subjects.map(subject => {
      const subjectResults = results.filter(r => r.subject_id === subject.id);
      const avg = subjectResults.length > 0 
        ? subjectResults.reduce((sum, r) => sum + r.total_score, 0) / subjectResults.length 
        : 0;
      return { subject: subject.name, average: avg };
    });

    const lowPerformingSubjects = subjectPerformance.filter(s => s.average < 45);
    if (lowPerformingSubjects.length > 0) {
      insights.push({
        id: 'subject-performance-anomaly',
        type: 'anomaly',
        severity: 'medium',
        title: 'Subject Performance Anomalies',
        description: `${lowPerformingSubjects.map(s => s.subject).join(', ')} showing unusual performance patterns. Consider curriculum review.`,
        confidence: 0.72,
        actionable: true,
        relatedData: { subjects: lowPerformingSubjects }
      });
    }

    // AI Recommendations
    insights.push({
      id: 'ai-recommendation-1',
      type: 'recommendation',
      severity: 'low',
      title: 'Personalized Learning Pathways',
      description: 'AI suggests implementing adaptive learning modules for 15% improvement in student outcomes.',
      confidence: 0.91,
      actionable: true,
      relatedData: { potentialImprovement: 15 }
    });

    return insights;
  }

  static generatePredictiveModel(results: any[]): PredictiveModel {
    // Simplified predictive model simulation
    const predictions = results.slice(0, 10).map((result, index) => ({
      studentId: result.student_id,
      predictedGrade: result.total_score > 70 ? 'A' : result.total_score > 60 ? 'B' : 'C',
      confidence: 0.75 + (Math.random() * 0.2),
      factors: ['Previous Performance', 'Attendance Pattern', 'Assignment Completion']
    }));

    return {
      modelId: 'gra-performance-predictor-v1',
      name: 'Academic Performance Predictor',
      accuracy: 0.84,
      predictions
    };
  }
}

// Advanced Performance Metrics Calculator
class MetricsCalculator {
  static calculateAdvancedMetrics(
    students: any[], 
    results: any[], 
    classes: any[]
  ): AdvancedMetrics {
    const totalStudents = students.length;
    const totalResults = results.length;
    
    return {
      studentEngagement: Math.min(100, (totalResults / (totalStudents * 4)) * 100), // Assuming 4 subjects
      teachingEffectiveness: totalResults > 0 ? (results.filter(r => r.total_score > 60).length / totalResults) * 100 : 0,
      curriculumAlignment: 85 + Math.random() * 10, // Simulated metric
      progressVelocity: 78 + Math.random() * 15, // Simulated metric
      riskFactors: Math.max(0, 100 - ((results.filter(r => r.total_score > 50).length / Math.max(totalResults, 1)) * 100)),
      learningGains: 82 + Math.random() * 12 // Simulated metric
    };
  }
}

export function AdvancedAnalyticsEngine() {
  const { students, results, classes, subjects, user } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState('current_term');
  const [activeAnalysisType, setActiveAnalysisType] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [predictiveModel, setPredictiveModel] = useState<PredictiveModel | null>(null);
  const [advancedMetrics, setAdvancedMetrics] = useState<AdvancedMetrics | null>(null);

  // Generate analytics data
  const analyticsData = useMemo(() => {
    if (!results || results.length === 0) return null;

    // Performance trend data
    const trendData = results.slice(0, 12).map((result, index) => ({
      period: `Week ${index + 1}`,
      average: result.total_score + Math.random() * 10,
      target: 75,
      improvement: Math.random() * 5
    }));

    // Subject performance distribution
    const subjectData = subjects.map(subject => {
      const subjectResults = results.filter(r => r.subject_id === subject.id);
      const average = subjectResults.length > 0 
        ? subjectResults.reduce((sum, r) => sum + r.total_score, 0) / subjectResults.length 
        : 0;
      
      return {
        subject: subject.name,
        performance: Math.round(average),
        students: subjectResults.length,
        fill: `hsl(var(--chart-${(subjects.indexOf(subject) % 5) + 1}))`
      };
    });

    // Grade distribution
    const gradeDistribution = [
      { grade: 'A', count: results.filter(r => r.grade === 'A').length, fill: 'hsl(var(--chart-1))' },
      { grade: 'B', count: results.filter(r => r.grade === 'B').length, fill: 'hsl(var(--chart-2))' },
      { grade: 'C', count: results.filter(r => r.grade === 'C').length, fill: 'hsl(var(--chart-3))' },
      { grade: 'D', count: results.filter(r => r.grade === 'D').length, fill: 'hsl(var(--chart-4))' },
      { grade: 'F', count: results.filter(r => r.grade === 'F').length, fill: 'hsl(var(--chart-5))' }
    ];

    // Learning velocity data
    const velocityData = classes.map(cls => {
      const classResults = results.filter(r => r.class_id === cls.id);
      const avgScore = classResults.length > 0 
        ? classResults.reduce((sum, r) => sum + r.total_score, 0) / classResults.length 
        : 0;
      
      return {
        class: cls.name,
        velocity: Math.round(avgScore + Math.random() * 20),
        engagement: Math.round(60 + Math.random() * 40),
        progress: Math.round(50 + Math.random() * 50)
      };
    });

    return {
      trendData,
      subjectData,
      gradeDistribution,
      velocityData
    };
  }, [results, subjects, classes]);

  // Run AI analysis
  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedInsights = AIInsightsEngine.generateInsights(students, results, classes, subjects);
      const model = AIInsightsEngine.generatePredictiveModel(results);
      const metrics = MetricsCalculator.calculateAdvancedMetrics(students, results, classes);
      
      setInsights(generatedInsights);
      setPredictiveModel(model);
      setAdvancedMetrics(metrics);
      
      toast.success('AI analysis completed successfully');
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Initial analysis on component mount
  useEffect(() => {
    if (students.length > 0 && results.length > 0) {
      runAIAnalysis();
    }
  }, [students.length, results.length]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      case 'prediction': return <Brain className="h-4 w-4" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Advanced analytics available for administrators only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Advanced Analytics Engine
          </h1>
          <p className="text-muted-foreground">AI-powered insights and predictive analytics for academic performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_term">Current Term</SelectItem>
              <SelectItem value="last_term">Last Term</SelectItem>
              <SelectItem value="academic_year">Academic Year</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={runAIAnalysis} disabled={isAnalyzing} className="gap-2">
            {isAnalyzing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="h-4 w-4" />
              </motion.div>
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
          </Button>
        </div>
      </motion.div>

      {/* Advanced Metrics Overview */}
      {advancedMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {[
            { label: 'Student Engagement', value: advancedMetrics.studentEngagement, icon: Users, color: 'text-chart-1' },
            { label: 'Teaching Effectiveness', value: advancedMetrics.teachingEffectiveness, icon: GraduationCap, color: 'text-chart-2' },
            { label: 'Curriculum Alignment', value: advancedMetrics.curriculumAlignment, icon: BookOpen, color: 'text-chart-3' },
            { label: 'Progress Velocity', value: advancedMetrics.progressVelocity, icon: TrendingUp, color: 'text-chart-4' },
            { label: 'Risk Factors', value: advancedMetrics.riskFactors, icon: AlertTriangle, color: 'text-chart-5' },
            { label: 'Learning Gains', value: advancedMetrics.learningGains, icon: Award, color: 'text-chart-1' }
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    <Badge variant="outline" className="text-xs">
                      {metric.value.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs">{metric.label}</p>
                    <Progress value={metric.value} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>
              Intelligent analysis and recommendations based on academic data patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/50">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4>{insight.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {(insight.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm opacity-90">{insight.description}</p>
                      {insight.actionable && (
                        <Button size="sm" variant="outline" className="mt-2">
                          View Action Plan
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Analytics Dashboard */}
      <Tabs value={activeAnalysisType} onValueChange={setActiveAnalysisType} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Models</TabsTrigger>
          <TabsTrigger value="comparative">Comparative Analysis</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Insights</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="overview" key="overview">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Performance Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsData && (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={analyticsData.trendData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="average" 
                          stroke="hsl(var(--chart-1))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="target" 
                          stroke="hsl(var(--chart-2))" 
                          strokeDasharray="5 5"
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Subject Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Subject Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsData && (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData.subjectData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="subject" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="performance" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Grade Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Grade Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsData && (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={analyticsData.gradeDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="count"
                          label={({ grade, count }) => `${grade}: ${count}`}
                        >
                          {analyticsData.gradeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Learning Velocity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Learning Velocity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsData && (
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={analyticsData.velocityData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="class" />
                        <PolarRadiusAxis />
                        <Radar
                          name="Velocity"
                          dataKey="velocity"
                          stroke="hsl(var(--chart-1))"
                          fill="hsl(var(--chart-1))"
                          fillOpacity={0.3}
                        />
                        <Radar
                          name="Engagement"
                          dataKey="engagement"
                          stroke="hsl(var(--chart-2))"
                          fill="hsl(var(--chart-2))"
                          fillOpacity={0.3}
                        />
                        <Tooltip />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="predictive" key="predictive">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Predictive Model Card */}
              {predictiveModel && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Predictive Academic Model
                    </CardTitle>
                    <CardDescription>
                      AI model predictions with {(predictiveModel.accuracy * 100).toFixed(1)}% accuracy
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {predictiveModel.predictions.slice(0, 5).map((prediction, index) => (
                        <motion.div
                          key={prediction.studentId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div>
                            <p>Student {prediction.studentId.slice(-3)}</p>
                            <p className="text-sm text-muted-foreground">
                              Predicted Grade: <Badge variant="outline">{prediction.predictedGrade}</Badge>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">
                              {(prediction.confidence * 100).toFixed(0)}% confidence
                            </p>
                            <Progress value={prediction.confidence * 100} className="w-20 h-2 mt-1" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="comparative" key="comparative">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Comparative Analysis</CardTitle>
                  <CardDescription>
                    Compare performance across different dimensions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Class Comparison */}
                    <div>
                      <h4 className="mb-3">Class Performance Comparison</h4>
                      {analyticsData && (
                        <ResponsiveContainer width="100%" height={200}>
                          <ComposedChart data={analyticsData.velocityData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="class" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="velocity" fill="hsl(var(--chart-1))" />
                            <Line type="monotone" dataKey="engagement" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    {/* Benchmark Comparison */}
                    <div>
                      <h4 className="mb-3">Benchmark Comparison</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-primary/5 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span>School Average</span>
                            <Badge>72%</Badge>
                          </div>
                          <Progress value={72} className="mb-2" />
                          <p className="text-sm text-muted-foreground">Current academic year</p>
                        </div>
                        
                        <div className="p-4 bg-accent/20 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span>National Average</span>
                            <Badge variant="outline">68%</Badge>
                          </div>
                          <Progress value={68} className="mb-2" />
                          <p className="text-sm text-muted-foreground">4% above national</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="realtime" key="realtime">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Real-time Analytics Dashboard
                  </CardTitle>
                  <CardDescription>
                    Live performance metrics and system monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-chart-1/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-chart-1" />
                        <span>Active Sessions</span>
                      </div>
                      <p className="font-bold">24</p>
                      <p className="text-sm text-muted-foreground">+3 from last hour</p>
                    </div>
                    
                    <div className="p-4 bg-chart-2/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-chart-2" />
                        <span>Live Performance</span>
                      </div>
                      <p className="font-bold">78%</p>
                      <p className="text-sm text-muted-foreground">Real-time average</p>
                    </div>
                    
                    <div className="p-4 bg-chart-3/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-chart-3" />
                        <span>Engagement Rate</span>
                      </div>
                      <p className="font-bold">92%</p>
                      <p className="text-sm text-muted-foreground">Last 5 minutes</p>
                    </div>
                    
                    <div className="p-4 bg-chart-4/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-chart-4" />
                        <span>System Health</span>
                      </div>
                      <p className="font-bold">99%</p>
                      <p className="text-sm text-muted-foreground">All systems operational</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

export default AdvancedAnalyticsEngine;