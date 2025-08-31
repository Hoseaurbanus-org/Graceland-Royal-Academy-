import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  User, 
  CreditCard, 
  FileText, 
  Download, 
  CheckCircle,
  AlertTriangle,
  Clock,
  GraduationCap,
  Receipt,
  Eye,
  Crown
} from 'lucide-react';
import { useAuth } from './AuthContext';

interface StudentResult {
  id: string;
  studentName: string;
  className: string;
  subject: string;
  test1: number;
  test2: number;
  exam: number;
  total: number;
  grade: string;
  position: number;
  term: string;
  session: string;
  isApproved: boolean;
}

interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'completed';
  paymentDate: string;
  receiptNumber?: string;
}

export function SimplifiedParentDashboard() {
  const { user } = useAuth();
  const [childResults, setChildResults] = useState<StudentResult[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [outstandingFees, setOutstandingFees] = useState<number>(0);
  const [canViewResults, setCanViewResults] = useState<boolean>(false);

  useEffect(() => {
    loadChildData();
    loadPaymentHistory();
    checkResultAccess();
  }, []);

  const loadChildData = () => {
    // Load child's results from localStorage
    const savedResults = localStorage.getItem('gra_results');
    if (savedResults) {
      const allResults = JSON.parse(savedResults);
      // Filter results for this parent's child (simplified - would use actual parent-child linking)
      const approvedResults = allResults.filter((result: any) => 
        result.status === 'approved' && result.scores && result.scores.length > 0
      );
      
      const childResultData: StudentResult[] = [];
      approvedResults.forEach((result: any) => {
        result.scores.forEach((score: any) => {
          childResultData.push({
            id: `${result.subjectId}_${score.studentId}`,
            studentName: 'Your Child', // Simplified
            className: result.className,
            subject: result.subjectName,
            test1: score.test1 || 0,
            test2: score.test2 || 0,
            exam: score.exam || 0,
            total: score.total,
            grade: score.grade,
            position: score.position,
            term: 'First Term',
            session: '2024/2025',
            isApproved: true
          });
        });
      });
      
      setChildResults(childResultData);
    }
  };

  const loadPaymentHistory = () => {
    // Load payment history from localStorage
    const savedPayments = localStorage.getItem('gra_parent_payments');
    if (savedPayments) {
      const payments = JSON.parse(savedPayments);
      setPaymentHistory(payments);
      
      // Calculate outstanding fees
      const totalPaid = payments
        .filter((p: PaymentRecord) => p.status === 'completed')
        .reduce((sum: number, p: PaymentRecord) => sum + p.amount, 0);
      
      const expectedFees = 370000; // Primary school fees (example)
      setOutstandingFees(Math.max(0, expectedFees - totalPaid));
    } else {
      // Initialize with outstanding fees
      setOutstandingFees(370000);
    }
  };

  const checkResultAccess = () => {
    // Check if fees are paid to allow result viewing
    const paidAmount = paymentHistory
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    setCanViewResults(paidAmount >= 185000); // At least 50% payment required
  };

  const handlePayment = () => {
    // Simulate payment - in real app would integrate with payment gateway
    const newPayment: PaymentRecord = {
      id: Date.now().toString(),
      studentId: 'child_001',
      studentName: 'Your Child',
      amount: Math.min(outstandingFees, 185000),
      purpose: 'School Fees - 2024/2025 Session',
      status: 'pending',
      paymentDate: new Date().toISOString(),
    };

    const updatedPayments = [...paymentHistory, newPayment];
    setPaymentHistory(updatedPayments);
    localStorage.setItem('gra_parent_payments', JSON.stringify(updatedPayments));
    
    // Add to main payments for accountant approval
    const allPayments = localStorage.getItem('gra_payments') || '[]';
    const payments = JSON.parse(allPayments);
    payments.push({
      ...newPayment,
      studentClass: 'Primary 4', // Example class
      admissionNumber: 'GRA/2024/001', // Example admission number
      paymentMethod: 'Online Payment',
      transactionRef: `TXN${Date.now()}`
    });
    localStorage.setItem('gra_payments', JSON.stringify(payments));
    
    alert('Payment submitted successfully! Awaiting approval from the accounts department.');
  };

  const downloadResultPDF = () => {
    // Simulate PDF download
    alert('Result PDF downloaded successfully!');
  };

  const downloadReceipt = (paymentId: string) => {
    // Simulate receipt download
    alert('Payment receipt downloaded!');
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'F') return 'text-red-600 bg-red-100';
    if (['A+', 'A'].includes(grade)) return 'text-green-600 bg-green-100';
    if (['B+', 'B'].includes(grade)) return 'text-blue-600 bg-blue-100';
    return 'text-orange-600 bg-orange-100';
  };

  return (
    <div className="space-y-6">
      {/* School Header with Logo */}
      <div className="bg-card border-b border-border p-6 -mx-6 -mt-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16">
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
                <text x="100" y="118" textAnchor="middle" className="fill-primary font-bold text-sm">GRA</text>
                <circle cx="60" cy="110" r="3" className="fill-chart-2" />
                <circle cx="140" cy="110" r="3" className="fill-chart-2" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">GRACELAND ROYAL ACADEMY</h1>
              <p className="text-primary font-semibold">WISDOM & ILLUMINATION</p>
              <p className="text-muted-foreground text-sm">Parent Portal</p>
            </div>
          </div>
          <Badge className="bg-primary text-primary-foreground">
            <Crown className="h-4 w-4 mr-2" />
            Parent Access
          </Badge>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Parent Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            View your child's academic progress and manage school fees
          </p>
        </div>
      </div>

      {/* Payment Status Alert */}
      {outstandingFees > 0 && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Outstanding school fees: ₦{outstandingFees.toLocaleString()}. 
            {!canViewResults && ' Please make payment to access your child\'s results.'}
          </AlertDescription>
        </Alert>
      )}

      {outstandingFees === 0 && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All school fees have been paid. You have full access to your child's results.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ₦{outstandingFees.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {outstandingFees === 0 ? 'Fully paid' : 'Payment required'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Results</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {canViewResults ? childResults.length : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {canViewResults ? 'Results accessible' : 'Payment required'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {outstandingFees === 0 ? 'PAID' : 'PENDING'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current session
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="results" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="results">Academic Results</TabsTrigger>
          <TabsTrigger value="payments">Fee Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Your Child's Academic Results
              </CardTitle>
              <CardDescription>
                View academic performance and download result reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!canViewResults ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Payment Required</h3>
                  <p className="text-muted-foreground mb-4">
                    Please complete your fee payment to access your child's results.
                  </p>
                  <Button onClick={handlePayment} className="bg-primary hover:bg-primary/90">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Make Payment
                  </Button>
                </div>
              ) : childResults.length > 0 ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">First Term 2024/2025</h4>
                    <Button onClick={downloadResultPDF} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead className="text-center">Test 1 (20)</TableHead>
                          <TableHead className="text-center">Test 2 (20)</TableHead>
                          <TableHead className="text-center">Exam (60)</TableHead>
                          <TableHead className="text-center">Total (100)</TableHead>
                          <TableHead className="text-center">Grade</TableHead>
                          <TableHead className="text-center">Position</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {childResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell className="font-medium">{result.subject}</TableCell>
                            <TableCell className="text-center">{result.test1}</TableCell>
                            <TableCell className="text-center">{result.test2}</TableCell>
                            <TableCell className="text-center">{result.exam}</TableCell>
                            <TableCell className="text-center font-semibold">{result.total}</TableCell>
                            <TableCell className="text-center">
                              <Badge className={getGradeColor(result.grade)}>
                                {result.grade}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">{result.position}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No results available yet. Results will appear here once approved by the school.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                School Fee Payments
              </CardTitle>
              <CardDescription>
                Make payments and track your payment history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {outstandingFees > 0 && (
                <div className="p-4 border-2 border-dashed border-yellow-300 rounded-lg bg-yellow-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-yellow-800">Outstanding Payment</h4>
                      <p className="text-yellow-700">
                        Amount: ₦{outstandingFees.toLocaleString()}
                      </p>
                    </div>
                    <Button onClick={handlePayment} className="bg-primary hover:bg-primary/90">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-3">Payment History</h4>
                {paymentHistory.length > 0 ? (
                  <div className="space-y-3">
                    {paymentHistory.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{payment.purpose}</span>
                            <Badge className={getPaymentStatusColor(payment.status)}>
                              {payment.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {payment.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                              {payment.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ₦{payment.amount.toLocaleString()} • {new Date(payment.paymentDate).toLocaleDateString()}
                            {payment.receiptNumber && ` • ${payment.receiptNumber}`}
                          </div>
                        </div>
                        {payment.status === 'completed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => downloadReceipt(payment.id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No payment history yet. Make your first payment to get started.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}