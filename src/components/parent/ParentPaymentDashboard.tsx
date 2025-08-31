import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  User, 
  FileText, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Download
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useCalendar } from '../CalendarContext';
import { PDFGenerator } from '../PDFGenerator';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import schoolLogo from 'figma:asset/fb26b4b240c171a6f425a75dbfc39e0ff4799694.png';

interface FeeStructure {
  id: string;
  class: string;
  items: {
    [key: string]: {
      name: string;
      amount: number;
      required: boolean;
    };
  };
  totalRequired: number;
  totalOptional: number;
}

interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  amount: number;
  paymentType: string;
  paymentMethod: 'cash' | 'transfer' | 'pos' | 'cheque' | 'online';
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  term: string;
  session: string;
  date: string;
  status: 'pending' | 'confirmed' | 'rejected';
  receiptNumber?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    transactionRef: string;
  };
  confirmedBy?: string;
  confirmedAt?: string;
  notes?: string;
}

export function ParentPaymentDashboard() {
  const { user } = useAuth();
  const { currentTerm, currentSession } = useCalendar();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentType: '',
    paymentMethod: 'cash' as const,
    parentName: user?.name || '',
    parentPhone: '',
    parentEmail: user?.email || '',
    bankDetails: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      transactionRef: ''
    },
    notes: ''
  });
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // Mock fee structures
  const feeStructures: FeeStructure[] = [
    {
      id: 'primary-fee',
      class: 'Primary',
      items: {
        tuition: { name: 'Tuition Fee', amount: 250000, required: true },
        development: { name: 'Development Fee', amount: 50000, required: true },
        sports: { name: 'Sports Fee', amount: 25000, required: true },
        library: { name: 'Library Fee', amount: 15000, required: true },
        pta: { name: 'PTA Fee', amount: 10000, required: true },
        uniform: { name: 'School Uniform', amount: 45000, required: false },
        feeding: { name: 'Feeding Fee', amount: 150000, required: false },
        transport: { name: 'Transport Fee', amount: 75000, required: false }
      },
      totalRequired: 350000,
      totalOptional: 270000
    },
    {
      id: 'secondary-fee',
      class: 'Secondary',
      items: {
        tuition: { name: 'Tuition Fee', amount: 350000, required: true },
        development: { name: 'Development Fee', amount: 75000, required: true },
        laboratory: { name: 'Laboratory Fee', amount: 50000, required: true },
        library: { name: 'Library Fee', amount: 20000, required: true },
        sports: { name: 'Sports Fee', amount: 30000, required: true },
        pta: { name: 'PTA Fee', amount: 15000, required: true },
        uniform: { name: 'School Uniform', amount: 65000, required: false },
        feeding: { name: 'Feeding Fee', amount: 180000, required: false },
        transport: { name: 'Transport Fee', amount: 85000, required: false }
      },
      totalRequired: 540000,
      totalOptional: 330000
    }
  ];

  // Mock payment records
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([
    {
      id: 'pay-001',
      studentId: 'gra25/pry/001',
      studentName: 'John Doe Jr.',
      class: 'Primary 1',
      amount: 100000,
      paymentType: 'Part Payment - Tuition',
      paymentMethod: 'transfer',
      parentName: 'Mr. John Smith',
      parentPhone: '+234-XXX-XXX-XXXX',
      parentEmail: 'john.smith@gmail.com',
      term: 'First Term',
      session: '2024/2025',
      date: '2024-12-15T10:00:00Z',
      status: 'confirmed',
      receiptNumber: 'GRA/RCT/001/2024',
      bankDetails: {
        accountName: 'John Smith',
        accountNumber: '1234567890',
        bankName: 'First Bank',
        transactionRef: 'FBN123456789'
      },
      confirmedBy: 'Mrs. Comfort Nwankwo',
      confirmedAt: '2024-12-15T14:30:00Z'
    },
    {
      id: 'pay-002',
      studentId: 'gra25/pry/025',
      studentName: 'Jane Doe',
      class: 'Primary 3',
      amount: 25000,
      paymentType: 'Sports Fee',
      paymentMethod: 'cash',
      parentName: 'Mr. John Smith',
      parentPhone: '+234-XXX-XXX-XXXX',
      term: 'First Term',
      session: '2024/2025',
      date: '2024-12-18T09:30:00Z',
      status: 'pending',
      notes: 'Paid at school office'
    }
  ]);

  const students = user?.children || [];

  const getFeeStructureForStudent = (studentClass: string): FeeStructure | null => {
    if (studentClass.toLowerCase().includes('primary')) {
      return feeStructures.find(f => f.class === 'Primary') || null;
    }
    if (studentClass.toLowerCase().includes('jss') || studentClass.toLowerCase().includes('sss')) {
      return feeStructures.find(f => f.class === 'Secondary') || null;
    }
    return null;
  };

  const getStudentPayments = (studentId: string) => {
    return paymentRecords.filter(record => record.studentId === studentId);
  };

  const getTotalPaidForStudent = (studentId: string) => {
    return getStudentPayments(studentId)
      .filter(payment => payment.status === 'confirmed')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedStudent || !paymentForm.amount || !paymentForm.paymentType || !paymentForm.parentName || !paymentForm.parentPhone) {
      alert('Please fill in all required fields');
      return;
    }

    const student = students.find(s => s.studentId === selectedStudent);
    if (!student) return;

    setPaymentStatus('submitting');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newPayment: PaymentRecord = {
        id: `pay-${Date.now()}`,
        studentId: student.studentId,
        studentName: student.name,
        class: student.class,
        amount: paymentForm.amount,
        paymentType: paymentForm.paymentType,
        paymentMethod: paymentForm.paymentMethod,
        parentName: paymentForm.parentName,
        parentPhone: paymentForm.parentPhone,
        parentEmail: paymentForm.parentEmail,
        term: currentTerm?.name || 'First Term',
        session: currentSession?.name || '2024/2025',
        date: new Date().toISOString(),
        status: 'pending',
        bankDetails: paymentForm.paymentMethod === 'transfer' ? paymentForm.bankDetails : undefined,
        notes: paymentForm.notes
      };

      setPaymentRecords(prev => [newPayment, ...prev]);
      setPaymentStatus('success');

      // Reset form
      setPaymentForm({
        amount: 0,
        paymentType: '',
        paymentMethod: 'cash',
        parentName: user?.name || '',
        parentPhone: '',
        parentEmail: user?.email || '',
        bankDetails: {
          accountName: '',
          accountNumber: '',
          bankName: '',
          transactionRef: ''
        },
        notes: ''
      });

      setTimeout(() => {
        setPaymentStatus('idle');
        setShowPaymentDialog(false);
      }, 2000);

    } catch (error) {
      setPaymentStatus('error');
      alert('Payment submission failed. Please try again.');
    }
  };

  const generateReceipt = (payment: PaymentRecord) => {
    if (payment.status !== 'confirmed' || !payment.receiptNumber) return;

    const receiptData = {
      receiptNumber: payment.receiptNumber,
      studentId: payment.studentId,
      studentName: payment.studentName,
      class: payment.class,
      parentName: payment.parentName,
      paymentDate: payment.date,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      paymentType: payment.paymentType,
      term: payment.term,
      session: payment.session,
      accountantName: payment.confirmedBy || 'School Accountant'
    };

    PDFGenerator.generatePaymentReceipt(receiptData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo Watermark */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-3 pointer-events-none z-0">
        <ImageWithFallback 
          src={schoolLogo} 
          alt="Graceland Royal Academy" 
          className="w-96 h-96 object-contain"
        />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Fee Payment Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your children's school fees and view payment history
          </p>
        </div>
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogTrigger asChild>
            <Button>
              <CreditCard className="h-4 w-4 mr-2" />
              Make Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Submit Fee Payment</DialogTitle>
            </DialogHeader>
            
            {paymentStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Payment submitted successfully! You will receive confirmation once verified by the accounts department.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              {/* Student Selection */}
              <div>
                <Label htmlFor="student">Select Student *</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.studentId} value={student.studentId}>
                        {student.name} - {student.class} ({student.studentId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fee Structure Display */}
              {selectedStudent && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Fee Structure - {students.find(s => s.studentId === selectedStudent)?.class}</h4>
                  {(() => {
                    const student = students.find(s => s.studentId === selectedStudent);
                    const feeStructure = student ? getFeeStructureForStudent(student.class) : null;
                    const totalPaid = getTotalPaidForStudent(selectedStudent);
                    
                    return feeStructure ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(feeStructure.items).map(([key, item]) => (
                            <div key={key} className="flex justify-between items-center p-2 border rounded">
                              <div>
                                <span className="font-medium">{item.name}</span>
                                {!item.required && <Badge variant="outline" className="ml-2">Optional</Badge>}
                              </div>
                              <span className="font-bold">₦{item.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold">Total Required:</span>
                            <span className="font-bold text-green-600">₦{feeStructure.totalRequired.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold">Total Paid:</span>
                            <span className="font-bold text-blue-600">₦{totalPaid.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold">Outstanding:</span>
                            <span className="font-bold text-red-600">₦{Math.max(0, feeStructure.totalRequired - totalPaid).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Fee structure not available for this class</p>
                    );
                  })()}
                </div>
              )}

              {/* Payment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentType">Payment For *</Label>
                  <Select value={paymentForm.paymentType} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, paymentType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tuition">Tuition Fee</SelectItem>
                      <SelectItem value="development">Development Fee</SelectItem>
                      <SelectItem value="sports">Sports Fee</SelectItem>
                      <SelectItem value="library">Library Fee</SelectItem>
                      <SelectItem value="pta">PTA Fee</SelectItem>
                      <SelectItem value="laboratory">Laboratory Fee</SelectItem>
                      <SelectItem value="uniform">School Uniform</SelectItem>
                      <SelectItem value="feeding">Feeding Fee</SelectItem>
                      <SelectItem value="transport">Transport Fee</SelectItem>
                      <SelectItem value="part_payment">Part Payment</SelectItem>
                      <SelectItem value="full_payment">Full Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="amount">Amount (₦) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select value={paymentForm.paymentMethod} onValueChange={(value: any) => setPaymentForm(prev => ({ ...prev, paymentMethod: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash Payment</SelectItem>
                    <SelectItem value="transfer">Bank Transfer</SelectItem>
                    <SelectItem value="pos">POS/Card Payment</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bank Transfer Details */}
              {paymentForm.paymentMethod === 'transfer' && (
                <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-medium text-blue-900">Bank Transfer Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="accountName">Account Name *</Label>
                      <Input
                        id="accountName"
                        value={paymentForm.bankDetails.accountName}
                        onChange={(e) => setPaymentForm(prev => ({ 
                          ...prev, 
                          bankDetails: { ...prev.bankDetails, accountName: e.target.value }
                        }))}
                        placeholder="Account holder name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number *</Label>
                      <Input
                        id="accountNumber"
                        value={paymentForm.bankDetails.accountNumber}
                        onChange={(e) => setPaymentForm(prev => ({ 
                          ...prev, 
                          bankDetails: { ...prev.bankDetails, accountNumber: e.target.value }
                        }))}
                        placeholder="Account number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Input
                        id="bankName"
                        value={paymentForm.bankDetails.bankName}
                        onChange={(e) => setPaymentForm(prev => ({ 
                          ...prev, 
                          bankDetails: { ...prev.bankDetails, bankName: e.target.value }
                        }))}
                        placeholder="Bank name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="transactionRef">Transaction Reference *</Label>
                      <Input
                        id="transactionRef"
                        value={paymentForm.bankDetails.transactionRef}
                        onChange={(e) => setPaymentForm(prev => ({ 
                          ...prev, 
                          bankDetails: { ...prev.bankDetails, transactionRef: e.target.value }
                        }))}
                        placeholder="Transaction reference"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Parent Information */}
              <div className="space-y-4">
                <h4 className="font-medium">Parent/Guardian Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parentName">Full Name *</Label>
                    <Input
                      id="parentName"
                      value={paymentForm.parentName}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, parentName: e.target.value }))}
                      placeholder="Parent/Guardian name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentPhone">Phone Number *</Label>
                    <Input
                      id="parentPhone"
                      value={paymentForm.parentPhone}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, parentPhone: e.target.value }))}
                      placeholder="+234-XXX-XXX-XXXX"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="parentEmail">Email Address</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    value={paymentForm.parentEmail}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, parentEmail: e.target.value }))}
                    placeholder="parent@email.com"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information..."
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-2">
                <Button 
                  onClick={handlePaymentSubmit}
                  disabled={paymentStatus === 'submitting'}
                  className="flex-1"
                >
                  {paymentStatus === 'submitting' ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Payment
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Students Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map(student => {
          const feeStructure = getFeeStructureForStudent(student.class);
          const totalPaid = getTotalPaidForStudent(student.studentId);
          const totalRequired = feeStructure?.totalRequired || 0;
          const outstanding = Math.max(0, totalRequired - totalPaid);
          const paymentProgress = totalRequired > 0 ? (totalPaid / totalRequired) * 100 : 0;

          return (
            <Card key={student.studentId}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  {student.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {student.class} • {student.studentId}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Total Required:</span>
                    <span className="font-bold">₦{totalRequired.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Amount Paid:</span>
                    <span className="font-bold text-green-600">₦{totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Outstanding:</span>
                    <span className="font-bold text-red-600">₦{outstanding.toLocaleString()}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Payment Progress</span>
                      <span>{paymentProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <Badge className={outstanding === 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                    {outstanding === 0 ? 'Fees Complete' : 'Payment Pending'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Payment Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentRecords.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.studentName}</div>
                        <div className="text-sm text-muted-foreground">{payment.class}</div>
                      </div>
                    </TableCell>
                    <TableCell>{payment.paymentType}</TableCell>
                    <TableCell className="font-bold">₦{payment.amount.toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {payment.status === 'confirmed' && payment.receiptNumber && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateReceipt(payment)}
                            title="Download Receipt"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
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
    </div>
  );
}