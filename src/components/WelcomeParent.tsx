import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  GraduationCap, 
  CreditCard, 
  FileText, 
  Calendar,
  ArrowRight,
  Star,
  Shield,
  Smartphone
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { SchoolLogo } from './SchoolLogo';

interface WelcomeParentProps {
  onComplete: () => void;
}

export function WelcomeParent({ onComplete }: WelcomeParentProps) {
  const { user, getMyChildren, classes } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const myChildren = user ? getMyChildren(user.id) : [];

  const steps = [
    {
      title: "Welcome to Graceland Royal Academy!",
      description: "Your parent portal is now ready",
      content: (
        <div className="text-center space-y-6">
          <SchoolLogo size="xl" showText={true} animate={true} />
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Welcome, {user?.name}!</h2>
            <p className="text-muted-foreground">
              Your parent account has been successfully created. Let's take a quick tour of what you can do.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="px-3 py-1">
              <Shield className="w-3 h-3 mr-1" />
              Secure Access
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Smartphone className="w-3 h-3 mr-1" />
              Mobile Friendly
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Star className="w-3 h-3 mr-1" />
              Real-time Updates
            </Badge>
          </div>
        </div>
      )
    },
    {
      title: "Your Children",
      description: "Students linked to your account",
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <GraduationCap className="w-16 h-16 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold text-primary">Your Registered Children</h3>
            <p className="text-muted-foreground">Monitor their academic progress and activities</p>
          </div>
          
          {myChildren.length > 0 ? (
            <div className="space-y-3">
              {myChildren.map((child) => {
                const childClass = classes.find(c => c.id === child.class_id);
                return (
                  <div key={child.id} className="p-4 border rounded-lg bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{child.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {child.admission_number} • {childClass?.name || 'Unknown Class'}
                        </p>
                      </div>
                      <Badge variant="outline">{child.assigned_subjects.length} subjects</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Alert>
              <GraduationCap className="h-4 w-4" />
              <AlertDescription>
                No children are currently linked to your account. Please contact the school administration.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )
    },
    {
      title: "Academic Results",
      description: "View your child's performance",
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <FileText className="w-16 h-16 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold text-primary">Academic Results</h3>
            <p className="text-muted-foreground">Access approved results and performance reports</p>
          </div>
          
          <div className="grid gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">View Results</p>
                  <p className="text-sm text-muted-foreground">Access approved test scores and exam results</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Performance Analytics</p>
                  <p className="text-sm text-muted-foreground">Track progress with detailed charts and insights</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Term Reports</p>
                  <p className="text-sm text-muted-foreground">Download comprehensive term reports</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Fee Payments",
      description: "Secure online payment system",
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <CreditCard className="w-16 h-16 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold text-primary">School Fee Payments</h3>
            <p className="text-muted-foreground">Pay school fees securely from anywhere</p>
          </div>
          
          <div className="grid gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Multiple Payment Options</p>
                  <p className="text-sm text-muted-foreground">Bank transfer, debit card, mobile money</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Payment History</p>
                  <p className="text-sm text-muted-foreground">Track all your payment transactions</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Instant Receipts</p>
                  <p className="text-sm text-muted-foreground">Get immediate payment confirmations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "You're All Set!",
      description: "Ready to explore your dashboard",
      content: (
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <CheckCircle className="w-24 h-24 mx-auto text-green-500 mb-4" />
          </motion.div>
          
          <div>
            <h3 className="text-2xl font-bold text-primary mb-2">Welcome Aboard!</h3>
            <p className="text-muted-foreground mb-6">
              Your parent portal is ready. You can now monitor your child's academic progress and manage payments.
            </p>
          </div>

          <div className="grid gap-3 max-w-md mx-auto">
            <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Academic Year: 2024/2025</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-academic-gold/10 rounded-lg">
              <GraduationCap className="h-5 w-5 text-academic-gold" />
              <span className="text-sm font-medium">Current Term: First Term</span>
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your default password is "parent123". Please change it in your settings for security.
            </AlertDescription>
          </Alert>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipToEnd = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center mb-4">
            <Badge variant="outline" className="px-3 py-1">
              Step {currentStep + 1} of {steps.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={skipToEnd}>
              Skip Tour
            </Button>
          </div>
          
          <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
          <CardDescription className="text-base">
            {steps[currentStep].description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[400px] flex items-center"
          >
            {steps[currentStep].content}
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="w-24"
            >
              Previous
            </Button>
            
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <Button onClick={nextStep} className="w-24">
              {currentStep === steps.length - 1 ? (
                'Get Started'
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}