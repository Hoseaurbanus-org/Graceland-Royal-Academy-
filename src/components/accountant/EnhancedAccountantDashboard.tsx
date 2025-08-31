import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Search,
  Settings,
  Calculator,
  Receipt,
  Printer,
  Check,
  X,
  Eye,
  PlusCircle,
  Edit,
  Save,
  FileCheck,
  Banknote,
  Wallet,
  Building
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNotifications } from '../NotificationContext';
import { SchoolLogo } from '../SchoolLogo';
import { toast } from 'sonner@2.0.3';

interface FeeStructure {
  id: string;
  class_id: string;
  class_name: string;
  term: string;
  session: string;
  tuition_fee: number;
  development_fee: number;
  exam_fee: number;
  library_fee: number;
  sports_fee: number;
  total_fee: number;
  created_at: Date;
  updated_at: Date;
}

interface Payment {
  id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  amount: number;
  purpose: string;
  payment_method: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  payment_date: Date;
  receipt_number?: string;
}

interface ResultApproval {
  id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  term: string;
  session: string;
  fee_status: 'paid' | 'partial' | 'unpaid';
  result_status: 'approved' | 'pending' | 'blocked';
  amount_paid: number;
  total_fee_required: number;
}

function EnhancedAccountantDashboard() {
  const { 
    user,
    students = [],
    classes = [],
    payments: existingPayments = [],
    currentSession,
    currentTerm 
  } = useAuth();

  const { addNotification } = useNotifications();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  // Mock data - in real app, this would come from database
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([
    {
      id: 'fee-structure-1',
      class_id: 'class1',
      class_name: 'Primary 1',
      term: 'First Term',
      session: '2024/2025',
      tuition_fee: 45000,
      development_fee: 5000,
      exam_fee: 2000,
      library_fee: 1500,
      sports_fee: 1000,
      total_fee: 54500,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 'payment-1',
      student_id: 'student1',
      student_name: 'John Doe',
      class_name: 'Primary 1',
      amount: 54500,
      purpose: 'First Term School Fee',
      payment_method: 'Bank Transfer',
      reference: 'TXN001234567',
      status: 'completed',
      payment_date: new Date(),
      receipt_number: 'REC001'
    }
  ]);

  const [resultApprovals, setResultApprovals] = useState<ResultApproval[]>([
    {
      id: 'approval-1',
      student_id: 'student1',
      student_name: 'John Doe',
      class_name: 'Primary 1',
      term: 'First Term',
      session: '2024/2025',
      fee_status: 'paid',
      result_status: 'approved',
      amount_paid: 54500,
      total_fee_required: 54500
    }
  ]);

  const [feeForm, setFeeForm] = useState({
    class_id: '',
    term: 'First Term',
    session: '2024/2025',
    tuition_fee: '',
    development_fee: '',
    exam_fee: '',
    library_fee: '',
    sports_fee: ''
  });

  // Calculate statistics
  const stats = {
    totalRevenue: payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0),
    totalPayments: payments.length,
    completedPayments: payments.filter(p => p.status === 'completed').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    thisMonthRevenue: payments
      .filter(p => {
        const paymentDate = new Date(p.payment_date);
        const now = new Date();
        return paymentDate.getMonth() === now.getMonth() && 
               paymentDate.getFullYear() === now.getFullYear() &&
               p.status === 'completed';
      })
      .reduce((sum, p) => sum + p.amount, 0),
    averagePayment: payments.length > 0 
      ? Math.round(payments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0) / payments.filter(p => p.status === 'completed').length)
      : 0
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const handleSetFeeStructure = () => {
    const tuition = parseFloat(feeForm.tuition_fee) || 0;
    const development = parseFloat(feeForm.development_fee) || 0;
    const exam = parseFloat(feeForm.exam_fee) || 0;
    const library = parseFloat(feeForm.library_fee) || 0;
    const sports = parseFloat(feeForm.sports_fee) || 0;
    const total = tuition + development + exam + library + sports;

    if (!feeForm.class_id || total <= 0) {
      toast.error('Please select a class and enter valid fee amounts');
      return;
    }

    const selectedClass = classes.find(c => c.id === feeForm.class_id);
    
    const newFeeStructure: FeeStructure = {
      id: `fee-structure-${Date.now()}`,
      class_id: feeForm.class_id,
      class_name: selectedClass?.name || '',
      term: feeForm.term,
      session: feeForm.session,
      tuition_fee: tuition,
      development_fee: development,
      exam_fee: exam,
      library_fee: library,
      sports_fee: sports,
      total_fee: total,
      created_at: new Date(),
      updated_at: new Date()
    };

    setFeeStructures(prev => {
      const existing = prev.findIndex(f => 
        f.class_id === feeForm.class_id && f.term === feeForm.term && f.session === feeForm.session
      );
      
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...newFeeStructure, id: prev[existing].id };
        return updated;
      } else {
        return [...prev, newFeeStructure];
      }
    });

    toast.success(`Fee structure set for ${selectedClass?.name}`);
    addNotification({
      type: 'success',
      title: 'Fee Structure Updated',
      message: `${selectedClass?.name} fees set to ${formatCurrency(total)}`,
      autoHide: true
    });

    setIsFeeDialogOpen(false);
    resetFeeForm();
  };

  const resetFeeForm = () => {
    setFeeForm({
      class_id: '',
      term: 'First Term',
      session: '2024/2025',
      tuition_fee: '',
      development_fee: '',
      exam_fee: '',
      library_fee: '',
      sports_fee: ''
    });
  };

  const handleApproveResult = (approvalId: string) => {
    setResultApprovals(prev => 
      prev.map(approval => 
        approval.id === approvalId 
          ? { ...approval, result_status: 'approved' }
          : approval
      )
    );

    const approval = resultApprovals.find(a => a.id === approvalId);
    toast.success(`Result approved for ${approval?.student_name}`);
    
    addNotification({
      type: 'success',
      title: 'Result Approved',
      message: `${approval?.student_name}'s result has been approved for parent viewing`,
      autoHide: true
    });
  };

  const handleBlockResult = (approvalId: string) => {
    setResultApprovals(prev => 
      prev.map(approval => 
        approval.id === approvalId 
          ? { ...approval, result_status: 'blocked' }
          : approval
      )
    );

    const approval = resultApprovals.find(a => a.id === approvalId);
    toast.warning(`Result blocked for ${approval?.student_name}`);
  };

  const handleAcceptPayment = (studentId: string, amount: number) => {
    const student = students.find(s => s.id === studentId);
    const classInfo = classes.find(c => c.id === student?.class_id);
    
    const newPayment: Payment = {
      id: `payment-${Date.now()}`,
      student_id: studentId,
      student_name: student?.name || 'Unknown',
      class_name: classInfo?.name || 'Unknown',
      amount: amount,
      purpose: `${currentTerm} School Fee`,
      payment_method: 'Cash',
      reference: `TXN${Date.now()}`,
      status: 'completed',
      payment_date: new Date(),
      receipt_number: `REC${Date.now()}`
    };

    setPayments(prev => [...prev, newPayment]);
    setSelectedPayment(newPayment);
    setIsReceiptDialogOpen(true);

    toast.success(`Payment of ${formatCurrency(amount)} accepted`);
    addNotification({
      type: 'success',
      title: 'Payment Received',
      message: `${formatCurrency(amount)} payment recorded for ${student?.name}`,
      autoHide: true
    });
  };

  const handlePrintReceipt = (payment: Payment) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Payment Receipt - ${payment.receipt_number}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; position: relative; }
              .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.1; z-index: -1; font-size: 72px; font-weight: bold; color: #1e40af; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e40af; padding-bottom: 20px; }
              .logo-placeholder { width: 80px; height: 80px; margin: 0 auto 10px; background: #1e40af; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
              .receipt-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .payment-details { margin-bottom: 30px; }
              .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              .details-table th, .details-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              .details-table th { background-color: #f5f5f5; }
              .total-row { font-weight: bold; background-color: #f9f9f9; }
              .footer { text-align: center; margin-top: 30px; color: #666; border-top: 1px solid #ccc; padding-top: 20px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="watermark">GRA</div>
            <div class="header">
              <div class="logo-placeholder">GRA</div>
              <h1 style="color: #1e40af; margin: 0;">GRACELAND ROYAL ACADEMY</h1>
              <p style="color: #f59e0b; margin: 5px 0;"><strong>WISDOM & ILLUMINATION</strong></p>
              <h2 style="color: #1e40af; margin: 10px 0;">PAYMENT RECEIPT</h2>
            </div>
            
            <div class="receipt-info">
              <div>
                <p><strong>Receipt No:</strong> ${payment.receipt_number}</p>
                <p><strong>Date:</strong> ${new Date(payment.payment_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p><strong>Student:</strong> ${payment.student_name}</p>
                <p><strong>Class:</strong> ${payment.class_name}</p>
              </div>
            </div>
            
            <div class="payment-details">
              <table class="details-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${payment.purpose}</td>
                    <td>${formatCurrency(payment.amount)}</td>
                  </tr>
                  <tr class="total-row">
                    <td><strong>Total Paid</strong></td>
                    <td><strong>${formatCurrency(payment.amount)}</strong></td>
                  </tr>
                </tbody>
              </table>
              
              <p><strong>Payment Method:</strong> ${payment.payment_method}</p>
              <p><strong>Reference:</strong> ${payment.reference}</p>
              <p><strong>Status:</strong> ${payment.status.toUpperCase()}</p>
            </div>
            
            <div class="footer">
              <p>Thank you for your payment!</p>
              <p>This is an official receipt from Graceland Royal Academy</p>
              <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              <p style="color: #1e40af; font-weight: bold;">WISDOM & ILLUMINATION</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (user?.role !== 'accountant') {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
        <p className="text-muted-foreground">Access denied. Accountant privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Accountant Dashboard</h1>
          <p className="text-muted-foreground">Financial management, fee structure, and payment processing</p>
        </div>
        <SchoolLogo size="md" showText={false} animated={false} />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-800">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">This Month</p>
                  <p className="text-2xl font-bold text-blue-800">{formatCurrency(stats.thisMonthRevenue)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-purple-800">{stats.completedPayments}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-800">{stats.pendingPayments}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fees">Fee Management</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="approvals">Result Approvals</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Recent Payments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Recent Payments
                  </CardTitle>
                  <CardDescription>Latest payment transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {payments.slice(0, 5).map((payment, index) => (
                      <div key={`recent-payment-${payment.id}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{payment.student_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {payment.purpose} • {new Date(payment.payment_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatCurrency(payment.amount)}</p>
                          <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Fee Structures */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Fee Structures
                  </CardTitle>
                  <CardDescription>Current class fee structures</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feeStructures.map((fee) => (
                      <div key={`fee-overview-${fee.id}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{fee.class_name}</p>
                          <p className="text-xs text-muted-foreground">{fee.term} • {fee.session}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatCurrency(fee.total_fee)}</p>
                          <Badge variant="outline" className="text-xs">Active</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Fee Management Tab */}
          <TabsContent value="fees" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Fee Structure Management
                      </CardTitle>
                      <CardDescription>Set and manage school fees for each class</CardDescription>
                    </div>
                    <Button onClick={() => setIsFeeDialogOpen(true)} className="gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Set Fee Structure
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Class</TableHead>
                          <TableHead>Term</TableHead>
                          <TableHead>Session</TableHead>
                          <TableHead>Tuition</TableHead>
                          <TableHead>Development</TableHead>
                          <TableHead>Other Fees</TableHead>
                          <TableHead>Total Fee</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feeStructures.map((fee) => (
                          <TableRow key={`fee-table-${fee.id}`}>
                            <TableCell className="font-medium">{fee.class_name}</TableCell>
                            <TableCell>{fee.term}</TableCell>
                            <TableCell>{fee.session}</TableCell>
                            <TableCell>{formatCurrency(fee.tuition_fee)}</TableCell>
                            <TableCell>{formatCurrency(fee.development_fee)}</TableCell>
                            <TableCell>{formatCurrency(fee.exam_fee + fee.library_fee + fee.sports_fee)}</TableCell>
                            <TableCell className="font-bold">{formatCurrency(fee.total_fee)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Management
                      </CardTitle>
                      <CardDescription>Accept and process school fee payments</CardDescription>
                    </div>
                    <Button onClick={() => setIsPaymentDialogOpen(true)} className="gap-2">
                      <Banknote className="h-4 w-4" />
                      Accept Payment
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search and Filter */}
                  <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        placeholder="Search payments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment, index) => (
                          <TableRow key={`payment-table-${payment.id}`}>
                            <TableCell className="font-medium">{payment.student_name}</TableCell>
                            <TableCell>{payment.class_name}</TableCell>
                            <TableCell className="font-bold">{formatCurrency(payment.amount)}</TableCell>
                            <TableCell>{payment.purpose}</TableCell>
                            <TableCell>{payment.payment_method}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  payment.status === 'completed' ? 'default' : 
                                  payment.status === 'pending' ? 'secondary' : 'destructive'
                                }
                              >
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handlePrintReceipt(payment)}
                                >
                                  <Printer className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Result Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Result Approval Management
                  </CardTitle>
                  <CardDescription>
                    Approve student results for parent viewing based on fee payment status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Fee Status</TableHead>
                          <TableHead>Amount Paid</TableHead>
                          <TableHead>Total Required</TableHead>
                          <TableHead>Result Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resultApprovals.map((approval) => (
                          <TableRow key={`approval-${approval.id}`}>
                            <TableCell className="font-medium">{approval.student_name}</TableCell>
                            <TableCell>{approval.class_name}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  approval.fee_status === 'paid' ? 'default' :
                                  approval.fee_status === 'partial' ? 'secondary' : 'destructive'
                                }
                              >
                                {approval.fee_status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatCurrency(approval.amount_paid)}</TableCell>
                            <TableCell>{formatCurrency(approval.total_fee_required)}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  approval.result_status === 'approved' ? 'default' :
                                  approval.result_status === 'blocked' ? 'destructive' : 'secondary'
                                }
                              >
                                {approval.result_status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleApproveResult(approval.id)}
                                  disabled={approval.result_status === 'approved' || approval.fee_status === 'unpaid'}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleBlockResult(approval.id)}
                                  disabled={approval.result_status === 'blocked'}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* Fee Structure Dialog */}
      <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Fee Structure</DialogTitle>
            <DialogDescription>
              Configure the fee structure for a specific class and term.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="class-select">Class</Label>
              <Select value={feeForm.class_id} onValueChange={(value) => setFeeForm({...feeForm, class_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={`class-option-${cls.id}`} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="term-select">Term</Label>
                <Select value={feeForm.term} onValueChange={(value) => setFeeForm({...feeForm, term: value})}>
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

              <div>
                <Label htmlFor="session-select">Session</Label>
                <Select value={feeForm.session} onValueChange={(value) => setFeeForm({...feeForm, session: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024/2025">2024/2025</SelectItem>
                    <SelectItem value="2025/2026">2025/2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="tuition">Tuition Fee (₦)</Label>
                <Input
                  id="tuition"
                  type="number"
                  value={feeForm.tuition_fee}
                  onChange={(e) => setFeeForm({...feeForm, tuition_fee: e.target.value})}
                  placeholder="45000"
                />
              </div>

              <div>
                <Label htmlFor="development">Development Fee (₦)</Label>
                <Input
                  id="development"
                  type="number"
                  value={feeForm.development_fee}
                  onChange={(e) => setFeeForm({...feeForm, development_fee: e.target.value})}
                  placeholder="5000"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="exam">Exam Fee (₦)</Label>
                  <Input
                    id="exam"
                    type="number"
                    value={feeForm.exam_fee}
                    onChange={(e) => setFeeForm({...feeForm, exam_fee: e.target.value})}
                    placeholder="2000"
                  />
                </div>

                <div>
                  <Label htmlFor="library">Library Fee (₦)</Label>
                  <Input
                    id="library"
                    type="number"
                    value={feeForm.library_fee}
                    onChange={(e) => setFeeForm({...feeForm, library_fee: e.target.value})}
                    placeholder="1500"
                  />
                </div>

                <div>
                  <Label htmlFor="sports">Sports Fee (₦)</Label>
                  <Input
                    id="sports"
                    type="number"
                    value={feeForm.sports_fee}
                    onChange={(e) => setFeeForm({...feeForm, sports_fee: e.target.value})}
                    placeholder="1000"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsFeeDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSetFeeStructure}>
                <Save className="h-4 w-4 mr-2" />
                Save Fee Structure
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EnhancedAccountantDashboard;