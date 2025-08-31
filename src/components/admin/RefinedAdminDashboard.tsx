import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Settings,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  BarChart3,
  Calendar,
  Printer,
  Shield,
  Zap,
  Activity,
  TrendingUp,
  Award,
  Target,
  Clock,
  CheckCircle,
  Eye,
  Edit,
  Plus
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNavigation } from '../Layout';
import { ComprehensiveAdminSettings } from './ComprehensiveAdminSettings';
import { AdminResultPrintingSystem } from './AdminResultPrintingSystem';
import { BroadsheetAnalytics } from './BroadsheetAnalytics';
import { RemarksSystem } from './RemarksSystem';
import { AutomationSystem } from './AutomationSystem';

export function RefinedAdminDashboard() {
  const { 
    user,
    students,
    classes,
    subjects,
    staff,
    results,
    currentSession,
    currentTerm
  } = useAuth();

  const { currentView } = useNavigation();
  const [activeFeature, setActiveFeature] = useState('overview');

  // Calculate statistics
  const stats = {
    totalStudents: students?.filter(s => s.is_active).length || 0,
    totalClasses: classes?.filter(c => c.is_active).length || 0,
    totalSubjects: subjects?.filter(s => s.is_active).length || 0,
    totalStaff: staff?.filter(s => s.is_active).length || 0,
    pendingResults: results?.filter(r => r.status === 'submitted').length || 0,
    approvedResults: results?.filter(r => r.status === 'approved').length || 0,
    systemHealth: 95
  };

  // Render based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'settings':
        return <ComprehensiveAdminSettings />;
      case 'pdf-printing':
        return <AdminResultPrintingSystem />;
      case 'broadsheet':
        return <BroadsheetAnalytics />;
      case 'remarks':
        return <RemarksSystem />;
      case 'automation':
        return <AutomationSystem />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Administrator Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive school management and oversight</p>
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
          <Badge className="flex items-center gap-1 bg-green-50 text-green-600 border-green-200">
            <Activity className="h-3 w-3" />
            System Active
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
              <p className="text-xs text-muted-foreground">Students</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.totalClasses}</p>
              <p className="text-xs text-muted-foreground">Classes</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-yellow-100 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats.totalSubjects}</p>
              <p className="text-xs text-muted-foreground">Subjects</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{stats.totalStaff}</p>
              <p className="text-xs text-muted-foreground">Staff</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingResults}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.approvedResults}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="cursor-pointer hover:shadow-md transition-all border-dashed border-2 hover:border-solid hover:border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">System Settings</h3>
              <p className="text-sm text-muted-foreground mb-3">Configure all system settings and preferences</p>
              <Button size="sm" className="w-full">
                <Settings className="h-3 w-3 mr-2" />
                Open Settings
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="cursor-pointer hover:shadow-md transition-all border-dashed border-2 hover:border-solid hover:border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                <Printer className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Print Results</h3>
              <p className="text-sm text-muted-foreground mb-3">Generate PDF result printouts for students</p>
              <Button size="sm" className="w-full" variant="outline">
                <Printer className="h-3 w-3 mr-2" />
                Print PDFs
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="cursor-pointer hover:shadow-md transition-all border-dashed border-2 hover:border-solid hover:border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-sm text-muted-foreground mb-3">View comprehensive academic analytics</p>
              <Button size="sm" className="w-full" variant="outline">
                <BarChart3 className="h-3 w-3 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="cursor-pointer hover:shadow-md transition-all border-dashed border-2 hover:border-solid hover:border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-100 flex items-center justify-center">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">Automation</h3>
              <p className="text-sm text-muted-foreground mb-3">Manage automated tasks and processes</p>
              <Button size="sm" className="w-full" variant="outline">
                <Zap className="h-3 w-3 mr-2" />
                View Tasks
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Real-time system performance monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Overall Health</span>
                <Badge className="bg-green-50 text-green-600">{stats.systemHealth}%</Badge>
              </div>
              <Progress value={stats.systemHealth} className="h-2" />
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Activity className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-blue-600 font-medium">Active Users</span>
                  </div>
                  <p className="font-bold text-blue-600">{stats.totalStudents + stats.totalStaff}</p>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Uptime</span>
                  </div>
                  <p className="font-bold text-green-600">99.9%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Results approved for Primary 3</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="h-3 w-3 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">New student registered</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="h-3 w-3 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Automated backup completed</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full mt-3">
                <Eye className="h-3 w-3 mr-2" />
                View All Activities
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Student Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Enrolled</span>
                <Badge variant="outline">{stats.totalStudents}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Classes</span>
                <Badge variant="outline">{stats.totalClasses}</Badge>
              </div>
              <Button size="sm" className="w-full mt-3">
                <Plus className="h-3 w-3 mr-2" />
                Register New Student
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Result Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending Review</span>
                <Badge variant="secondary">{stats.pendingResults}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Approved</span>
                <Badge className="bg-green-50 text-green-600">{stats.approvedResults}</Badge>
              </div>
              <Button size="sm" className="w-full mt-3" variant="outline">
                <Edit className="h-3 w-3 mr-2" />
                Review Results
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Security Score</span>
                <Badge className="bg-green-50 text-green-600">Excellent</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Sessions</span>
                <Badge variant="outline">{stats.totalStaff + 1}</Badge>
              </div>
              <Button size="sm" className="w-full mt-3" variant="outline">
                <Shield className="h-3 w-3 mr-2" />
                Security Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {renderContent()}
    </motion.div>
  );
}