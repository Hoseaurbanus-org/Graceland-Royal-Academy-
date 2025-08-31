import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { 
  Home, 
  User, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Menu,
  Bell,
  Search,
  Plus,
  ChevronRight,
  Smartphone,
  Download,
  Share,
  Star,
  Zap,
  Shield,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { SchoolLogo } from '../SchoolLogo';
import { toast } from 'sonner@2.0.3';

// Mobile Navigation Component
function MobileBottomNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'academics', label: 'Academics', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden"
    >
      <div className="grid grid-cols-5 gap-1 p-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "default" : "ghost"}
            size="sm"
            className="flex flex-col gap-1 h-auto py-2"
            onClick={() => onTabChange(item.id)}
          >
            <item.icon className="h-4 w-4" />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </motion.div>
  );
}

// Mobile Header Component
function MobileHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  const { user } = useAuth();
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-40 md:hidden"
    >
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 text-xs text-muted-foreground bg-primary/5">
        <div className="flex items-center gap-2">
          <Signal className="h-3 w-3" />
          <Wifi className="h-3 w-3" />
          <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-center gap-1">
          <Battery className="h-3 w-3" />
          <span>{batteryLevel}%</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onMenuOpen}>
            <Menu className="h-5 w-5" />
          </Button>
          <SchoolLogo size="sm" showText={false} />
          <div>
            <h1 className="text-primary">GRA Mobile</h1>
            <p className="text-xs text-muted-foreground">Welcome, {user?.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
              3
            </Badge>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Mobile Quick Actions
function MobileQuickActions() {
  const quickActions = [
    { 
      id: 'view-results', 
      label: 'View Results', 
      icon: BarChart3, 
      color: 'bg-chart-1 text-white',
      action: () => toast.success('Results opened')
    },
    { 
      id: 'make-payment', 
      label: 'Make Payment', 
      icon: Plus, 
      color: 'bg-chart-2 text-white',
      action: () => toast.success('Payment portal opened')
    },
    { 
      id: 'view-calendar', 
      label: 'Calendar', 
      icon: BookOpen, 
      color: 'bg-chart-3 text-white',
      action: () => toast.success('Calendar opened')
    },
    { 
      id: 'contact-school', 
      label: 'Contact', 
      icon: User, 
      color: 'bg-chart-4 text-white',
      action: () => toast.success('Contact info opened')
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-4 gap-3 p-4"
    >
      {quickActions.map((action, index) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="ghost"
            className={`w-full h-20 flex flex-col gap-2 ${action.color} hover:opacity-90`}
            onClick={action.action}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-xs">{action.label}</span>
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Mobile App Features
function MobileAppFeatures() {
  const appFeatures = [
    {
      id: 'offline-sync',
      name: 'Offline Sync',
      description: 'Access your data even without internet',
      icon: Download,
      available: true
    },
    {
      id: 'push-notifications',
      name: 'Push Notifications',
      description: 'Get notified about important updates',
      icon: Bell,
      available: true
    },
    {
      id: 'biometric-auth',
      name: 'Biometric Authentication',
      description: 'Secure login with fingerprint or face ID',
      icon: Shield,
      available: true
    },
    {
      id: 'dark-mode',
      name: 'Dark Mode',
      description: 'Easy on the eyes night mode',
      icon: Settings,
      available: true
    },
    {
      id: 'voice-commands',
      name: 'Voice Commands',
      description: 'Control the app with voice',
      icon: Zap,
      available: false,
      comingSoon: true
    },
    {
      id: 'ar-features',
      name: 'AR Learning Tools',
      description: 'Augmented reality educational content',
      icon: Star,
      available: false,
      comingSoon: true
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="px-4">Mobile App Features</h3>
      <div className="space-y-2 px-4">
        {appFeatures.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`${!feature.available ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${feature.available ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <feature.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4>{feature.name}</h4>
                      {feature.available && <Badge variant="default" className="text-xs">Available</Badge>}
                      {feature.comingSoon && <Badge variant="outline" className="text-xs">Coming Soon</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Mobile Statistics
function MobileStatistics() {
  const [stats, setStats] = useState({
    screenTime: '2h 34m',
    notifications: 12,
    lastSync: 'Just now',
    batteryOptimized: true
  });

  return (
    <div className="space-y-4">
      <h3 className="px-4">App Statistics</h3>
      <div className="grid grid-cols-2 gap-3 px-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Smartphone className="h-6 w-6 mx-auto mb-2 text-chart-1" />
            <p className="text-sm text-muted-foreground">Screen Time</p>
            <p>{stats.screenTime}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Bell className="h-6 w-6 mx-auto mb-2 text-chart-2" />
            <p className="text-sm text-muted-foreground">Notifications</p>
            <p>{stats.notifications}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Download className="h-6 w-6 mx-auto mb-2 text-chart-3" />
            <p className="text-sm text-muted-foreground">Last Sync</p>
            <p>{stats.lastSync}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Battery className="h-6 w-6 mx-auto mb-2 text-chart-4" />
            <p className="text-sm text-muted-foreground">Battery</p>
            <p>{stats.batteryOptimized ? 'Optimized' : 'Standard'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main Mobile App Shell Component
export function MobileAppShell() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // PWA Installation
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (installPrompt) {
      const result = await installPrompt.prompt();
      if (result.outcome === 'accepted') {
        toast.success('App installed successfully!');
        setInstallPrompt(null);
      }
    } else {
      toast.info('App is already installed or not available for installation on this device');
    }
  };

  const tabContent = {
    home: (
      <div className="space-y-6 pb-20">
        <MobileQuickActions />
        
        {/* Install App Prompt */}
        {installPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4"
          >
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                    <Download className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4>Install GRA Mobile App</h4>
                    <p className="text-sm text-muted-foreground">Get faster access and offline features</p>
                  </div>
                  <Button size="sm" onClick={handleInstallApp}>
                    Install
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <MobileAppFeatures />
        <MobileStatistics />
      </div>
    ),
    academics: (
      <div className="p-4 pb-20">
        <div className="space-y-4">
          <h2>Academic Overview</h2>
          <Card>
            <CardContent className="p-4">
              <p className="text-center text-muted-foreground">Academic content will be displayed here</p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
    analytics: (
      <div className="p-4 pb-20">
        <div className="space-y-4">
          <h2>Performance Analytics</h2>
          <Card>
            <CardContent className="p-4">
              <p className="text-center text-muted-foreground">Analytics dashboard for mobile view</p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
    profile: (
      <div className="p-4 pb-20">
        <div className="space-y-4">
          <h2>User Profile</h2>
          <Card>
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3>{user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Badge className="mt-2">{user?.role}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
    settings: (
      <div className="p-4 pb-20">
        <div className="space-y-4">
          <h2>App Settings</h2>
          <div className="space-y-2">
            {[
              { label: 'Notifications', icon: Bell },
              { label: 'Privacy & Security', icon: Shield },
              { label: 'Data & Storage', icon: Download },
              { label: 'Share App', icon: Share },
              { label: 'About', icon: Settings }
            ].map((setting, index) => (
              <Card key={setting.label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <setting.icon className="h-5 w-5 text-muted-foreground" />
                    <span>{setting.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-background md:hidden">
      {/* Mobile Header */}
      <MobileHeader onMenuOpen={() => setSideMenuOpen(true)} />

      {/* Side Menu */}
      <Sheet open={sideMenuOpen} onOpenChange={setSideMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <SchoolLogo size="sm" showText={false} />
              <div>
                <h3 className="text-primary">Graceland Royal Academy</h3>
                <p className="text-xs text-muted-foreground">Mobile Application</p>
              </div>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {[
                { label: 'Dashboard', icon: Home },
                { label: 'Results', icon: BarChart3 },
                { label: 'Calendar', icon: BookOpen },
                { label: 'Payments', icon: Plus },
                { label: 'Settings', icon: Settings }
              ].map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => setSideMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {tabContent[activeTab as keyof typeof tabContent]}
          </motion.div>
        </AnimatePresence>
      </ScrollArea>

      {/* Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default MobileAppShell;