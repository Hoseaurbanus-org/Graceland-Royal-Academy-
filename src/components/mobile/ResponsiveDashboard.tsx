import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  BarChart3, 
  Users, 
  GraduationCap,
  TrendingUp,
  Activity,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  List,
  Eye,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { MobileAppShell } from './MobileAppShell';

// Device Detection Hook
function useDeviceDetection() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      setOrientation(width > height ? 'landscape' : 'portrait');
      
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);
    
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return { deviceType, screenSize, orientation };
}

// Responsive Stats Card Component
function ResponsiveStatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  change, 
  deviceType 
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  color: string;
  change?: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}) {
  const cardSize = {
    mobile: 'p-3',
    tablet: 'p-4',
    desktop: 'p-6'
  };

  const iconSize = {
    mobile: 'h-4 w-4',
    tablet: 'h-5 w-5',
    desktop: 'h-6 w-6'
  };

  return (
    <motion.div
      whileHover={{ scale: deviceType === 'mobile' ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className={cardSize[deviceType]}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className={`${color}`}>{value}</p>
              {change && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {change}
                </p>
              )}
            </div>
            <Icon className={`${iconSize[deviceType]} ${color}`} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Adaptive Grid Layout Component
function AdaptiveGridLayout({ 
  children, 
  deviceType 
}: { 
  children: React.ReactNode; 
  deviceType: 'mobile' | 'tablet' | 'desktop' 
}) {
  const gridCols = {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-3 lg:grid-cols-4'
  };

  const spacing = {
    mobile: 'gap-3',
    tablet: 'gap-4',
    desktop: 'gap-6'
  };

  return (
    <div className={`grid ${gridCols[deviceType]} ${spacing[deviceType]}`}>
      {children}
    </div>
  );
}

// Mobile-First Dashboard Component
function MobileDashboard() {
  const { students, results, classes, subjects } = useAuth();
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  const stats = [
    { title: 'Students', value: students.length, icon: Users, color: 'text-chart-1', change: '+5 this week' },
    { title: 'Results', value: results.length, icon: BarChart3, color: 'text-chart-2', change: '12 pending' },
    { title: 'Classes', value: classes.length, icon: GraduationCap, color: 'text-chart-3', change: 'All active' },
    { title: 'Subjects', value: subjects.length, icon: Activity, color: 'text-chart-4', change: 'Full curriculum' }
  ];

  const toggleCollapse = (section: string) => {
    setCollapsed(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1>Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}
          >
            {viewMode === 'cards' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2>Overview</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleCollapse('overview')}
          >
            {collapsed.includes('overview') ? 
              <ChevronDown className="h-4 w-4" /> : 
              <ChevronUp className="h-4 w-4" />
            }
          </Button>
        </div>
        
        <AnimatePresence>
          {!collapsed.includes('overview') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-2 gap-3">
                  {stats.map((stat, index) => (
                    <ResponsiveStatsCard
                      key={stat.title}
                      {...stat}
                      deviceType="mobile"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.map((stat) => (
                    <Card key={stat.title}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <stat.icon className={`h-4 w-4 ${stat.color}`} />
                          <div className="flex-1">
                            <p className="text-sm">{stat.title}</p>
                            <p className="text-xs text-muted-foreground">{stat.change}</p>
                          </div>
                          <Badge variant="outline">{stat.value}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2>Recent Activity</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleCollapse('activity')}
          >
            {collapsed.includes('activity') ? 
              <ChevronDown className="h-4 w-4" /> : 
              <ChevronUp className="h-4 w-4" />
            }
          </Button>
        </div>
        
        <AnimatePresence>
          {!collapsed.includes('activity') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {[
                      { action: 'New results submitted', time: '2 min ago', type: 'result' },
                      { action: 'Student registered', time: '1 hour ago', type: 'student' },
                      { action: 'Payment processed', time: '3 hours ago', type: 'payment' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="flex-1">
                          <p className="text-sm">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Tablet Dashboard Component
function TabletDashboard() {
  const { students, results, classes, subjects } = useAuth();
  
  const stats = [
    { title: 'Students', value: students.length, icon: Users, color: 'text-chart-1', change: '+5 this week' },
    { title: 'Results', value: results.length, icon: BarChart3, color: 'text-chart-2', change: '12 pending' },
    { title: 'Classes', value: classes.length, icon: GraduationCap, color: 'text-chart-3', change: 'All active' },
    { title: 'Subjects', value: subjects.length, icon: Activity, color: 'text-chart-4', change: 'Full curriculum' }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1>Dashboard</h1>
        <Badge className="px-3 py-1">
          <Tablet className="h-4 w-4 mr-2" />
          Tablet View
        </Badge>
      </div>

      {/* Stats Grid */}
      <AdaptiveGridLayout deviceType="tablet">
        {stats.map((stat, index) => (
          <ResponsiveStatsCard
            key={stat.title}
            {...stat}
            deviceType="tablet"
          />
        ))}
      </AdaptiveGridLayout>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Overall Performance</span>
                <Badge>78%</Badge>
              </div>
              <Progress value={78} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Student Engagement</span>
                <Badge>85%</Badge>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Users className="h-6 w-6" />
                <span className="text-sm">Manage Students</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">View Results</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <GraduationCap className="h-6 w-6" />
                <span className="text-sm">Classes</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Settings className="h-6 w-6" />
                <span className="text-sm">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Desktop Dashboard Component
function DesktopDashboard() {
  const { students, results, classes, subjects } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const stats = [
    { title: 'Students', value: students.length, icon: Users, color: 'text-chart-1', change: '+5 this week' },
    { title: 'Results', value: results.length, icon: BarChart3, color: 'text-chart-2', change: '12 pending' },
    { title: 'Classes', value: classes.length, icon: GraduationCap, color: 'text-chart-3', change: 'All active' },
    { title: 'Subjects', value: subjects.length, icon: Activity, color: 'text-chart-4', change: 'Full curriculum' }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1>Administrative Dashboard</h1>
        <div className="flex items-center gap-3">
          <Badge className="px-3 py-1">
            <Monitor className="h-4 w-4 mr-2" />
            Desktop View
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <AdaptiveGridLayout deviceType="desktop">
        {stats.map((stat, index) => (
          <ResponsiveStatsCard
            key={stat.title}
            {...stat}
            deviceType="desktop"
          />
        ))}
      </AdaptiveGridLayout>

      {/* Advanced Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Comprehensive view of academic performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Mathematics', 'English', 'Science', 'Social Studies'].map((subject) => (
                  <div key={subject} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>{subject}</span>
                      <Badge variant="outline">
                        {Math.floor(Math.random() * 30 + 70)}%
                      </Badge>
                    </div>
                    <Progress value={Math.floor(Math.random() * 30 + 70)} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm">All systems operational</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm">Database synced</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-sm">3 pending updates</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Add New Student
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Main Responsive Dashboard Component
export function ResponsiveDashboard() {
  const { deviceType, screenSize, orientation } = useDeviceDetection();
  const [debugMode, setDebugMode] = useState(false);

  // Show different components based on device type
  if (deviceType === 'mobile') {
    return <MobileAppShell />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: debugMode ? 1 : 0.7 }}
          className="fixed top-4 right-4 z-50 bg-card border rounded-lg p-3 text-xs"
          onMouseEnter={() => setDebugMode(true)}
          onMouseLeave={() => setDebugMode(false)}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {deviceType === 'mobile' && <Smartphone className="h-3 w-3" />}
              {deviceType === 'tablet' && <Tablet className="h-3 w-3" />}
              {deviceType === 'desktop' && <Monitor className="h-3 w-3" />}
              <span className="capitalize">{deviceType}</span>
            </div>
            <p>Screen: {screenSize.width}×{screenSize.height}</p>
            <p>Orientation: {orientation}</p>
            <Badge variant="outline" className="text-xs h-4">
              Responsive Mode
            </Badge>
          </div>
        </motion.div>
      )}

      {/* Render appropriate dashboard */}
      <AnimatePresence mode="wait">
        <motion.div
          key={deviceType}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {deviceType === 'tablet' && <TabletDashboard />}
          {deviceType === 'desktop' && <DesktopDashboard />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default ResponsiveDashboard;