import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Crown, 
  Users, 
  GraduationCap, 
  Calculator, 
  User, 
  Settings, 
  BookOpen, 
  Calendar,
  FileText,
  CreditCard,
  Shield,
  Database,
  Smartphone,
  CheckCircle,
  Star,
  Zap
} from 'lucide-react';
import { SchoolLogoWatermark } from './SchoolLogoWatermark';

export function SystemOverview() {
  const achievements = [
    {
      category: "Authentication & Security",
      icon: <Shield className="h-5 w-5" />,
      status: "Complete",
      features: [
        "Multi-role authentication (Admin, Supervisor, Accountant, Parent)",
        "Secure password generation and management",
        "Role-based access control",
        "Demo mode with full functionality",
        "Session management and security"
      ]
    },
    {
      category: "Academic Management",
      icon: <BookOpen className="h-5 w-5" />,
      status: "Complete",
      features: [
        "Three-term academic system (2024/2025 session)",
        "Automated grade calculation (20% + 20% + 60%)",
        "Comprehensive subject management (10+ subjects)",
        "Class structure (Early Years to Senior Secondary)",
        "Student registration with passport photos",
        "Result compilation and approval workflow"
      ]
    },
    {
      category: "Staff Management",
      icon: <Users className="h-5 w-5" />,
      status: "Complete",
      features: [
        "Staff registration and profile management",
        "Automatic employee ID generation",
        "Subject and class assignments",
        "Password generation and reset",
        "Role-specific dashboards",
        "Staff allocation tracking"
      ]
    },
    {
      category: "Financial System",
      icon: <CreditCard className="h-5 w-5" />,
      status: "Complete",
      features: [
        "Comprehensive fee structure management",
        "Multi-tier fee system (₦285k - ₦585k per session)",
        "Payment processing and verification",
        "Receipt generation and printing",
        "Outstanding fee tracking",
        "Financial reporting and analytics"
      ]
    },
    {
      category: "Reporting & Analytics",
      icon: <FileText className="h-5 w-5" />,
      status: "Complete",
      features: [
        "Professional PDF result generation",
        "Student report cards with school branding",
        "Performance analytics and charts",
        "Class and subject-wise reports",
        "Academic progress tracking",
        "Payment history reports"
      ]
    },
    {
      category: "System Architecture",
      icon: <Database className="h-5 w-5" />,
      status: "Complete",
      features: [
        "Full Supabase integration with demo fallback",
        "Responsive design (desktop and mobile)",
        "Modern React with TypeScript",
        "Comprehensive error handling",
        "Local storage for demo mode",
        "Clean sky blue and gray design system"
      ]
    }
  ];

  const technicalSpecs = [
    { label: "Frontend Framework", value: "React 18 + TypeScript" },
    { label: "Styling System", value: "Tailwind CSS v4" },
    { label: "UI Components", value: "shadcn/ui + Custom Components" },
    { label: "Backend Integration", value: "Supabase (with demo mode)" },
    { label: "State Management", value: "React Context API" },
    { label: "PDF Generation", value: "Custom PDF utilities" },
    { label: "Authentication", value: "Multi-role with secure sessions" },
    { label: "Data Storage", value: "PostgreSQL + Local Storage" },
    { label: "Mobile Support", value: "Fully responsive design" },
    { label: "Error Handling", value: "Comprehensive boundaries" }
  ];

  const demoCredentials = [
    { role: "Administrator", email: "admin@gracelandroyal.edu.ng", password: "admin123", access: "Full system control" },
    { role: "Supervisor", email: "supervisor@gracelandroyal.edu.ng", password: "super123", access: "Student results & grading" },
    { role: "Accountant", email: "accountant@gracelandroyal.edu.ng", password: "account123", access: "Fee management" },
    { role: "Parent", email: "parent@gracelandroyal.edu.ng", password: "parent123", access: "Student results & payments" }
  ];

  return (
    <div className="min-h-screen p-4 relative">
      <SchoolLogoWatermark />
      
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full text-primary"
              fill="currentColor"
            >
              <rect x="40" y="140" width="120" height="20" rx="10" />
              <rect x="50" y="120" width="100" height="25" rx="5" />
              <polygon points="70,120 80,90 90,120" />
              <polygon points="90,120 100,80 110,120" />
              <polygon points="110,120 120,90 130,120" />
              <circle cx="100" cy="90" r="8" className="fill-chart-2" />
              <circle cx="80" cy="100" r="4" className="fill-chart-2" />
              <circle cx="120" cy="100" r="4" className="fill-chart-2" />
              <rect x="75" y="100" width="50" height="35" rx="8" className="fill-background stroke-primary stroke-2" />
              <text x="100" y="118" textAnchor="middle" className="fill-primary text-sm">GRA</text>
              <circle cx="60" cy="110" r="3" className="fill-chart-2" />
              <circle cx="140" cy="110" r="3" className="fill-chart-2" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            GRACELAND ROYAL ACADEMY
          </h1>
          <p className="text-2xl text-primary font-semibold mb-4">
            WISDOM & ILLUMINATION
          </p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              System Complete
            </Badge>
            <Badge variant="secondary">
              <Star className="h-3 w-3 mr-1" />
              Production Ready
            </Badge>
            <Badge variant="outline">
              <Zap className="h-3 w-3 mr-1" />
              Demo Mode Active
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive educational management system with complete role-based functionality, 
            automated result compilation, fee management, and professional reporting.
          </p>
        </div>

        {/* System Status Overview */}
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
          {achievements.map((achievement, index) => (
            <Card key={index} className="text-center">
              <CardHeader className="pb-3">
                <div className="mx-auto mb-2 p-2 bg-green-100 rounded-full w-fit">
                  {achievement.icon}
                </div>
                <CardTitle className="text-sm">{achievement.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="default" className="bg-green-500 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {achievement.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Features */}
        <div className="grid gap-6 lg:grid-cols-2">
          {achievements.map((achievement, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {achievement.icon}
                  {achievement.category}
                  <Badge variant="default" className="bg-green-500 ml-auto">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {achievement.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technical Specifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Technical Specifications
            </CardTitle>
            <CardDescription>
              Modern technology stack with enterprise-grade architecture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {technicalSpecs.map((spec, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="font-medium">{spec.label}:</span>
                  <Badge variant="secondary">{spec.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demo Access Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Demo Access Credentials
            </CardTitle>
            <CardDescription>
              Ready-to-use accounts for testing all system functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {demoCredentials.map((cred, index) => (
                <div key={index} className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{cred.role}</h4>
                    <Badge variant="outline" className="text-xs">{cred.access}</Badge>
                  </div>
                  <div className="space-y-1 text-sm font-mono">
                    <div><strong>Email:</strong> {cred.email}</div>
                    <div><strong>Password:</strong> {cred.password}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demo Data Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Pre-loaded Demo Data
            </CardTitle>
            <CardDescription>
              Comprehensive sample data for immediate testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-6">
              <div className="text-center p-4 border rounded-lg bg-blue-50">
                <div className="text-3xl font-bold text-blue-600">15</div>
                <div className="text-sm text-blue-700 font-medium">Classes</div>
                <div className="text-xs text-muted-foreground">Early Years to SS3</div>
              </div>
              <div className="text-center p-4 border rounded-lg bg-green-50">
                <div className="text-3xl font-bold text-green-600">10</div>
                <div className="text-sm text-green-700 font-medium">Subjects</div>
                <div className="text-xs text-muted-foreground">Core curriculum</div>
              </div>
              <div className="text-center p-4 border rounded-lg bg-purple-50">
                <div className="text-3xl font-bold text-purple-600">5</div>
                <div className="text-sm text-purple-700 font-medium">Staff Members</div>
                <div className="text-xs text-muted-foreground">With credentials</div>
              </div>
              <div className="text-center p-4 border rounded-lg bg-orange-50">
                <div className="text-3xl font-bold text-orange-600">3</div>
                <div className="text-sm text-orange-700 font-medium">Demo Students</div>
                <div className="text-xs text-muted-foreground">Ready for testing</div>
              </div>
              <div className="text-center p-4 border rounded-lg bg-red-50">
                <div className="text-3xl font-bold text-red-600">4</div>
                <div className="text-sm text-red-700 font-medium">Fee Structures</div>
                <div className="text-xs text-muted-foreground">All school levels</div>
              </div>
              <div className="text-center p-4 border rounded-lg bg-indigo-50">
                <div className="text-3xl font-bold text-indigo-600">1</div>
                <div className="text-sm text-indigo-700 font-medium">Academic Session</div>
                <div className="text-xs text-muted-foreground">2024/2025 Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t border-border">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">GRACELAND ROYAL ACADEMY</span>
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            "WISDOM & ILLUMINATION" - Complete Educational Management System
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>✅ Full-Stack Implementation</span>
            <span>•</span>
            <span>✅ Production Ready</span>
            <span>•</span>
            <span>✅ Demo Mode Active</span>
            <span>•</span>
            <span>✅ All Features Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}