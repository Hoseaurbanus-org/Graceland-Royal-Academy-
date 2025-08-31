import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Calendar,
  Bell,
  Users,
  BookOpen,
  FileText,
  BarChart3,
  Shield,
  Database,
  Cpu,
  Activity
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner@2.0.3';

interface AutomationTask {
  id: string;
  name: string;
  description: string;
  type: 'backup' | 'notification' | 'calculation' | 'cleanup' | 'report';
  status: 'active' | 'paused' | 'stopped';
  frequency: 'daily' | 'weekly' | 'monthly' | 'term';
  last_run: string | null;
  next_run: string;
  success_count: number;
  error_count: number;
  enabled: boolean;
}

interface PerformanceMetric {
  id: string;
  metric_name: string;
  current_value: number;
  target_value: number;
  trend: 'up' | 'down' | 'stable';
  category: 'academic' | 'enrollment' | 'financial' | 'operational';
  last_updated: string;
}

function AutomationSystem() {
  const { user, students, classes, results, payments } = useAuth();
  
  const [automationTasks, setAutomationTasks] = useState<AutomationTask[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [systemStatus, setSystemStatus] = useState({
    automation_enabled: true,
    backup_status: 'healthy',
    notification_status: 'healthy',
    performance_status: 'good'
  });

  // Initialize automation tasks
  useEffect(() => {
    const defaultTasks: AutomationTask[] = [
      {
        id: 'task-1',
        name: 'Daily Data Backup',
        description: 'Automatically backup all student and academic data',
        type: 'backup',
        status: 'active',
        frequency: 'daily',
        last_run: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        next_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        success_count: 45,
        error_count: 2,
        enabled: true
      },
      {
        id: 'task-2',
        name: 'Result Position Calculation',
        description: 'Automatically calculate student positions when results are approved',
        type: 'calculation',
        status: 'active',
        frequency: 'daily',
        last_run: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        next_run: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
        success_count: 23,
        error_count: 0,
        enabled: true
      },
      {
        id: 'task-3',
        name: 'Fee Payment Reminders',
        description: 'Send automated payment reminders to parents',
        type: 'notification',
        status: 'active',
        frequency: 'weekly',
        last_run: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        next_run: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        success_count: 8,
        error_count: 1,
        enabled: true
      },
      {
        id: 'task-4',
        name: 'Performance Analytics Update',
        description: 'Update performance metrics and generate insights',
        type: 'report',
        status: 'active',
        frequency: 'daily',
        last_run: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        next_run: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        success_count: 15,
        error_count: 0,
        enabled: true
      },
      {
        id: 'task-5',
        name: 'Session Data Cleanup',
        description: 'Clean up old session data and optimize storage',
        type: 'cleanup',
        status: 'active',
        frequency: 'monthly',
        last_run: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        next_run: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        success_count: 3,
        error_count: 0,
        enabled: true
      }
    ];

    setAutomationTasks(defaultTasks);
  }, []);

  // Calculate performance metrics
  useEffect(() => {
    const calculateMetrics = () => {
      const totalStudents = students.filter(s => s.is_active).length;
      const totalResults = results.filter(r => r.status === 'approved').length;
      const totalPayments = payments.filter(p => p.status === 'completed').length;
      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const metrics: PerformanceMetric[] = [
        {
          id: 'metric-1',
          metric_name: 'Student Enrollment',
          current_value: totalStudents,
          target_value: 500,
          trend: 'up',
          category: 'enrollment',
          last_updated: new Date().toISOString()
        },
        {
          id: 'metric-2',
          metric_name: 'Result Completion Rate',
          current_value: Math.round((totalResults / Math.max(totalStudents * classes.length, 1)) * 100),
          target_value: 95,
          trend: 'up',
          category: 'academic',
          last_updated: new Date().toISOString()
        },
        {
          id: 'metric-3',
          metric_name: 'Payment Success Rate',
          current_value: Math.round((totalPayments / Math.max(totalStudents, 1)) * 100),
          target_value: 90,
          trend: 'stable',
          category: 'financial',
          last_updated: new Date().toISOString()
        },
        {
          id: 'metric-4',
          metric_name: 'Monthly Revenue (₦K)',
          current_value: Math.round(totalRevenue / 1000),
          target_value: 5000,
          trend: 'up',
          category: 'financial',
          last_updated: new Date().toISOString()
        },
        {
          id: 'metric-5',
          metric_name: 'System Efficiency (%)',
          current_value: 92,
          target_value: 95,
          trend: 'stable',
          category: 'operational',
          last_updated: new Date().toISOString()
        }
      ];

      setPerformanceMetrics(metrics);
    };

    calculateMetrics();
  }, [students, results, payments, classes]);

  const toggleTask = (taskId: string) => {
    setAutomationTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, enabled: !task.enabled, status: !task.enabled ? 'active' : 'paused' }
        : task
    ));
    toast.success('Task status updated');
  };

  const runTaskNow = (taskId: string) => {
    setAutomationTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            last_run: new Date().toISOString(),
            success_count: task.success_count + 1,
            status: 'active'
          }
        : task
    ));
    toast.success('Task executed successfully');
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'backup': return Database;
      case 'notification': return Bell;
      case 'calculation': return Calculator;
      case 'cleanup': return RefreshCw;
      case 'report': return BarChart3;
      default: return Settings;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      case 'stopped': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'academic': return BookOpen;
      case 'enrollment': return Users;
      case 'financial': return BarChart3;
      case 'operational': return Cpu;
      default: return Activity;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'down': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'stable': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary">Automation & Performance System</h2>
          <p className="text-muted-foreground">Automated task management and real-time performance tracking</p>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Automation</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasks Running</p>
                <p className="text-2xl font-bold text-blue-600">
                  {automationTasks.filter(t => t.enabled && t.status === 'active').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">96%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold text-green-600">Excellent</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="automation">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="automation">Automation Tasks</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
        </TabsList>

        {/* Automation Tasks */}
        <TabsContent value="automation">
          <div className="space-y-4">
            {automationTasks.map((task) => {
              const Icon = getTaskIcon(task.type);
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 border rounded-lg bg-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{task.name}</h4>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          <Badge variant="outline">
                            {task.frequency}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {task.description}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Last Run</p>
                            <p className="font-medium">
                              {task.last_run 
                                ? new Date(task.last_run).toLocaleString()
                                : 'Never'
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Next Run</p>
                            <p className="font-medium">
                              {new Date(task.next_run).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Success</p>
                            <p className="font-medium text-green-600">{task.success_count}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Errors</p>
                            <p className="font-medium text-red-600">{task.error_count}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={task.enabled}
                          onCheckedChange={() => toggleTask(task.id)}
                        />
                        <Label className="text-sm">Enabled</Label>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runTaskNow(task.id)}
                        disabled={!task.enabled}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Run Now
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Performance Metrics */}
        <TabsContent value="performance">
          <div className="grid gap-6">
            {/* Real-time Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {performanceMetrics.map((metric) => {
                const Icon = getMetricIcon(metric.category);
                const percentage = Math.min((metric.current_value / metric.target_value) * 100, 100);
                
                return (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-primary" />
                            <p className="font-medium">{metric.metric_name}</p>
                          </div>
                          {getTrendIcon(metric.trend)}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">
                              {metric.current_value.toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              / {metric.target_value.toLocaleString()}
                            </span>
                          </div>
                          
                          <Progress value={percentage} className="h-2" />
                          
                          <p className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}% of target achieved
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Excellent Performance:</strong> Student enrollment is trending upward with 
                      {performanceMetrics.find(m => m.metric_name === 'Student Enrollment')?.current_value || 0} active students.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <BarChart3 className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Academic Progress:</strong> Result completion rate is at 
                      {performanceMetrics.find(m => m.metric_name === 'Result Completion Rate')?.current_value || 0}%, 
                      showing strong academic management.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Activity className="h-4 w-4" />
                    <AlertDescription>
                      <strong>System Efficiency:</strong> All automated tasks are running smoothly with 96% success rate.
                      Monthly revenue targets are being consistently met.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AutomationSystem;