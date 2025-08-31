import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { CreditCard, DollarSign, AlertTriangle, CheckCircle2, Copy, Download } from 'lucide-react';
import { PaymentInfo, Payment } from './types';
import { BANK_DETAILS } from './constants';
import { SCHOOL_INFO } from '../admin/constants';
import { 
  formatCurrency, 
  calculateRemainingBalance, 
  processPayment, 
  generateReceiptPDF,
  generateReceiptNumber
} from './utils';

interface PaymentFormProps {
  paymentInfo: PaymentInfo;
  onPaymentSubmitted: (updatedInfo: PaymentInfo, newPayment: Payment) => void;
}

export function PaymentForm({ paymentInfo, onPaymentSubmitted }: PaymentFormProps) {
  const [amount, setAmount] = useState('');
  const [transferReference, setTransferReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);

  const remainingBalance = calculateRemainingBalance(paymentInfo.totalFee, paymentInfo.totalPaid);
  const isFullyPaid = paymentInfo.status === 'cleared';

  const handleSubmitPayment = async () => {
    setIsSubmitting(true);
    
    try {
      const numAmount = parseFloat(amount);
      
      const result = await processPayment({
        studentId: paymentInfo.studentId,
        amount: numAmount,
        paymentMethod: 'bank_transfer',
        referenceNumber: transferReference,
        paymentDate: new Date().toISOString().split('T')[0]
      });
      
      if (result.success && result.payment) {
        // Generate receipt
        await generateReceiptPDF(paymentInfo, result.payment);
        
        // Update payment info
        const updatedInfo: PaymentInfo = {
          ...paymentInfo,
          totalPaid: paymentInfo.totalPaid + numAmount,
          payments: [...paymentInfo.payments, result.payment],
          status: (paymentInfo.totalPaid + numAmount) >= paymentInfo.totalFee ? 'cleared' : 'partial',
          lastPaymentDate: new Date().toISOString().split('T')[0]
        };
        
        onPaymentSubmitted(updatedInfo, result.payment);
        setAmount('');
        setTransferReference('');
        alert('Payment submitted successfully! Receipt downloaded.');
      } else {
        alert(result.error || 'Payment failed');
      }
    } catch (error) {
      alert('Error processing payment: ' + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyBankDetails = () => {
    const details = `${BANK_DETAILS.accountName}\n${BANK_DETAILS.accountNumber}\n${BANK_DETAILS.bankName}`;
    navigator.clipboard.writeText(details);
    alert('Bank details copied to clipboard!');
  };

  const downloadReceipt = async (payment: Payment) => {
    await generateReceiptPDF(paymentInfo, payment);
  };

  return (
    <div className="space-y-6">
      {/* Payment Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Fee Payment Status
          </CardTitle>
          <CardDescription>School fee payment information for {paymentInfo.studentName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(paymentInfo.totalFee)}
              </div>
              <p className="text-sm text-muted-foreground">Total School Fee</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(paymentInfo.totalPaid)}
              </div>
              <p className="text-sm text-muted-foreground">Amount Paid</p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(remainingBalance)}
              </div>
              <p className="text-sm text-muted-foreground">Outstanding Balance</p>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-center">
            <Badge variant={isFullyPaid ? 'default' : 'destructive'} className="text-sm px-4 py-2">
              {isFullyPaid ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Fees Cleared
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Payment Pending
                </>
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      {!isFullyPaid && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Make Payment
            </CardTitle>
            <CardDescription>Submit your school fee payment via bank transfer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Bank Details */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Bank Transfer Details</h4>
                  <Button variant="outline" size="sm" onClick={copyBankDetails}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Details
                  </Button>
                </div>
                <div className="space-y-1 text-sm">
                  <div><strong>Account Name:</strong> {BANK_DETAILS.accountName}</div>
                  <div><strong>Account Number:</strong> {BANK_DETAILS.accountNumber}</div>
                  <div><strong>Bank:</strong> {BANK_DETAILS.bankName}</div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Payment Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    max={remainingBalance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Max: ${formatCurrency(remainingBalance)}`}
                  />
                </div>
                
                <div>
                  <Label htmlFor="reference">Bank Transfer Reference</Label>
                  <Input
                    id="reference"
                    type="text"
                    value={transferReference}
                    onChange={(e) => setTransferReference(e.target.value)}
                    placeholder="e.g., TXN123456789"
                  />
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  After making the bank transfer, enter the amount and transfer reference above. 
                  Your payment will be verified and results will be accessible once cleared.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleSubmitPayment} 
                disabled={isSubmitting || !amount || !transferReference}
                className="w-full"
              >
                {isSubmitting ? 'Processing...' : 'Submit Payment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Previous payments made for this student</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentInfo.payments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No payments made yet</p>
          ) : (
            <div className="space-y-3">
              {paymentInfo.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{formatCurrency(payment.amount)}</div>
                    <div className="text-sm text-muted-foreground">
                      Ref: {payment.referenceNumber} • {new Date(payment.paymentDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={payment.status === 'confirmed' ? 'default' : 'secondary'}>
                      {payment.status}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadReceipt(payment)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Receipt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}