import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
  Globe, 
  Users, 
  Lock, 
  Eye, 
  BarChart3, 
  Settings, 
  Download,
  Share2,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  Shield,
  Activity,
  Zap,
  Clock,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { SchoolWebsite } from './SchoolWebsite';
import { LoginPage } from '../LoginPage';
import { DashboardRenderer } from '../DashboardRenderer';
import { toast } from 'sonner@2.0.3';

// Types
interface WebsiteAnalytics {
  totalVisitors: number;
  activeUsers: number;
  pageViews: number;
  bounceRate: number;
  avgSessionTime: string;
  topPages: { page: string; views: number; }[];
  deviceBreakdown: { device: string; percentage: number; }[];
}

interface SyncStatus {
  lastSync: string;
  status: 'synced' | 'syncing' | 'error';
  pendingChanges: number;
}

// Website Analytics Component
function WebsiteAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<WebsiteAnalytics>({
    totalVisitors: 12847,
    activeUsers: 247,
    pageViews: 45382,
    bounceRate: 32.5,
    avgSessionTime: '3m 42s',
    topPages: [
      { page: 'Homepage', views: 18500 },
      { page: 'Admissions', views: 8200 },
      { page: 'Academics', views: 6800 },
      { page: 'About Us', views: 5200 },
      { page: 'Contact', views: 3400 }
    ],
    deviceBreakdown: [
      { device: 'Mobile', percentage: 65 },
      { device: 'Desktop', percentage: 28 },
      { device: 'Tablet', percentage: 7 }
    ]
  });

  const [realTimeData, setRealTimeData] = useState({
    currentVisitors: 24,
    conversions: 8,
    inquiries: 5
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        currentVisitors: prev.currentVisitors + Math.floor(Math.random() * 5) - 2,
        conversions: prev.conversions + Math.floor(Math.random() * 3),
        inquiries: prev.inquiries + Math.floor(Math.random() * 2)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Live Visitors</p>
                <p className="text-2xl font-bold text-green-600">{realTimeData.currentVisitors}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Visitors</p>
                <p className="text-2xl font-bold">{analytics.totalVisitors.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% vs last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Page Views</p>
                <p className="text-2xl font-bold">{analytics.pageViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-accent-foreground" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                Avg: 3.5 pages/session
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inquiries</p>
                <p className="text-2xl font-bold text-blue-600">{realTimeData.inquiries}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <span className="text-xs text-blue-600">
                +{realTimeData.conversions} conversions today
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>How visitors access our website</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.deviceBreakdown.map((device, index) => (
                <div key={device.device} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {device.device === 'Mobile' && <Smartphone className="h-4 w-4" />}
                      {device.device === 'Desktop' && <Monitor className="h-4 w-4" />}
                      {device.device === 'Tablet' && <Tablet className="h-4 w-4" />}
                      <span className="font-medium">{device.device}</span>
                    </div>
                    <span className="font-medium">{device.percentage}%</span>
                  </div>
                  <Progress value={device.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPages.map((page, index) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{page.page}</span>
                  </div>
                  <span className="text-muted-foreground">{page.views.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

// Real-time Sync Manager Component
function RealTimeSyncManager() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: new Date().toLocaleTimeString(),
    status: 'synced',
    pendingChanges: 0
  });

  const [autoSync, setAutoSync] = useState(true);

  const performSync = async () => {
    setSyncStatus(prev => ({ ...prev, status: 'syncing' }));
    
    try {
      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSyncStatus({
        lastSync: new Date().toLocaleTimeString(),
        status: 'synced',
        pendingChanges: 0
      });
      
      toast.success('Website data synchronized successfully');
    } catch (error) {
      setSyncStatus(prev => ({ ...prev, status: 'error' }));
      toast.error('Sync failed. Please try again.');
    }
  };

  // Auto-sync every 5 minutes
  useEffect(() => {
    if (!autoSync) return;
    
    const interval = setInterval(() => {
      if (syncStatus.status !== 'syncing') {
        performSync();
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoSync, syncStatus.status]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className={`h-5 w-5 ${syncStatus.status === 'syncing' ? 'animate-spin' : ''}`} />
          Real-time Synchronization
        </CardTitle>
        <CardDescription>
          Keep website and dashboard data in sync
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Last sync:</span>
            <span className="text-sm font-medium">{syncStatus.lastSync}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Status:</span>
            <Badge variant={syncStatus.status === 'synced' ? 'default' : syncStatus.status === 'error' ? 'destructive' : 'secondary'}>
              {syncStatus.status === 'synced' && 'Synchronized'}
              {syncStatus.status === 'syncing' && 'Syncing...'}
              {syncStatus.status === 'error' && 'Error'}
            </Badge>
          </div>

          {syncStatus.pendingChanges > 0 && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                {syncStatus.pendingChanges} changes pending synchronization
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={performSync} 
              disabled={syncStatus.status === 'syncing'}
              size="sm"
              className="gap-2"
            >
              {syncStatus.status === 'syncing' ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Sync Now
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoSync(!autoSync)}
              className="gap-2"
            >
              <Zap className="h-3 w-3" />
              Auto-sync: {autoSync ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Website Management Component
function WebsiteManagement() {
  const { user } = useAuth();
  const [websiteEnabled, setWebsiteEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  if (user?.role !== 'admin') {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Website management is available for administrators only.
        </AlertDescription>
      </Alert>
    );
  }

  const toggleWebsite = () => {
    setWebsiteEnabled(!websiteEnabled);
    toast.success(`Website ${!websiteEnabled ? 'enabled' : 'disabled'} successfully`);
  };

  const toggleMaintenance = () => {
    setMaintenanceMode(!maintenanceMode);
    toast.success(`Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Website Settings</CardTitle>
          <CardDescription>
            Manage public website configuration and accessibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Website Status</h4>
              <p className="text-sm text-muted-foreground">
                Control public access to the school website
              </p>
            </div>
            <Button
              variant={websiteEnabled ? "default" : "outline"}
              onClick={toggleWebsite}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              {websiteEnabled ? 'Online' : 'Offline'}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Maintenance Mode</h4>
              <p className="text-sm text-muted-foreground">
                Show maintenance message to visitors
              </p>
            </div>
            <Button
              variant={maintenanceMode ? "destructive" : "outline"}
              onClick={toggleMaintenance}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              {maintenanceMode ? 'Maintenance' : 'Normal'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <RealTimeSyncManager />

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common website management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="gap-2 h-12">
              <Download className="h-4 w-4" />
              Export Website Data
            </Button>
            <Button variant="outline" className="gap-2 h-12">
              <Share2 className="h-4 w-4" />
              Share Website Link
            </Button>
            <Button variant="outline" className="gap-2 h-12">
              <BarChart3 className="h-4 w-4" />
              View Full Analytics
            </Button>
            <Button variant="outline" className="gap-2 h-12">
              <ExternalLink className="h-4 w-4" />
              Preview Website
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Website Integration Component
export function WebsiteIntegration() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'website' | 'dashboard' | 'login' | 'management'>('website');
  const [showManagement, setShowManagement] = useState(false);

  // Handle navigation between website and dashboard
  const handleNavigation = (section: string) => {
    switch (section) {
      case 'login':
        setCurrentView('login');
        break;
      case 'dashboard':
        if (user) {
          setCurrentView('dashboard');
        } else {
          setCurrentView('login');
        }
        break;
      case 'management':
        if (user?.role === 'admin') {
          setCurrentView('management');
        }
        break;
      default:
        setCurrentView('website');
    }
  };

  // Website Management Button (for admins)
  const ManagementToggle = () => {
    if (!user || user.role !== 'admin') return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed top-20 left-4 z-50"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowManagement(!showManagement)}
          className="gap-2 bg-card/95 backdrop-blur-sm"
        >
          <Settings className="h-3 w-3" />
          Website Admin
        </Button>

        <AnimatePresence>
          {showManagement && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-12 left-0 bg-card border rounded-lg shadow-lg p-2 min-w-[200px]"
            >
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation('management')}
                  className="w-full justify-start gap-2"
                >
                  <Settings className="h-3 w-3" />
                  Manage Website
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation('dashboard')}
                  className="w-full justify-start gap-2"
                >
                  <BarChart3 className="h-3 w-3" />
                  View Analytics
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation('website')}
                  className="w-full justify-start gap-2"
                >
                  <Globe className="h-3 w-3" />
                  View Website
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {currentView === 'website' && (
          <motion.div
            key="website"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SchoolWebsite onNavigate={handleNavigation} />
          </motion.div>
        )}

        {currentView === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center"
          >
            <LoginPage />
          </motion.div>
        )}

        {currentView === 'dashboard' && user && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DashboardRenderer user={user} />
          </motion.div>
        )}

        {currentView === 'management' && user?.role === 'admin' && (
          <motion.div
            key="management"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen p-6"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Website Management</h1>
                  <p className="text-muted-foreground">
                    Monitor and manage the school website
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleNavigation('website')}
                  className="gap-2"
                >
                  <Globe className="h-4 w-4" />
                  View Website
                </Button>
              </div>

              <div className="space-y-6">
                <WebsiteAnalyticsDashboard />
                <WebsiteManagement />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ManagementToggle />
    </div>
  );
}

export default WebsiteIntegration;