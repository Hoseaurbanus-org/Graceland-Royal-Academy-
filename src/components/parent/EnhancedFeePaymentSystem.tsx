import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner@2.0.3';
import { 
  CreditCard, 
  DollarSign, 
  Receipt, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Download,
  History,
  Wallet,
  Calendar,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { motion } from 'motion/react';

interface FeeStructure {
  id: string;
  class_level: string;
  tuition: number;
  development_levy: number;
  sports_fee: number;
  examination_fee: number;
  pta_fee: number;
  total_amount: number;
  term: string;
  session: string;
}

interface PaymentRecord {
  id: string;
  student_id: string;
  student_name: string;
  parent_id: string;
  amount: number;
  payment_method: 'bank_transfer' | 'card' | 'cash' | 'check';
  reference_number: string;
  payment_date: string;
  term: string;
  session: string;
  status: 'pending' | 'verified' | 'approved' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  receipt_generated?: boolean;
  class_level: string;
}

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  class_level: string;
  parent_id: string;
}

export const EnhancedFeePaymentSystem: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [selectedSession, setSelectedSession] = useState('2024/2025');

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    payment_method: 'bank_transfer' as const,
    reference_number: '',
    payment_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedTerm, selectedSession]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load demo data for parent user
      const demoStudents: Student[] = [
        {
          id: '1',
          student_id: 'GRA20241001',
          full_name: 'John Doe Jr.',
          class_level: 'JSS 1',
          parent_id: user?.id || 'parent1'
        },
        {
          id: '2',
          student_id: 'GRA20241002', 
          full_name: 'Jane Doe',
          class_level: 'JSS 2',
          parent_id: user?.id || 'parent1'
        }
      ];

      const demoFeeStructures: FeeStructure[] = [
        {
          id: '1',
          class_level: 'JSS 1',
          tuition: 150000,
          development_levy: 25000,
          sports_fee: 10000,
          examination_fee: 15000,
          pta_fee: 5000,
          total_amount: 205000,
          term: selectedTerm,
          session: selectedSession
        },
        {
          id: '2',
          class_level: 'JSS 2',
          tuition: 155000,
          development_levy: 25000,
          sports_fee: 10000,
          examination_fee: 15000,
          pta_fee: 5000,
          total_amount: 210000,
          term: selectedTerm,
          session: selectedSession
        }
      ];

      // Load from localStorage
      const localPayments = localStorage.getItem('graceland_parent_payments');
      let paymentsData: PaymentRecord[] = [];
      
      if (localPayments) {
        paymentsData = JSON.parse(localPayments);
      }

      setStudents(demoStudents);
      setFeeStructures(demoFeeStructures);
      setPaymentRecords(paymentsData.filter(p => p.parent_id === (user?.id || 'parent1')));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !paymentForm.reference_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newPayment: PaymentRecord = {
        id: Date.now().toString(),
        student_id: selectedStudent.id,
        student_name: selectedStudent.full_name,
        parent_id: user?.id || 'parent1',
        ...paymentForm,
        term: selectedTerm,
        session: selectedSession,
        status: 'pending',
        class_level: selectedStudent.class_level,
      };

      const existingPayments = JSON.parse(localStorage.getItem('graceland_parent_payments') || '[]');
      const updatedPayments = [newPayment, ...existingPayments];
      
      localStorage.setItem('graceland_parent_payments', JSON.stringify(updatedPayments));
      
      // Also add to accountant's queue
      const accountantQueue = JSON.parse(localStorage.getItem('graceland_accountant_payments') || '[]');
      accountantQueue.push(newPayment);
      localStorage.setItem('graceland_accountant_payments', JSON.stringify(accountantQueue));

      setPaymentRecords([newPayment, ...paymentRecords]);
      
      toast.success('Payment submitted for verification');
      resetPaymentForm();
      setIsPaymentDialogOpen(false);
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: 0,
      payment_method: 'bank_transfer',
      reference_number: '',
      payment_date: new Date().toISOString().split('T')[0],
    });
    setSelectedStudent(null);
  };

  const getFeeStructureForClass = (classLevel: string): FeeStructure | undefined => {
    return feeStructures.find(f => f.class_level === classLevel);
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Verification</Badge>;
      case 'verified':
        return <Badge className="bg-blue-100 text-blue-800">Verified</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPaymentProgress = (student: Student): number => {
    const approvedPayments = paymentRecords.filter(p => 
      p.student_id === student.id && 
      p.status === 'approved' &&
      p.term === selectedTerm &&
      p.session === selectedSession
    );
    const totalPaid = approvedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const feeStructure = getFeeStructureForClass(student.class_level);
    const totalRequired = feeStructure?.total_amount || 0;
    return totalRequired > 0 ? Math.min((totalPaid / totalRequired) * 100, 100) : 0;
  };

  const isResultAccessAllowed = (student: Student): boolean => {
    return getPaymentProgress(student) === 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!user || user.role !== 'parent') {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Access denied. Parent access required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy">Fee Payment Portal</h2>
          <p className="text-gray-600">Manage school fee payments for your children</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="First Term">First Term</option>
            <option value="Second Term">Second Term</option>
            <option value="Third Term">Third Term</option>
          </select>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="2024/2025">2024/2025</option>
            <option value="2023/2024">2023/2024</option>
          </select>
        </div>
      </div>

      {/* Student Payment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {students.map((student) => {
          const feeStructure = getFeeStructureForClass(student.class_level);
          const progress = getPaymentProgress(student);
          const hasAccess = isResultAccessAllowed(student);
          
          return (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`relative overflow-hidden ${hasAccess ? 'ring-2 ring-green-200' : ''}`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-navy/10 to-gold/10 rounded-bl-full"></div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-navy">{student.full_name}</CardTitle>
                      <p className="text-sm text-gray-600">{student.student_id} • {student.class_level}</p>
                    </div>
                    {hasAccess && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Results Accessible
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {feeStructure && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Payment Progress</span>
                          <span className="font-medium">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Total Required:</span>
                          <span className="font-bold text-navy">
                            {formatCurrency(feeStructure.total_amount)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Tuition:</span>
                          <span>{formatCurrency(feeStructure.tuition)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Development Levy:</span>
                          <span>{formatCurrency(feeStructure.development_levy)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sports Fee:</span>
                          <span>{formatCurrency(feeStructure.sports_fee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Examination Fee:</span>
                          <span>{formatCurrency(feeStructure.examination_fee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>PTA Fee:</span>
                          <span>{formatCurrency(feeStructure.pta_fee)}</span>
                        </div>
                      </div>

                      {!hasAccess && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Complete payment to access student results and reports.
                          </AlertDescription>
                        </Alert>
                      )}

                      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full bg-navy hover:bg-navy/80 text-white"
                            onClick={() => {
                              setSelectedStudent(student);
                              setPaymentForm(prev => ({
                                ...prev,
                                amount: feeStructure.total_amount
                              }));
                            }}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Make Payment
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-navy">
                              Payment for {selectedStudent?.full_name}
                            </DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handlePaymentSubmit} className="space-y-4">
                            <div>
                              <Label htmlFor="amount">Amount (NGN) *</Label>
                              <Input
                                id="amount"
                                type="number"
                                value={paymentForm.amount}
                                onChange={(e) => setPaymentForm(prev => ({ 
                                  ...prev, 
                                  amount: parseInt(e.target.value) || 0 
                                }))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="payment_method">Payment Method *</Label>
                              <Select 
                                value={paymentForm.payment_method} 
                                onValueChange={(value: any) => setPaymentForm(prev => ({ 
                                  ...prev, 
                                  payment_method: value 
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                  <SelectItem value="card">Card Payment</SelectItem>
                                  <SelectItem value="cash">Cash</SelectItem>
                                  <SelectItem value="check">Check</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="reference_number">Transaction Reference *</Label>
                              <Input
                                id="reference_number"
                                value={paymentForm.reference_number}
                                onChange={(e) => setPaymentForm(prev => ({ 
                                  ...prev, 
                                  reference_number: e.target.value 
                                }))}
                                placeholder="Enter transaction reference"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="payment_date">Payment Date *</Label>
                              <Input
                                id="payment_date"
                                type="date"
                                value={paymentForm.payment_date}
                                onChange={(e) => setPaymentForm(prev => ({ 
                                  ...prev, 
                                  payment_date: e.target.value 
                                }))}
                                required
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsPaymentDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit" 
                                disabled={loading}
                                className="bg-navy hover:bg-navy/80"
                              >
                                <Wallet className="w-4 h-4 mr-2" />
                                {loading ? 'Submitting...' : 'Submit Payment'}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-navy">
            <History className="w-5 h-5 mr-2" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading payment history...</p>
            </div>
          ) : paymentRecords.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No payment records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-navy text-white">
                    <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Student</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Method</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Reference</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentRecords.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div>
                          <p className="font-medium">{payment.student_name}</p>
                          <p className="text-sm text-gray-500">{payment.class_level}</p>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 font-bold">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 capitalize">
                        {payment.payment_method.replace('_', ' ')}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {payment.reference_number}
                        </code>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex items-center space-x-2">
                          {getPaymentStatusIcon(payment.status)}
                          {getPaymentStatusBadge(payment.status)}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {payment.receipt_generated && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-navy border-navy hover:bg-navy hover:text-white"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedFeePaymentSystem;