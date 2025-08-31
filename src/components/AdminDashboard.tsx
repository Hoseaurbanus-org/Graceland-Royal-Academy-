import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  FileText, 
  Settings, 
  Calendar,
  DollarSign,
  TrendingUp,
  BookOpen,
  Shield,
  Crown,
  Lock,
  Bell,
  Activity,
  Database
} from 'lucide-react';
import { EnhancedStudentRegistration } from './admin/EnhancedStudentRegistration';
import { StaffManagement } from './admin/StaffManagement';
import { SubjectManagement } from './admin/SubjectManagement';
import { ClassManagement } from './admin/ClassManagement';
import { ResultApprovalSystem } from './admin/ResultApprovalSystem';
import { ClassResultPerformance } from './admin/ClassResultPerformance';
import { PasswordManagement } from './admin/PasswordManagement';
import { FunctionalQuickActions } from './admin/FunctionalQuickActions';
import { CalendarWidget } from './CalendarWidget';
import { SchoolLogo } from './SchoolLogo';
import { WebsiteAdmin } from './website/WebsiteAdmin';
import { useAuth } from './AuthContext';

export function AdminDashboard() {
  const { students, staff, classes, subjects, results, isConnected } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate statistics
  const stats = {
    totalStudents: students.length,
    totalStaff: staff.length,
    totalClasses: classes.length,
    totalSubjects: subjects.length,
    pendingResults: results.filter(r => r.status === 'submitted').length,
    approvedResults: results.filter(r => r.status === 'approved').length
  };

  const recentActivities = [
    { action: 'System synchronized', user: 'System', time: '1 minute ago', type: 'system' },
    { action: 'New results submitted', user: 'Supervisor', time: '5 minutes ago', type: 'result' },
    { action: 'Student registered', user: 'Admin', time: '15 minutes ago', type: 'student' },
    { action: 'Payment processed', user: 'Accountant', time: '1 hour ago', type: 'payment' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'student': return <Users className="h-4 w-4 text-chart-1" />;
      case 'result': return <FileText className="h-4 w-4 text-chart-3" />;
      case 'payment': return <DollarSign className="h-4 w-4 text-chart-2" />;
      case 'staff': return <UserCheck className="h-4 w-4 text-chart-4" />;
      case 'system': return <Database className="h-4 w-4 text-chart-5" />;
      default: return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="space-y-6">
      {/* School Header with Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-card via-card/95 to-card border border-border/50 rounded-lg p-6 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <SchoolLogo size="lg" showText={true} animated={false} />
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="flex items-center gap-2"
            >
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </motion.div>
            
            <Badge className="bg-primary text-primary-foreground shadow-sm">
              <Crown className="h-4 w-4 mr-2" />
              Administrator
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Administrative Dashboard</h2>
            <p className="text-muted-foreground">
              Manage your school's operations and monitor system performance
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" size="sm" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
              {stats.pendingResults > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                  {stats.pendingResults}
                </Badge>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Quick Start Guide */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Crown className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary mb-2">Administrator Quick Start</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span className="text-muted-foreground">Create staff accounts in the <strong className="text-foreground">Staff tab</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span className="text-muted-foreground">Register students in the <strong className="text-foreground">Students tab</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span className="text-muted-foreground">Student registration auto-creates parent accounts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span className="text-muted-foreground">Change your password in <strong className="text-foreground">Security tab</strong></span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-accent/20 rounded border border-accent/30">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Pro Tip:</strong> Start by creating staff accounts for supervisors and accountants, then register students. Each student registration will automatically create a parent account with dashboard access.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <TabsList className="grid w-full grid-cols-8 bg-muted/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              Students
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              Staff
            </TabsTrigger>
            <TabsTrigger value="academics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              Academics
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              Results
            </TabsTrigger>
            <TabsTrigger value="website" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              Website
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              Security
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              Settings
            </TabsTrigger>
          </TabsList>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          <TabsContent value="overview" key="overview">
            <motion.div
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { 
                    title: "Total Students", 
                    value: stats.totalStudents, 
                    icon: Users, 
                    change: "+12% from last month",
                    color: "text-chart-1"
                  },
                  { 
                    title: "Total Staff", 
                    value: stats.totalStaff, 
                    icon: UserCheck, 
                    change: "+3 new this term",
                    color: "text-chart-2"
                  },
                  { 
                    title: "Classes", 
                    value: stats.totalClasses, 
                    icon: GraduationCap, 
                    change: "Across all levels",
                    color: "text-chart-3"
                  },
                  { 
                    title: "Subjects", 
                    value: stats.totalSubjects, 
                    icon: BookOpen, 
                    change: "Active curriculum",
                    color: "text-chart-4"
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                  >
                    <Card className="hover:shadow-md transition-shadow duration-200">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="inline h-3 w-3" />
                          {stat.change}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <FunctionalQuickActions />
              </motion.div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Activities */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Recent Activities
                      </CardTitle>
                      <CardDescription>Latest system activities and updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivities.map((activity, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + (0.1 * index), duration: 0.3 }}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            {getActivityIcon(activity.type)}
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium">{activity.action}</p>
                              <p className="text-xs text-muted-foreground">
                                by {activity.user} • {activity.time}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Calendar Widget */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <CalendarWidget />
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" key="students">
            <motion.div
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <EnhancedStudentRegistration />
            </motion.div>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" key="staff">
            <motion.div
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <StaffManagement />
            </motion.div>
          </TabsContent>

          {/* Academics Tab */}
          <TabsContent value="academics" key="academics">
            <motion.div
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <SubjectManagement />
                <ClassManagement />
              </div>
            </motion.div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" key="results">
            <motion.div
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <ClassResultPerformance />
              <ResultApprovalSystem />
            </motion.div>
          </TabsContent>

          {/* Website Tab */}
          <TabsContent value="website" key="website">
            <motion.div
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <WebsiteAdmin />
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" key="security">
            <motion.div
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <PasswordManagement />
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" key="settings">
            <motion.div
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Settings
                  </CardTitle>
                  <CardDescription>
                    Configure system-wide settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      {[
                        { icon: Settings, label: "School Configuration", desc: "Manage school information and branding" },
                        { icon: Calendar, label: "Academic Calendar", desc: "Set terms, sessions, and holidays" },
                        { icon: Shield, label: "Security Settings", desc: "Configure access controls and permissions" },
                        { icon: FileText, label: "System Reports", desc: "Generate and download system reports" }
                      ].map((setting, index) => (
                        <motion.div
                          key={setting.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.3 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <Button 
                            variant="outline" 
                            className="w-full justify-start h-auto p-4 hover:bg-muted/50 transition-colors"
                          >
                            <setting.icon className="h-5 w-5 mr-3 text-primary" />
                            <div className="text-left">
                              <div className="font-medium">{setting.label}</div>
                              <div className="text-sm text-muted-foreground">{setting.desc}</div>
                            </div>
                          </Button>
                        </motion.div>
                      ))}
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