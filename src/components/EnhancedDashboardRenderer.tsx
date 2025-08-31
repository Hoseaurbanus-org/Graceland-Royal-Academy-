import React, { Suspense, lazy, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { 
  Activity,
  Users,
  GraduationCap,
  CreditCard,
  Shield,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Zap,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Search,
  Database,
  Globe,
  Calendar
} from 'lucide-react';
import { useAuth } from './AuthContext';

// Lazy load dashboard components for performance
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const EnhancedSupervisorDashboard = lazy(() => import('./supervisor/EnhancedSupervisorDashboard'));
const EnhancedAccountantDashboard = lazy(() => import('./accountant/EnhancedAccountantDashboard'));
const ClassResultPerformance = lazy(() => import('./admin/ClassResultPerformance'));
const BroadsheetAnalytics = lazy(() => import('./admin/BroadsheetAnalytics'));
const RemarksSystem = lazy(() => import('./admin/RemarksSystem'));
const AutomationSystem = lazy(() => import('./admin/AutomationSystem'));
const AdvancedAnalyticsSystem = lazy(() => import('./admin/AdvancedAnalyticsSystem'));
const ComprehensiveParentDashboard = lazy(() => import('./parent/ComprehensiveParentDashboard'));

// Enhanced loading component with feature indicators
function EnhancedLoadingFallback({ feature }: { feature?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-8 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <h3 className="text-lg font-semibold text-primary mb-2">Loading {feature || 'Dashboard'}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Initializing enhanced features and real-time data...
          </p>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span>Real-time Tracking</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>Automation</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Analytics</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Security</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced error boundary for dashboard components
function EnhancedErrorFallback({ error, retry, feature }: { error: Error; retry: () => void; feature?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">
            {feature || 'Dashboard'} Error
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            There was an issue loading this feature. This might be due to a temporary connectivity issue.
          </p>
          
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {error.message || 'An unexpected error occurred'}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Button onClick={retry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced dashboard renderer with advanced routing
interface EnhancedDashboardRendererProps {
  user: any;
}

export function EnhancedDashboardRenderer({ user }: EnhancedDashboardRendererProps) {
  const { 
    students, 
    classes, 
    subjects, 
    results, 
    payments, 
    currentSession, 
    currentTerm 
  } = useAuth();
  
  const [currentFeature, setCurrentFeature] = useState('dashboard');
  const [featureStats, setFeatureStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalSubjects: 0,
    systemHealth: 100
  });

  // Calculate real-time statistics
  useEffect(() => {
    const calculateStats = () => {
      const totalStudents = students?.filter(s => s.is_active).length || 0;
      const totalClasses = classes?.filter(c => c.is_active).length || 0;
      const totalSubjects = subjects?.filter(s => s.is_active).length || 0;
      const approvedResults = results?.filter(r => r.status === 'approved').length || 0;
      
      // Calculate system health based on data completeness
      const dataCompleteness = totalStudents > 0 && totalClasses > 0 && totalSubjects > 0 ? 100 : 75;
      const resultCompleteness = totalStudents > 0 ? Math.min(100, (approvedResults / totalStudents) * 100) : 100;
      const systemHealth = Math.round((dataCompleteness + resultCompleteness) / 2);
      
      setFeatureStats({
        totalStudents,
        totalClasses,
        totalSubjects,
        systemHealth
      });
    };

    calculateStats();
    
    // Update stats every 30 seconds for real-time tracking
    const interval = setInterval(calculateStats, 30000);
    return () => clearInterval(interval);
  }, [students, classes, subjects, results]);

  // Feature routing based on user role and navigation
  const renderFeatureComponent = () => {
    try {
      switch (user.role) {
        case 'admin':
          return renderAdminFeatures();
        case 'supervisor':
          return renderSupervisorFeatures();
        case 'accountant':
          return renderAccountantFeatures();
        case 'parent':
          return renderParentFeatures();
        default:
          return renderDefaultDashboard();
      }
    } catch (error) {
      return (
        <EnhancedErrorFallback 
          error={error as Error} 
          retry={() => window.location.reload()} 
          feature={user.role + ' Dashboard'}
        />
      );
    }
  };

  // Admin feature routing with all advanced capabilities
  const renderAdminFeatures = () => {
    // In a real implementation, you'd get currentFeature from navigation context
    // For now, defaulting to main dashboard
    const feature = currentFeature || 'dashboard';
    
    switch (feature) {
      case 'performance':
        return (
          <Suspense fallback={<EnhancedLoadingFallback feature="Class Performance" />}>
            <ClassResultPerformance />
          </Suspense>
        );
      case 'broadsheet':
        return (
          <Suspense fallback={<EnhancedLoadingFallback feature="Broadsheet Analytics" />}>
            <BroadsheetAnalytics />
          </Suspense>
        );
      case 'remarks':
        return (
          <Suspense fallback={<EnhancedLoadingFallback feature="Remarks System" />}>
            <RemarksSystem />
          </Suspense>
        );
      case 'automation':
        return (
          <Suspense fallback={<EnhancedLoadingFallback feature="Automation System" />}>
            <AutomationSystem />
          </Suspense>
        );
      case 'analytics':
        return (
          <Suspense fallback={<EnhancedLoadingFallback feature="Advanced Analytics" />}>
            <AdvancedAnalyticsSystem />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<EnhancedLoadingFallback feature="Admin Dashboard" />}>
            <AdminDashboard />
          </Suspense>
        );
    }
  };

  // Supervisor feature routing
  const renderSupervisorFeatures = () => {
    return (
      <Suspense fallback={<EnhancedLoadingFallback feature="Supervisor Dashboard" />}>
        <EnhancedSupervisorDashboard />
      </Suspense>
    );
  };

  // Accountant feature routing
  const renderAccountantFeatures = () => {
    return (
      <Suspense fallback={<EnhancedLoadingFallback feature="Accountant Dashboard" />}>
        <EnhancedAccountantDashboard />
      </Suspense>
    );
  };

  // Parent feature routing
  const renderParentFeatures = () => {
    return (
      <Suspense fallback={<EnhancedLoadingFallback feature="Parent Dashboard" />}>
        <ComprehensiveParentDashboard />
      </Suspense>
    );
  };

  // Default dashboard for unknown roles
  const renderDefaultDashboard = () => {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your account role is not recognized. Please contact the administrator for assistance.
            </p>
            <Badge variant="outline">{user.role || 'Unknown Role'}</Badge>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Enhanced dashboard wrapper with system information
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen relative"
    >
      {/* System Status Header (for admins only) */}
      {user.role === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border p-2"
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-green-500" />
                <span>System: Active</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{featureStats.totalStudents} Students</span>
              </div>
              <div className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                <span>{featureStats.totalClasses} Classes</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                <span>Health: {featureStats.systemHealth}%</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {currentSession} - {currentTerm}
              </Badge>
              <Badge variant={featureStats.systemHealth > 90 ? "default" : "secondary"} className="text-xs">
                Enhanced Features Active
              </Badge>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Dashboard Content */}
      <div className="relative">
        {renderFeatureComponent()}
      </div>

      {/* Feature Availability Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-16 left-4 z-20 bg-card/90 backdrop-blur-sm border rounded-lg p-2 text-xs text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>Enhanced Features</span>
          <div className="flex items-center gap-1 ml-2">
            {/* Feature indicators based on user role */}
            {user.role === 'admin' && (
              <>
                <TrendingUp className="h-3 w-3" title="Analytics" />
                <MessageSquare className="h-3 w-3" title="Remarks" />
                <Zap className="h-3 w-3" title="Automation" />
                <Search className="h-3 w-3" title="Advanced Search" />
                <Database className="h-3 w-3" title="Past Results" />
                <Globe className="h-3 w-3" title="Website" />
              </>
            )}
            {user.role === 'supervisor' && (
              <>
                <BarChart3 className="h-3 w-3" title="Performance" />
                <MessageSquare className="h-3 w-3" title="Remarks" />
                <Activity className="h-3 w-3" title="Real-time" />
              </>
            )}
            {user.role === 'accountant' && (
              <>
                <CreditCard className="h-3 w-3" title="Payments" />
                <BarChart3 className="h-3 w-3" title="Reports" />
                <Database className="h-3 w-3" title="Archives" />
              </>
            )}
            {user.role === 'parent' && (
              <>
                <TrendingUp className="h-3 w-3" title="Analytics" />
                <CreditCard className="h-3 w-3" title="Payments" />
                <Database className="h-3 w-3" title="History" />
                <Calendar className="h-3 w-3" title="Calendar" />
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default EnhancedDashboardRenderer;