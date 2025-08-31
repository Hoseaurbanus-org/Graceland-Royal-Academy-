import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { 
  Menu, 
  Bell, 
  Settings, 
  User, 
  Home,
  Users,
  GraduationCap,
  FileText,
  Calendar,
  BarChart3,
  CreditCard,
  School,
  BookOpen,
  LogOut,
  ChevronRight,
  Target,
  Shield
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { SchoolLogo, CompactSchoolLogo } from './SchoolLogo';
import { LogoutButton } from './LogoutButton';

// Navigation Context
interface NavigationContextType {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, currentSession, currentTerm } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  if (!user) return <>{children}</>;

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'supervisor': return 'Supervisor';
      case 'accountant': return 'Accountant';
      case 'parent': return 'Parent';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'supervisor': return 'bg-green-100 text-green-800 border-green-200';
      case 'accountant': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'parent': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Navigation items based on role
  const getNavigationItems = () => {
    const baseItems = [
      { 
        icon: Home, 
        label: 'Dashboard', 
        id: 'dashboard',
        description: 'Main overview and quick actions'
      }
    ];

    const adminItems = [
      { icon: School, label: 'Academic Structure', id: 'academic', description: 'Manage classes and subjects' },
      { icon: Users, label: 'Staff Management', id: 'staff', description: 'Add and manage staff members' },
      { icon: GraduationCap, label: 'Student Management', id: 'students', description: 'Register and manage students' },
      { icon: Target, label: 'Subject Assignment', id: 'assignments', description: 'Assign subjects to classes' },
      { icon: FileText, label: 'Result Management', id: 'results', description: 'Review and approve results' },
      { icon: Calendar, label: 'Session & Terms', id: 'sessions', description: 'Academic periods management' },
      { icon: BarChart3, label: 'Reports & Analytics', id: 'analytics', description: 'System analytics and reports' },
      { icon: Shield, label: 'System Settings', id: 'settings', description: 'System configuration' }
    ];

    const supervisorItems = [
      { icon: BookOpen, label: 'My Assignments', id: 'assignments', description: 'View assigned classes and subjects' },
      { icon: FileText, label: 'Record Results', id: 'results', description: 'Enter student scores and results' },
      { icon: GraduationCap, label: 'My Students', id: 'students', description: 'View assigned students' },
      { icon: BarChart3, label: 'Performance Reports', id: 'performance', description: 'Student performance analytics' },
      { icon: Calendar, label: 'Academic Calendar', id: 'calendar', description: 'Important academic dates' }
    ];

    const accountantItems = [
      { icon: CreditCard, label: 'Payment Management', id: 'payments', description: 'Manage fee payments' },
      { icon: BarChart3, label: 'Financial Reports', id: 'reports', description: 'Financial analytics and reports' },
      { icon: Users, label: 'Student Accounts', id: 'accounts', description: 'Student financial accounts' },
      { icon: Calendar, label: 'Fee Calendar', id: 'calendar', description: 'Payment schedules and deadlines' },
      { icon: FileText, label: 'Fee Management', id: 'fees', description: 'Fee structure and billing' }
    ];

    const parentItems = [
      { icon: GraduationCap, label: 'My Children', id: 'children', description: 'View child information' },
      { icon: FileText, label: 'Academic Results', id: 'results', description: 'View approved results' },
      { icon: CreditCard, label: 'Fee Payments', id: 'payments', description: 'Make school fee payments' },
      { icon: Calendar, label: 'School Calendar', id: 'calendar', description: 'Important dates and events' },
      { icon: BarChart3, label: 'Progress Reports', id: 'progress', description: 'Academic progress tracking' }
    ];

    let items = [...baseItems];

    switch (user.role) {
      case 'admin':
        items.push(...adminItems);
        break;
      case 'supervisor':
        items.push(...supervisorItems);
        break;
      case 'accountant':
        items.push(...accountantItems);
        break;
      case 'parent':
        items.push(...parentItems);
        break;
    }

    return items;
  };

  const navigationItems = getNavigationItems();

  // Handle navigation click
  const handleNavigation = (itemId: string) => {
    setCurrentView(itemId);
    if (mobileMenuOpen) setMobileMenuOpen(false);
    
    // Import toast and show feedback
    import('sonner@2.0.3').then(({ toast }) => {
      const item = navigationItems.find(nav => nav.id === itemId);
      toast.success(`Switched to ${item?.label || itemId}`);
    });
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full bg-card">
      {/* Header with School Logo */}
      <div className="p-4 sm:p-6 border-b border-border bg-primary/5">
        <SchoolLogo size={isMobile ? "sm" : "md"} showText={true} />
        <div className="mt-3">
          <p className="text-sm font-medium text-primary">Excellence in Education</p>
          <p className="text-xs text-muted-foreground">Wisdom & Illumination</p>
        </div>
      </div>

      {/* Current Session/Term */}
      <div className="p-3 sm:p-4 border-b border-border bg-academic-gold/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Current Session</p>
            <p className="font-medium text-sm text-primary">{currentSession || '2024/2025'}</p>
            <p className="text-xs text-academic-gold">{currentTerm || 'First Term'}</p>
          </div>
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-3 sm:p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user.name}</p>
            <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>
              {getRoleDisplayName(user.role)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <nav className="space-y-1 sm:space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              className={`w-full justify-start h-auto px-3 py-3 transition-all duration-200 hover:bg-primary/10 hover:text-primary group text-sm ${
                currentView === item.id ? 'bg-primary text-primary-foreground shadow-md' : ''
              }`}
              onClick={() => handleNavigation(item.id)}
            >
              <item.icon className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform flex-shrink-0" />
              <div className="text-left flex-1">
                <div className="font-medium">{item.label}</div>
                {!isMobile && item.description && (
                  <div className={`text-xs opacity-70 ${currentView === item.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {item.description}
                  </div>
                )}
              </div>
              <ChevronRight className="h-3 w-3 ml-auto opacity-50 hidden sm:block" />
            </Button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-border bg-muted/30">
        <div className="space-y-2 sm:space-y-3">
          <Button
            variant={currentView === 'settings' ? "default" : "ghost"}
            size="sm"
            className="w-full justify-start text-sm"
            onClick={() => handleNavigation('settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <LogoutButton variant="outline" size="sm" className="w-full" />
        </div>
        
        {/* School Branding Footer */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <CompactSchoolLogo className="mx-auto" />
        </div>
      </div>
    </div>
  );

  return (
    <NavigationContext.Provider value={{ currentView, setCurrentView }}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Desktop Layout */}
        <div className="hidden lg:flex h-screen">
          {/* Sidebar */}
          <div className="w-72 border-r border-border shadow-lg">
            <SidebarContent />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="border-b border-border bg-card/80 backdrop-blur-sm shadow-sm">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <SchoolLogo size="sm" showText={false} />
                    <div>
                      <h1 className="text-xl font-semibold text-primary">
                        {getRoleDisplayName(user.role)} Dashboard
                      </h1>
                      <p className="text-xs text-muted-foreground">
                        {navigationItems.find(item => item.id === currentView)?.description || 'Welcome to your dashboard'}
                      </p>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs border-primary/30">
                      {currentSession || '2024/2025'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-academic-gold/20 text-academic-gold">
                      {currentTerm || 'First Term'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Notification Bell */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative hover:bg-primary/10"
                    onClick={() => handleNavigation('notifications')}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </Button>

                  {/* User Info & Logout */}
                  <div className="flex items-center space-x-3">
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <LogoutButton variant="outline" size="sm" showText={false} />
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {children}
              </motion.div>
            </main>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Mobile Header */}
          <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-3">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <SidebarContent isMobile={true} />
                  </SheetContent>
                </Sheet>
                
                <CompactSchoolLogo />
              </div>

              <div className="flex items-center space-x-2">
                {/* Mobile Notification Bell */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  onClick={() => handleNavigation('notifications')}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>

                {/* Mobile Logout */}
                <LogoutButton 
                  variant="ghost" 
                  size="sm" 
                  showText={false}
                  className="w-8 h-8 p-0"
                />
              </div>
            </div>

            {/* Mobile Session Info */}
            <div className="px-4 py-2 bg-primary/5 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span className="text-muted-foreground">Session:</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    {currentSession || '2024/2025'}
                  </Badge>
                  <Badge variant="secondary" className="text-xs px-2 py-0 bg-academic-gold/20 text-academic-gold">
                    {currentTerm || 'First Term'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Mobile User Info */}
            <div className="px-4 py-2 bg-muted/30 border-t border-border">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{getRoleDisplayName(user.role)}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Mobile Main Content */}
          <main className="min-h-screen">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </NavigationContext.Provider>
  );
}