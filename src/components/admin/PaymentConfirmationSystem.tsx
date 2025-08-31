import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { PDFGenerator } from '../PDFGenerator';
import { PaymentDetailsDialog } from './PaymentDetailsDialog';
import { 
  PaymentRecord, 
  getStatusColor, 
  getStatusIcon, 
  getPaymentMethodColor,
  generateReceiptNumber,
  calculatePaymentStatistics,
  formatCurrency,
  formatDate
} from './payment-utils';
import { MOCK_PAYMENT_RECORDS, PROCESSING_STATUS } from './payment-constants';

export function PaymentConfirmationSystem() {
  const { user } = useAuth();
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>(MOCK_PAYMENT_RECORDS);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const stats = calculatePaymentStatistics(paymentRecords);
  
  const handleConfirmPayment = async (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setShowConfirmDialog(true);
  };

  const handleRejectPayment = async (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setShowRejectDialog(true);
  };

  const confirmPayment = async () => {
    if (!selectedPayment) return;
    
    setProcessingStatus(PROCESSING_STATUS.PROCESSING);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const receiptNumber = generateReceiptNumber();
      
      setPaymentRecords(prev => prev.map(p => 
        p.id === selectedPayment.id ? {
          ...p,
          status: 'confirmed' as const,
          receiptNumber,
          confirmedBy: user?.name || 'Admin',
          confirmedAt: new Date().toISOString(),
          adminNotes
        } : p
      ));

      setProcessingStatus(PROCESSING_STATUS.SUCCESS);
      setShowConfirmDialog(false);
      setAdminNotes('');
      
      setTimeout(() => setProcessingStatus(PROCESSING_STATUS.IDLE), 2000);
    } catch (error) {
      setProcessingStatus(PROCESSING_STATUS.IDLE);
      alert('Failed to confirm payment. Please try again.');
    }
  };

  const rejectPayment = async () => {
    if (!selectedPayment || !adminNotes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessingStatus(PROCESSING_STATUS.PROCESSING);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      setPaymentRecords(prev => prev.map(p => 
        p.id === selectedPayment.id ? {
          ...p,
          status: 'rejected' as const,
          rejectedBy: user?.name || 'Admin',
          rejectedAt: new Date().toISOString(),
          adminNotes
        } : p
      ));

      setProcessingStatus(PROCESSING_STATUS.SUCCESS);
      setShowRejectDialog(false);
      setAdminNotes('');
      
      setTimeout(() => setProcessingStatus(PROCESSING_STATUS.IDLE), 2000);
    } catch (error) {
      setProcessingStatus(PROCESSING_STATUS.IDLE);
      alert('Failed to reject payment. Please try again.');
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

  const renderPaymentTable = (payments: PaymentRecord[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Parent</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => {
          const StatusIcon = getStatusIcon(payment.status);
          return (
            <TableRow key={payment.id}>
              <TableCell>{formatDate(payment.date)}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{payment.studentName}</div>
                  <div className="text-sm text-muted-foreground">
                    {payment.class} • {payment.studentId}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{payment.parentName}</div>
                  <div className="text-sm text-muted-foreground">{payment.parentPhone}</div>
                </div>
              </TableCell>
              <TableCell className="font-bold">{formatCurrency(payment.amount)}</TableCell>
              <TableCell>{payment.paymentType}</TableCell>
              <TableCell>
                <Badge className={getPaymentMethodColor(payment.paymentMethod)}>
                  {payment.paymentMethod.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(payment.status)}>
                  <div className="flex items-center gap-1">
                    <StatusIcon className="h-4 w-4" />
                    {payment.status}
                  </div>
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <PaymentDetailsDialog 
                    payment={payment}
                    onConfirm={handleConfirmPayment}
                    onReject={handleRejectPayment}
                  />
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
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Payment Confirmation System</h2>
        <p className="text-muted-foreground">
          Review and process parent fee payment submissions
        </p>
      </div>

      {/* Success Alert */}
      {processingStatus === PROCESSING_STATUS.SUCCESS && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Payment processed successfully! Parent will be notified of the status update.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(stats.totalPendingAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(stats.totalConfirmedAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-sm text-muted-foreground">Requires follow-up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-sm text-muted-foreground">All submissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({stats.confirmed})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
          <TabsTrigger value="all">All Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Pending Payment Confirmations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                {renderPaymentTable(paymentRecords.filter(p => p.status === 'pending'))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confirmed">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Confirmed Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                {renderPaymentTable(paymentRecords.filter(p => p.status === 'confirmed'))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Rejected Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                {renderPaymentTable(paymentRecords.filter(p => p.status === 'rejected'))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Payment Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                {renderPaymentTable(paymentRecords)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to confirm this payment? A receipt will be generated.</p>
            <div>
              <Label htmlFor="confirmNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="confirmNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes about this confirmation..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={confirmPayment}
                disabled={processingStatus === PROCESSING_STATUS.PROCESSING}
                className="flex-1"
              >
                {processingStatus === PROCESSING_STATUS.PROCESSING ? 'Processing...' : 'Confirm Payment'}
              </Button>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Please provide a reason for rejecting this payment.</p>
            <div>
              <Label htmlFor="rejectNotes">Reason for Rejection *</Label>
              <Textarea
                id="rejectNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Explain why this payment is being rejected..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="destructive"
                onClick={rejectPayment}
                disabled={processingStatus === PROCESSING_STATUS.PROCESSING || !adminNotes.trim()}
                className="flex-1"
              >
                {processingStatus === PROCESSING_STATUS.PROCESSING ? 'Processing...' : 'Reject Payment'}
              </Button>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}