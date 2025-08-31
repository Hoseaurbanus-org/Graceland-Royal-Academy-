import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
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
  ClipboardCheck,
  Info,
  Copy,
  CheckCircle
} from 'lucide-react';
import { SchoolLogoWatermark } from './SchoolLogoWatermark';

interface DemoAccount {
  email: string;
  password: string;
  role: string;
  color: string;
  icon: React.ReactNode;
  features: string[];
  testScenarios: string[];
}

interface DemoGuideProps {
  onStartDemo?: () => void;
}

export function DemoGuide({ onStartDemo }: DemoGuideProps) {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const demoAccounts: DemoAccount[] = [
    {
      email: 'admin@gracelandroyal.edu.ng',
      password: 'admin123',
      role: 'Administrator',
      color: 'bg-red-500',
      icon: <Crown className="h-4 w-4" />,
      features: [
        'Complete system overview and analytics',
        'Student registration with passport photos',
        'Staff management (create, edit, delete)',
        'Password generation and management',
        'Subject and class management',
        'Result compilation and PDF generation',
        'Fee structure management',
        'System settings and configuration',
        'Academic calendar management',
        'Security and audit logs'
      ],
      testScenarios: [
        'Register new students with passport photos',
        'Create staff accounts and assign subjects/classes',
        'Set up fee structures for different classes',
        'Generate and print student result PDFs',
        'Manage academic sessions and terms',
        'Configure system-wide settings',
        'Monitor payment statuses',
        'Review staff allocations and workloads'
      ]
    },
    {
      email: 'supervisor@gracelandroyal.edu.ng',
      password: 'super123',
      role: 'Supervisor',
      color: 'bg-blue-500',
      icon: <GraduationCap className="h-4 w-4" />,
      features: [
        'Student result entry and management',
        'Score submission for Test 1, Test 2, and Exams',
        'Class-specific student lists',
        'Subject-wise result tracking',
        'Result approval workflow',
        'Performance analytics',
        'Grade calculation (20% + 20% + 60%)',
        'Comment and remark system',
        'Student performance reports'
      ],
      testScenarios: [
        'Enter scores for Test 1 (20% weight)',
        'Submit Test 2 results (20% weight)',
        'Record final exam scores (60% weight)',
        'Review calculated grades and positions',
        'Add teacher comments for students',
        'Submit results for approval',
        'Track submission deadlines',
        'Generate class performance reports'
      ]
    },
    {
      email: 'accountant@gracelandroyal.edu.ng',
      password: 'account123',
      role: 'Accountant',
      color: 'bg-green-500',
      icon: <Calculator className="h-4 w-4" />,
      features: [
        'Fee payment processing and verification',
        'Payment history tracking',
        'Outstanding fees management',
        'Receipt generation and printing',
        'Financial reports and summaries',
        'Payment method validation',
        'Refund and adjustment processing',
        'Fee structure implementation',
        'Payment reminder system'
      ],
      testScenarios: [
        'Process school fee payments',
        'Verify payment confirmations',
        'Generate payment receipts',
        'Track outstanding balances',
        'Handle partial payments',
        'Process refunds if needed',
        'Generate financial reports',
        'Validate payment documents'
      ]
    },
    {
      email: 'parent@gracelandroyal.edu.ng',
      password: 'parent123',
      role: 'Parent',
      color: 'bg-purple-500',
      icon: <User className="h-4 w-4" />,
      features: [
        'View child\'s academic results',
        'Access report cards and transcripts',
        'Make school fee payments online',
        'View payment history and receipts',
        'Track academic progress over time',
        'Download result PDFs',
        'View upcoming fee due dates',
        'Access academic calendar',
        'Receive school notifications'
      ],
      testScenarios: [
        'Complete parent onboarding process',
        'View child\'s latest results',
        'Download and print report cards',
        'Make fee payments online',
        'Check payment history',
        'View academic progress charts',
        'Access school calendar events',
        'Review teacher comments'
      ]
    }
  ];

  const systemFeatures = [
    {
      category: 'Core Academic Features',
      icon: <BookOpen className="h-5 w-5" />,
      items: [
        'Three-term academic system with automated calculations',
        'Assessment structure: Test 1 (20%) + Test 2 (20%) + Exam (60%)',
        'Automated grade calculation and student ranking',
        'Comprehensive result compilation and PDF generation',
        'Subject and class management with staff assignments',
        'Academic calendar with term and session tracking'
      ]
    },
    {
      category: 'User Management',
      icon: <Users className="h-5 w-5" />,
      items: [
        'Role-based access control (Admin, Supervisor, Accountant, Parent)',
        'Staff account creation with auto-generated passwords',
        'Student registration with passport photo uploads',
        'Parent account linking with student profiles',
        'Security features and audit trails'
      ]
    },
    {
      category: 'Financial Management',
      icon: <CreditCard className="h-5 w-5" />,
      items: [
        'Comprehensive fee payment system',
        'Multiple payment method support',
        'Automated receipt generation',
        'Outstanding fee tracking and reminders',
        'Financial reporting and analytics'
      ]
    },
    {
      category: 'Reporting & Analytics',
      icon: <FileText className="h-5 w-5" />,
      items: [
        'Professional PDF result generation',
        'Performance analytics and charts',
        'Class and subject-wise reports',
        'Payment history and financial reports',
        'Academic progress tracking over time'
      ]
    }
  ];

  const copyCredentials = (email: string, password: string) => {
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`);
    setCopiedAccount(email);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <div className="min-h-screen p-4 relative">
      <SchoolLogoWatermark />
      
      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4">
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
          <h1 className="text-3xl font-bold text-foreground mb-2">
            GRACELAND ROYAL ACADEMY
          </h1>
          <p className="text-xl text-primary font-semibold mb-2">
            WISDOM & ILLUMINATION
          </p>
          <p className="text-lg text-muted-foreground mb-4">
            Educational Management System - Demo Guide
          </p>
          
          <Alert className="max-w-2xl mx-auto mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Welcome to the comprehensive demo of our educational management system. 
              Use the demo accounts below to explore all features. All data is stored locally for testing.
            </AlertDescription>
          </Alert>
        </div>

        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="accounts">Demo Accounts</TabsTrigger>
            <TabsTrigger value="features">System Features</TabsTrigger>
            <TabsTrigger value="workflows">Test Workflows</TabsTrigger>
            <TabsTrigger value="setup">Quick Setup</TabsTrigger>
          </TabsList>

          {/* Demo Accounts Tab */}
          <TabsContent value="accounts" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {demoAccounts.map((account, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${account.color}`} />
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {account.icon}
                        {account.role}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyCredentials(account.email, account.password)}
                        className="h-8"
                      >
                        {copiedAccount === account.email ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <div className="font-mono text-sm">
                        <div><strong>Email:</strong> {account.email}</div>
                        <div><strong>Password:</strong> {account.password}</div>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Key Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {account.features.slice(0, 4).map((feature, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {account.features.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{account.features.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Test Scenarios:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {account.testScenarios.slice(0, 3).map((scenario, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-primary mt-1">•</span>
                            {scenario}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* System Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {systemFeatures.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {category.icon}
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Test Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5" />
                    Complete Testing Workflow
                  </CardTitle>
                  <CardDescription>
                    Follow this comprehensive workflow to test all system features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-red-700">1. Administrator Setup (admin@gracelandroyal.edu.ng)</h4>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• Register new students with passport photos</li>
                        <li>• Create staff accounts (supervisors and accountants)</li>
                        <li>• Set up subjects and assign to staff</li>
                        <li>• Create class structures and assign supervisors</li>
                        <li>• Configure fee structures for different classes</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-blue-700">2. Supervisor Score Entry (supervisor@gracelandroyal.edu.ng)</h4>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• Enter Test 1 scores (20% weight) for assigned subjects</li>
                        <li>• Submit Test 2 results (20% weight)</li>
                        <li>• Record final exam scores (60% weight)</li>
                        <li>• Add teacher comments and remarks</li>
                        <li>• Submit completed results for approval</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-green-700">3. Accountant Payment Processing (accountant@gracelandroyal.edu.ng)</h4>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• Process incoming fee payments</li>
                        <li>• Verify payment confirmations and documents</li>
                        <li>• Generate and print payment receipts</li>
                        <li>• Track outstanding fees and send reminders</li>
                        <li>• Generate financial reports</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-purple-700">4. Parent Experience (parent@gracelandroyal.edu.ng)</h4>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• Complete initial onboarding process</li>
                        <li>• View and download child's results</li>
                        <li>• Make online fee payments</li>
                        <li>• Track academic progress over time</li>
                        <li>• Access school calendar and notifications</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-red-700">5. Final Admin Review</h4>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• Review and approve submitted results</li>
                        <li>• Generate and print final report cards</li>
                        <li>• Monitor system usage and performance</li>
                        <li>• Review payment statuses and financial reports</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quick Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Setup Guide
                </CardTitle>
                <CardDescription>
                  Get started with the system in just a few minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">1</span>
                    </div>
                    <h4 className="font-semibold mb-2">Login as Admin</h4>
                    <p className="text-sm text-muted-foreground">
                      Use admin@gracelandroyal.edu.ng with password admin123
                    </p>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">2</span>
                    </div>
                    <h4 className="font-semibold mb-2">Add Sample Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Register students, create staff, and set up classes
                    </p>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">3</span>
                    </div>
                    <h4 className="font-semibold mb-2">Test Features</h4>
                    <p className="text-sm text-muted-foreground">
                      Switch between roles to test all functionality
                    </p>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Pro Tip:</strong> All demo data is automatically saved to your browser's local storage. 
                    You can refresh the page and continue where you left off. To reset demo data, clear your browser's local storage.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Demo Data Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Demo Data Ready
            </CardTitle>
            <CardDescription>
              Your demo environment has been pre-populated with sample data for immediate testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center p-3 border rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-600">15</div>
                <div className="text-sm text-green-700">Classes</div>
                <div className="text-xs text-muted-foreground">Early Years to SS3</div>
              </div>
              <div className="text-center p-3 border rounded-lg bg-blue-50">
                <div className="text-2xl font-bold text-blue-600">10</div>
                <div className="text-sm text-blue-700">Subjects</div>
                <div className="text-xs text-muted-foreground">Core curriculum</div>
              </div>
              <div className="text-center p-3 border rounded-lg bg-purple-50">
                <div className="text-2xl font-bold text-purple-600">5</div>
                <div className="text-sm text-purple-700">Staff Members</div>
                <div className="text-xs text-muted-foreground">With credentials</div>
              </div>
              <div className="text-center p-3 border rounded-lg bg-orange-50">
                <div className="text-2xl font-bold text-orange-600">3</div>
                <div className="text-sm text-orange-700">Demo Students</div>
                <div className="text-xs text-muted-foreground">Ready for testing</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div>
            <Button 
              size="lg" 
              className="mr-4" 
              onClick={onStartDemo || (() => window.location.reload())}
            >
              🚀 Start Demo Login
            </Button>
            <Button variant="outline" size="lg">
              📚 View Documentation
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>
              🎯 <strong>Quick Tip:</strong> Start with the Administrator account to see the full system overview, 
              then explore other roles to experience the complete workflow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}