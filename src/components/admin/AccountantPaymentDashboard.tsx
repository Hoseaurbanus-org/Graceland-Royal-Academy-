import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';
import { 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Receipt, 
  Search,
  Filter,
  Download,
  Printer,
  FileText,
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { motion } from 'motion/react';

interface PaymentRecord {
  id: string;
  student_id: string;
  student_name: string;
  parent_id: string;
  parent_name?: string;
  amount: number;
  payment_method: 'bank_transfer' | 'card' | 'cash' | 'check';
  reference_number: string;
  payment_date: string;
  term: string;
  session: string;
  status: 'pending' | 'verified' | 'approved' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  receipt_generated?: boolean;
  class_level: string;
  created_at: string;
}

interface PaymentStatistics {
  total_payments: number;
  pending_verification: number;
  verified_payments: number;
  total_amount: number;
  completed_today: number;
}

export const AccountantPaymentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentRecord[]>([]);
  const [statistics, setStatistics] = useState<PaymentStatistics>({
    total_payments: 0,
    pending_verification: 0,
    verified_payments: 0,
    total_amount: 0,
    completed_today: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadPaymentData();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, filterStatus]);

  const loadPaymentData = async () => {
    setLoading(true);
    try {
      // Load from localStorage
      const localPayments = localStorage.getItem('graceland_accountant_payments') || '[]';
      const paymentsData: PaymentRecord[] = JSON.parse(localPayments);

      // Add parent names and created_at if missing
      const enrichedPayments = paymentsData.map(payment => ({
        ...payment,
        parent_name: payment.parent_name || 'Parent Name',
        created_at: payment.created_at || payment.payment_date,
      }));

      setPayments(enrichedPayments);
      updateStatistics(enrichedPayments);
    } catch (error) {
      console.error('Error loading payment data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const updateStatistics = (paymentsData: PaymentRecord[]) => {
    const stats: PaymentStatistics = {
      total_payments: paymentsData.length,
      pending_verification: paymentsData.filter(p => p.status === 'pending').length,
      verified_payments: paymentsData.filter(p => p.status === 'verified' || p.status === 'approved').length,
      total_amount: paymentsData
        .filter(p => p.status === 'verified' || p.status === 'approved')
        .reduce((sum, p) => sum + p.amount, 0),
      completed_today: paymentsData.filter(p => {
        const today = new Date().toDateString();
        return (p.verified_at && new Date(p.verified_at).toDateString() === today) ||
               (p.status === 'approved' && new Date(p.payment_date).toDateString() === today);
      }).length
    };
    setStatistics(stats);
  };

  const filterPayments = () => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.class_level.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === filterStatus);
    }

    setFilteredPayments(filtered);
  };

  const handleVerifyPayment = async (paymentId: string, action: 'approve' | 'reject') => {
    setLoading(true);
    try {
      const updatedPayments = payments.map(payment => {
        if (payment.id === paymentId) {
          const updatedPayment = {
            ...payment,
            status: action === 'approve' ? 'verified' as const : 'rejected' as const,
            verified_by: user?.id || 'accountant',
            verified_at: new Date().toISOString(),
            ...(action === 'reject' && { rejection_reason: rejectionReason }),
            ...(action === 'approve' && { receipt_generated: true })
          };
          return updatedPayment;
        }
        return payment;
      });

      setPayments(updatedPayments);
      
      // Update localStorage
      localStorage.setItem('graceland_accountant_payments', JSON.stringify(updatedPayments));
      
      // Update parent payments as well
      const parentPayments = JSON.parse(localStorage.getItem('graceland_parent_payments') || '[]');
      const updatedParentPayments = parentPayments.map((payment: PaymentRecord) => {
        if (payment.id === paymentId) {
          return {
            ...payment,
            status: action === 'approve' ? 'verified' as const : 'rejected' as const,
            verified_by: user?.id || 'accountant',
            verified_at: new Date().toISOString(),
            ...(action === 'reject' && { rejection_reason: rejectionReason }),
            ...(action === 'approve' && { receipt_generated: true })
          };
        }
        return payment;
      });
      localStorage.setItem('graceland_parent_payments', JSON.stringify(updatedParentPayments));

      updateStatistics(updatedPayments);
      toast.success(`Payment ${action}d successfully`);
      
      if (action === 'reject') {
        setIsRejectDialogOpen(false);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReceipt = (payment: PaymentRecord) => {
    // In a real app, this would generate and download a PDF receipt
    toast.success('Receipt generated successfully');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (user?.role !== 'accountant') {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Access denied. Accountant privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy">Payment Management</h2>
          <p className="text-gray-600">Verify and manage school fee payments</p>
        </div>
        <div className="flex space-x-2">
          <Button className="bg-navy hover:bg-navy/80 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Payments</p>
                <p className="text-2xl font-bold">{statistics.total_payments}</p>
              </div>
              <FileText className="w-8 h-8 text-white/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Pending</p>
                <p className="text-2xl font-bold">{statistics.pending_verification}</p>
              </div>
              <Clock className="w-8 h-8 text-white/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Verified</p>
                <p className="text-2xl font-bold">{statistics.verified_payments}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-white/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Amount</p>
                <p className="text-lg font-bold">{formatCurrency(statistics.total_amount)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-white/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-navy to-blue-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Today</p>
                <p className="text-2xl font-bold">{statistics.completed_today}</p>
              </div>
              <Calendar className="w-8 h-8 text-white/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-navy">Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search Payments</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by student name, reference, or class..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filter">Filter by Status</Label>
              <select
                id="filter"
                aria-label="Filter by Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No payment records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-navy text-white">
                    <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Student</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Class</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Method</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Reference</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <motion.tr 
                      key={payment.id} 
                      className="hover:bg-gray-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div>
                          <p className="font-medium">{payment.student_name}</p>
                          <p className="text-sm text-gray-500">{payment.parent_name}</p>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{payment.class_level}</td>
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
                          {getStatusIcon(payment.status)}
                          {getStatusBadge(payment.status)}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex space-x-1">
                          {payment.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleVerifyPayment(payment.id, 'approve')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={loading}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verify
                              </Button>
                              <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedPayment(payment)}
                                    className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Reject
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle className="text-navy">Reject Payment</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <p>Are you sure you want to reject this payment?</p>
                                    <div>
                                      <Label htmlFor="rejection_reason">Reason for Rejection</Label>
                                      <Textarea
                                        id="rejection_reason"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Please provide a reason for rejection..."
                                        rows={3}
                                      />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                      <Button 
                                        variant="outline" 
                                        onClick={() => setIsRejectDialogOpen(false)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={() => handleVerifyPayment(selectedPayment?.id || '', 'reject')}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        disabled={!rejectionReason.trim()}
                                      >
                                        Reject Payment
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                          {payment.receipt_generated && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerateReceipt(payment)}
                              className="text-navy border-navy hover:bg-navy hover:text-white"
                            >
                              <Receipt className="w-3 h-3 mr-1" />
                              Receipt
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
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

export default AccountantPaymentDashboard;