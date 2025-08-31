import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { 
  GraduationCap, 
  CreditCard, 
  FileText, 
  User,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Printer,
  Award,
  TrendingUp,
  BarChart3,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { SchoolLogo } from '../SchoolLogo';
import { toast } from 'sonner@2.0.3';

function ComprehensiveParentDashboard() {
  const { 
    user,
    students = [],
    classes = [],
    subjects = [],
    results = [],
    payments = [],
    currentSession,
    currentTerm,
    getMyChildren,
    getResultsByStudent,
    makePayment
  } = useAuth();

  const [selectedChild, setSelectedChild] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(currentTerm || 'First Term');
  const [selectedSession, setSelectedSession] = useState(currentSession || '2024/2025');
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    student_id: '',
    amount: '',
    purpose: '',
    payment_method: 'bank_transfer'
  });

  // Get user's children with safe handling
  const myChildren = user && typeof getMyChildren === 'function' 
    ? getMyChildren(user.id) || []
    : user 
    ? students.filter(s => s?.parent_id === user.id && s?.is_active) || []
    : [];

  const selectedChildData = myChildren.find(child => child?.id === selectedChild);

  // Get child's results (only published ones) with safe handling
  const childResults = selectedChild ? 
    (typeof getResultsByStudent === 'function' 
      ? getResultsByStudent(selectedChild, selectedSession, selectedTerm)?.filter(r => r?.status === 'published') || []
      : results.filter(r => 
          r?.student_id === selectedChild &&
          r?.session === selectedSession &&
          r?.term === selectedTerm &&
          r?.status === 'published'
        ) || []
    ) : [];

  // Get child's payments with safe handling
  const childPayments = selectedChild && Array.isArray(payments) ? 
    payments.filter(p => p?.student_id === selectedChild && p?.parent_id === user?.id) || [] : [];

  // Calculate statistics for selected child
  const getChildStats = () => {
    if (!selectedChild || !Array.isArray(childResults) || childResults.length === 0) {
      return {
        totalSubjects: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        gradeDistribution: {},
        overallGrade: 'N/A'
      };
    }

    const validResults = childResults.filter(r => r && typeof r.percentage === 'number');
    if (validResults.length === 0) {
      return {
        totalSubjects: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        gradeDistribution: {},
        overallGrade: 'N/A'
      };
    }

    const totalSubjects = validResults.length;
    const totalPercentage = validResults.reduce((sum, r) => sum + (r.percentage || 0), 0);
    const averageScore = Math.round(totalPercentage / totalSubjects);
    const scores = validResults.map(r => r.percentage || 0);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    // Grade distribution
    const gradeDistribution: Record<string, number> = {};
    validResults.forEach(r => {
      if (r.grade) {
        gradeDistribution[r.grade] = (gradeDistribution[r.grade] || 0) + 1;
      }
    });

    // Overall grade
    const getOverallGrade = (avg: number) => {
      if (avg >= 80) return 'A';
      if (avg >= 70) return 'B';
      if (avg >= 60) return 'C';
      if (avg >= 50) return 'D';
      if (avg >= 40) return 'E';
      return 'F';
    };

    return {
      totalSubjects,
      averageScore,
      highestScore,
      lowestScore,
      gradeDistribution,
      overallGrade: getOverallGrade(averageScore)
    };
  };

  const childStats = getChildStats();

  // Get grade color
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'E': return 'text-red-600 bg-red-100';
      case 'F': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Handle payment
  const handlePayment = async () => {
    if (!paymentForm.student_id || !paymentForm.amount || !paymentForm.purpose) {
      toast.error('Please fill all required fields');
      return;
    }

    const amount = parseFloat(paymentForm.amount);
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      if (typeof makePayment === 'function') {
        const result = await makePayment({
          student_id: paymentForm.student_id,
          amount: amount,
          purpose: paymentForm.purpose,
          payment_method: paymentForm.payment_method
        });

        if (result?.success) {
          toast.success('Payment completed successfully');
          setPaymentDialog(false);
          setPaymentForm({
            student_id: '',
            amount: '',
            purpose: '',
            payment_method: 'bank_transfer'
          });
        }
      } else {
        throw new Error('Payment function not available');
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    }
  };

  // Calculate total fees paid with safe handling
  const totalFeesPaid = Array.isArray(childPayments) ? 
    childPayments
      .filter(p => p?.status === 'completed')
      .reduce((sum, p) => sum + (p?.amount || 0), 0) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SchoolLogo size="md" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Parent Dashboard</h1>
            <p className="text-muted-foreground">Monitor your child's academic progress and manage payments</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{currentSession || '2024/2025'}</Badge>
          <Badge variant="secondary">{currentTerm || 'First Term'}</Badge>
        </div>
      </div>

      {/* Child Selection */}
      <Card>
        <CardHeader>
          <CardTitle>My Children</CardTitle>
          <CardDescription>Select a child to view their academic records and make payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="child">Select Child</Label>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your child" />
                </SelectTrigger>
                <SelectContent>
                  {myChildren.map((child) => {
                    if (!child) return null;
                    const childClass = classes.find(c => c?.id === child.class_id);
                    return (
                      <SelectItem key={child.id} value={child.id}>
                        {child.name} - {childClass?.name || 'Unknown Class'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Label htmlFor="term">Academic Term</Label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First Term">First Term</SelectItem>
                    <SelectItem value="Second Term">Second Term</SelectItem>
                    <SelectItem value="Third Term">Third Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {selectedChildData && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedChildData.photo_url} alt={selectedChildData.name} />
                  <AvatarFallback>
                    {selectedChildData.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedChildData.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Admission No:</span>
                      <p className="font-mono">{selectedChildData.admission_number}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Class:</span>
                      <p>{classes.find(c => c?.id === selectedChildData.class_id)?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Subjects:</span>
                      <p>{selectedChildData.assigned_subjects?.length || 0} subjects</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Overall Grade:</span>
                      <Badge className={getGradeColor(childStats.overallGrade)}>
                        {childStats.overallGrade}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedChild && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className="text-2xl font-bold text-primary">{childStats.averageScore}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Highest Score</p>
                      <p className="text-2xl font-bold text-green-600">{childStats.highestScore}%</p>
                    </div>
                    <Award className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Subjects</p>
                      <p className="text-2xl font-bold text-primary">{childStats.totalSubjects}</p>
                    </div>
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Fees Paid</p>
                      <p className="text-2xl font-bold text-green-600">₦{totalFeesPaid.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Academic Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Academic Results - {selectedTerm} {selectedSession}
                  </CardTitle>
                  <CardDescription>
                    View your child's approved academic performance
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled={childResults.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline" size="sm" disabled={childResults.length === 0}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Results
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {childResults.length > 0 ? (
                <>
                  {/* Performance Summary */}
                  <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-3">Performance Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{childStats.averageScore}%</p>
                        <p className="text-sm text-muted-foreground">Average Score</p>
                      </div>
                      <div className="text-center">
                        <Badge className={`text-lg px-3 py-1 ${getGradeColor(childStats.overallGrade)}`}>
                          {childStats.overallGrade}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">Overall Grade</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{childStats.highestScore}%</p>
                        <p className="text-sm text-muted-foreground">Highest Score</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{childStats.lowestScore}%</p>
                        <p className="text-sm text-muted-foreground">Lowest Score</p>
                      </div>
                    </div>
                  </div>

                  {/* Results Table */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Test 1</TableHead>
                          <TableHead>Test 2</TableHead>
                          <TableHead>Exam</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Percentage</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Position</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {childResults.map((result) => {
                          if (!result) return null;
                          const subject = subjects.find(s => s?.id === result.subject_id);
                          return (
                            <TableRow key={result.id}>
                              <TableCell className="font-medium">
                                {subject?.name || 'Unknown Subject'}
                                <div className="text-xs text-muted-foreground">{subject?.code}</div>
                              </TableCell>
                              <TableCell>{result.test1_score || 0}/100</TableCell>
                              <TableCell>{result.test2_score || 0}/100</TableCell>
                              <TableCell>{result.exam_score || 0}/100</TableCell>
                              <TableCell className="font-medium">{result.total_score || 0}/300</TableCell>
                              <TableCell className="font-medium">{result.percentage || 0}%</TableCell>
                              <TableCell>
                                <Badge className={getGradeColor(result.grade || 'F')}>
                                  {result.grade || 'F'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {result.position ? (
                                  <Badge variant="outline">{result.position}</Badge>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No results available</p>
                  <p className="text-sm text-muted-foreground">
                    Results will be displayed here once approved by the administration
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fee Payment Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Make Payment */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      School Fee Payment
                    </CardTitle>
                    <CardDescription>
                      Pay school fees and other charges securely
                    </CardDescription>
                  </div>
                  <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Make Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Make School Fee Payment</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="paymentStudent">Student</Label>
                          <Select value={paymentForm.student_id} onValueChange={(value) => setPaymentForm({ ...paymentForm, student_id: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                            <SelectContent>
                              {myChildren.map((child) => {
                                if (!child) return null;
                                return (
                                  <SelectItem key={child.id} value={child.id}>
                                    {child.name} - {child.admission_number}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="amount">Amount (₦)</Label>
                          <Input
                            id="amount"
                            type="number"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                            placeholder="Enter amount"
                          />
                        </div>

                        <div>
                          <Label htmlFor="purpose">Purpose</Label>
                          <Select value={paymentForm.purpose} onValueChange={(value) => setPaymentForm({ ...paymentForm, purpose: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select purpose" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="School Fees">School Fees</SelectItem>
                              <SelectItem value="Books & Materials">Books & Materials</SelectItem>
                              <SelectItem value="Uniform">Uniform</SelectItem>
                              <SelectItem value="Transport">Transport</SelectItem>
                              <SelectItem value="Examination">Examination</SelectItem>
                              <SelectItem value="Others">Others</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="paymentMethod">Payment Method</Label>
                          <Select value={paymentForm.payment_method} onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_method: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="debit_card">Debit Card</SelectItem>
                              <SelectItem value="mobile_money">Mobile Money</SelectItem>
                              <SelectItem value="cash">Cash</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Your payment will be processed securely. You will receive a confirmation receipt.
                          </AlertDescription>
                        </Alert>

                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setPaymentDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handlePayment}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay Now
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-medium text-primary mb-2">Quick Payment Options</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setPaymentForm({
                          ...paymentForm,
                          student_id: selectedChild,
                          amount: '50000',
                          purpose: 'School Fees'
                        });
                        setPaymentDialog(true);
                      }}>
                        School Fees - ₦50,000
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setPaymentForm({
                          ...paymentForm,
                          student_id: selectedChild,
                          amount: '15000',
                          purpose: 'Books & Materials'
                        });
                        setPaymentDialog(true);
                      }}>
                        Books - ₦15,000
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setPaymentForm({
                          ...paymentForm,
                          student_id: selectedChild,
                          amount: '8000',
                          purpose: 'Uniform'
                        });
                        setPaymentDialog(true);
                      }}>
                        Uniform - ₦8,000
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setPaymentForm({
                          ...paymentForm,
                          student_id: selectedChild,
                          amount: '5000',
                          purpose: 'Examination'
                        });
                        setPaymentDialog(true);
                      }}>
                        Exam - ₦5,000
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Track your payment records</CardDescription>
              </CardHeader>
              <CardContent>
                {childPayments.length > 0 ? (
                  <div className="space-y-3">
                    {childPayments.slice(0, 5).map((payment) => {
                      if (!payment) return null;
                      return (
                        <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{payment.purpose || 'Payment'}</p>
                            <p className="text-sm text-muted-foreground">
                              {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'Unknown date'} • {payment.reference || 'No reference'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₦{(payment.amount || 0).toLocaleString()}</p>
                            <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                              {payment.status || 'pending'}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                    <div className="text-center pt-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View All Payments
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No payments made yet</p>
                    <p className="text-sm text-muted-foreground">Your payment history will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {myChildren.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No children registered</p>
            <p className="text-sm text-muted-foreground">
              Contact the school administration to register your child
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ComprehensiveParentDashboard;