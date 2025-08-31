import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Eye } from 'lucide-react';
import { PaymentRecord, getPaymentMethodColor, formatCurrency } from './payment-utils';

interface PaymentDetailsDialogProps {
  payment: PaymentRecord;
  onConfirm: (payment: PaymentRecord) => void;
  onReject: (payment: PaymentRecord) => void;
  children?: React.ReactNode;
}

export function PaymentDetailsDialog({ payment, onConfirm, onReject, children }: PaymentDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Student Information</Label>
              <div className="p-3 bg-gray-50 rounded">
                <div className="font-medium">{payment.studentName}</div>
                <div className="text-sm">{payment.class}</div>
                <div className="text-sm">{payment.studentId}</div>
              </div>
            </div>
            <div>
              <Label>Parent Information</Label>
              <div className="p-3 bg-gray-50 rounded">
                <div className="font-medium">{payment.parentName}</div>
                <div className="text-sm">{payment.parentPhone}</div>
                {payment.parentEmail && (
                  <div className="text-sm">{payment.parentEmail}</div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Amount</Label>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(payment.amount)}
              </div>
            </div>
            <div>
              <Label>Payment Type</Label>
              <div className="font-medium">{payment.paymentType}</div>
            </div>
            <div>
              <Label>Payment Method</Label>
              <Badge className={getPaymentMethodColor(payment.paymentMethod)}>
                {payment.paymentMethod.toUpperCase()}
              </Badge>
            </div>
          </div>

          {payment.bankDetails && (
            <div>
              <Label>Bank Transfer Details</Label>
              <div className="p-3 bg-blue-50 rounded space-y-2">
                <div className="flex justify-between">
                  <span>Account Name:</span>
                  <span className="font-medium">{payment.bankDetails.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Account Number:</span>
                  <span className="font-medium">{payment.bankDetails.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bank:</span>
                  <span className="font-medium">{payment.bankDetails.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction Ref:</span>
                  <span className="font-medium">{payment.bankDetails.transactionRef}</span>
                </div>
              </div>
            </div>
          )}

          {payment.notes && (
            <div>
              <Label>Parent Notes</Label>
              <div className="p-3 bg-gray-50 rounded">
                {payment.notes}
              </div>
            </div>
          )}

          {payment.status === 'pending' && (
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => onConfirm(payment)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Payment
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => onReject(payment)}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Payment
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}