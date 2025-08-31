import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useAuth } from '../AuthContext';
import { usePayment } from './PaymentContext';
import { DocumentWatermark, HeaderLogo } from '../SchoolWatermark';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Eye, 
  DollarSign, 
  CreditCard,
  FileText,
  Download,
  Bell,
  UserCheck,
  Calendar,
  Receipt
} from 'lucide-react';

export function PaymentVerificationSystem() {
  const { user } = useAuth();
  const { 
    payments, 
    updatePaymentStatus, 
    getPaymentsByStatus,
    generatePaymentReceipt,
    notifyPaymentUpdate 
  } = usePayment();
  
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get payments based on user role
  const pendingPayments = getPaymentsByStatus('pending');
  const verifiedPayments = getPaymentsByStatus('verified');
  const rejectedPayments = getPaymentsByStatus('rejected');

  // Filter payments based on search
  const filterPayments = (paymentList: any[]) => {
    if (!searchTerm) return paymentList;
    return paymentList.filter(payment => 
      payment.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.parentName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleVerifyPayment = async (paymentId: string, status: 'verified' | 'rejected') => {
    setIsProcessing(true);
    try {
      const success = updatePaymentStatus(paymentId, status, verificationNotes, user?.id);
      
      if (success) {
        // Notify parent of payment status update
        await notifyPaymentUpdate(paymentId, status);
        
        // Generate receipt if verified
        if (status === 'verified') {
          await generatePaymentReceipt(paymentId);
        }
        
        setSelectedPayment(null);
        setVerificationNotes('');
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const PaymentDetailsDialog = ({ payment, onClose }: { payment: any; onClose: () => void }) => (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="relative">
        <DocumentWatermark />
        <DialogHeader className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <HeaderLogo size="medium" />
            <div>
              <DialogTitle className="text-navy">Payment Verification Details</DialogTitle>
              <DialogDescription>
                Review and verify payment information
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="relative z-10 space-y-6">
          {/* Payment Information */}
          <Card className="border-navy/20">
            <CardHeader className="bg-gradient-to-r from-navy to-blue-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-navy font-semibold">Student Name</Label>
                  <p className="text-gray-700">{payment.studentName}</p>
                </div>
                <div>
                  <Label className="text-navy font-semibold">Parent/Guardian</Label>
                  <p className="text-gray-700">{payment.parentName}</p>
                </div>
                <div>
                  <Label className="text-navy font-semibold">Payment Reference</Label>
                  <p className="text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded">
                    {payment.paymentReference}
                  </p>
                </div>
                <div>
                  <Label className="text-navy font-semibold">Amount</Label>
                  <p className="text-gold font-bold text-lg">₦{payment.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-navy font-semibold">Payment Date</Label>
                  <p className="text-gray-700">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-navy font-semibold">Payment Method</Label>
                  <p className="text-gray-700">{payment.paymentMethod}</p>
                </div>
                <div>
                  <Label className="text-navy font-semibold">Fee Type</Label>
                  <p className="text-gray-700">{payment.feeType}</p>
                </div>
                <div>
                  <Label className="text-navy font-semibold">Current Status</Label>
                  {getStatusBadge(payment.status)}
                </div>
              </div>
              
              {payment.description && (
                <div>
                  <Label className="text-navy font-semibold">Description</Label>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {payment.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bank Details (if available) */}
          {payment.bankDetails && (
            <Card className="border-gold/30">
              <CardHeader className="bg-gradient-to-r from-gold to-amber-500 text-navy">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Bank Transfer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-navy font-semibold">Bank Name</Label>
                    <p className="text-gray-700">{payment.bankDetails.bankName}</p>
                  </div>
                  <div>
                    <Label className="text-navy font-semibold">Account Number</Label>
                    <p className="text-gray-700 font-mono">{payment.bankDetails.accountNumber}</p>
                  </div>
                  <div>
                    <Label className="text-navy font-semibold">Transaction Reference</Label>
                    <p className="text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded">
                      {payment.bankDetails.transactionRef}
                    </p>
                  </div>
                  <div>
                    <Label className="text-navy font-semibold">Transfer Date</Label>
                    <p className="text-gray-700">
                      {new Date(payment.bankDetails.transferDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Section - Only for accountants */}
          {user?.role === 'accountant' && payment.status === 'pending' && (
            <Card className="border-blue-300">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-navy">
                  <UserCheck className="w-5 h-5" />
                  Verification Action
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="verification-notes" className="text-navy font-semibold">
                    Verification Notes
                  </Label>
                  <Textarea
                    id="verification-notes"
                    placeholder="Add notes about the verification process..."
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleVerifyPayment(payment.id, 'verified')}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Processing...' : 'Verify Payment'}
                  </Button>
                  
                  <Button
                    onClick={() => handleVerifyPayment(payment.id, 'rejected')}
                    disabled={isProcessing}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Processing...' : 'Reject Payment'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Previous Verification History */}
          {payment.verificationHistory && payment.verificationHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy">
                  <FileText className="w-5 h-5" />
                  Verification History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payment.verificationHistory.map((entry: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="mt-1">
                        {entry.action === 'verified' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{entry.verifiedBy}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">
                            {new Date(entry.verifiedAt).toLocaleString()}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-gray-700 text-sm mt-1">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  const PaymentTable = ({ payments, title }: { payments: any[]; title: string }) => (
    <Card className="border-navy/20">
      <CardHeader className="bg-gradient-to-r from-navy to-blue-700 text-white">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          {title} ({payments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {payments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No payments found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Fee Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-blue-50/50">
                  <TableCell className="font-medium">{payment.studentName}</TableCell>
                  <TableCell>{payment.parentName}</TableCell>
                  <TableCell className="font-bold text-gold">
                    ₦{payment.amount?.toLocaleString()}
                  </TableCell>
                  <TableCell>{payment.feeType}</TableCell>
                  <TableCell>
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        {selectedPayment && (
                          <PaymentDetailsDialog
                            payment={selectedPayment}
                            onClose={() => setSelectedPayment(null)}
                          />
                        )}
                      </Dialog>
                      
                      {payment.status === 'verified' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generatePaymentReceipt(payment.id)}
                          className="text-gold border-gold hover:bg-gold hover:text-navy"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 relative">
      <BackgroundWatermark />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeaderLogo size="large" />
          <div>
            <h1 className="text-2xl font-bold text-navy">Payment Verification System</h1>
            <p className="text-gray-600">Manage and verify school fee payments</p>
          </div>
        </div>
        
        {/* Notification Bell for pending payments */}
        {user?.role === 'accountant' && pendingPayments.length > 0 && (
          <div className="relative">
            <Bell className="w-6 h-6 text-gold animate-pulse" />
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2">
              {pendingPayments.length}
            </Badge>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="border-gold/30">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Label htmlFor="search" className="text-navy font-semibold">Search Payments</Label>
              <Input
                id="search"
                placeholder="Search by student name, parent name, or payment reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status Summary for Accountants */}
      {user?.role === 'accountant' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-yellow-700">{pendingPayments.length}</p>
                  <p className="text-yellow-600">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-300 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-700">{verifiedPayments.length}</p>
                  <p className="text-green-600">Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-red-300 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-700">{rejectedPayments.length}</p>
                  <p className="text-red-600">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Tables */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-navy/10">
          <TabsTrigger value="pending" className="data-[state=active]:bg-navy data-[state=active]:text-white">
            Pending ({filterPayments(pendingPayments).length})
          </TabsTrigger>
          <TabsTrigger value="verified" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Verified ({filterPayments(verifiedPayments).length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Rejected ({filterPayments(rejectedPayments).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PaymentTable 
            payments={filterPayments(pendingPayments)} 
            title="Pending Payments" 
          />
        </TabsContent>

        <TabsContent value="verified">
          <PaymentTable 
            payments={filterPayments(verifiedPayments)} 
            title="Verified Payments" 
          />
        </TabsContent>

        <TabsContent value="rejected">
          <PaymentTable 
            payments={filterPayments(rejectedPayments)} 
            title="Rejected Payments" 
          />
        </TabsContent>
      </Tabs>

      {/* Important Notice for Accountants */}
      {user?.role === 'accountant' && (
        <Alert className="border-gold bg-gold/10">
          <AlertTriangle className="h-4 w-4 text-gold" />
          <AlertDescription className="text-navy">
            <strong>Important:</strong> Verify all payment details carefully before approval. 
            Once verified, parents will receive automatic notification and students will gain access to their results.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Background watermark component for this specific system
function BackgroundWatermark() {
  return (
    <div className="fixed inset-0 pointer-events-none select-none z-0 opacity-[0.02]">
      <div className="absolute inset-0 bg-gradient-to-br from-navy/10 via-transparent to-gold/10" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <HeaderLogo size="large" />
      </div>
    </div>
  );
}

export default PaymentVerificationSystem;