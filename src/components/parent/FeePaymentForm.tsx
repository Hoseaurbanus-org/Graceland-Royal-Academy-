import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  CreditCard, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2,
  User,
  School,
  Calendar,
  Receipt
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useCalendar } from '../CalendarContext';
import { usePayment } from '../payment/PaymentContext';

interface FeePaymentFormProps {
  onPaymentComplete?: (paymentData: any) => void;
  onClose?: () => void;
}

export function FeePaymentForm({ onPaymentComplete, onClose }: FeePaymentFormProps) {
  const { 
    user, 
    students, 
    feeStructures, 
    schoolAccounts,
    getPrimarySchoolAccount,
    getFeeStructure,
    getParentChildren,
    addNotification
  } = useAuth();
  
  const { currentSession, currentTerm } = useCalendar();
  const { processPayment, isProcessing } = usePayment();

  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState(currentTerm?.name || 'First Term');
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [formData, setFormData] = useState({
    payerName: user?.name || '',
    payerEmail: user?.email || '',
    payerPhone: '',
    amount: 0,
    reference: '',
    notes: ''
  });

  // Get parent's children with proper data
  const parentChildren = user ? getParentChildren(user.email) : [];
  
  // Debug log to check student data
  useEffect(() => {
    console.log('Parent children:', parentChildren);
    console.log('All students:', students.filter(s => s.isActive));
  }, [parentChildren, students]);

  // Get selected student data
  const selectedStudentData = parentChildren.find(s => s.studentId === selectedStudent);

  // Get fee structure for selected student
  const feeStructure = selectedStudentData && currentSession ? 
    getFeeStructure(currentSession.name, selectedTerm, selectedStudentData.class) : null;

  // Get school account
  const schoolAccount = getPrimarySchoolAccount();

  // Auto-select student if only one child
  useEffect(() => {
    if (parentChildren.length === 1 && !selectedStudent) {
      setSelectedStudent(parentChildren[0].studentId);
    }
  }, [parentChildren, selectedStudent]);

  // Update amount when fee structure changes
  useEffect(() => {
    if (feeStructure) {
      setFormData(prev => ({ ...prev, amount: feeStructure.total }));
    }
  }, [feeStructure]);

  // Generate payment reference
  const generateReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    const studentId = selectedStudent.slice(-3);
    return `GRA${studentId}${timestamp}`;
  };

  useEffect(() => {
    if (selectedStudent) {
      setFormData(prev => ({ 
        ...prev, 
        reference: generateReference()
      }));
    }
  }, [selectedStudent]);

  const handlePayment = async () => {
    if (!selectedStudent || !selectedStudentData || !feeStructure || !schoolAccount) {
      addNotification({
        type: 'error',
        title: 'Missing Information',
        message: 'Please select a student and ensure fee structure is available.'
      });
      return;
    }

    if (!formData.payerName || !formData.payerEmail || !formData.amount) {
      addNotification({
        type: 'error',
        title: 'Required Fields',
        message: 'Please fill in all required fields.'
      });
      return;
    }

    try {
      const paymentData = {
        studentId: selectedStudent,
        studentName: selectedStudentData.fullName,
        className: selectedStudentData.class,
        session: currentSession?.name || '',
        term: selectedTerm,
        amount: formData.amount,
        feeStructure,
        payerName: formData.payerName,
        payerEmail: formData.payerEmail,
        payerPhone: formData.payerPhone,
        paymentMethod,
        reference: formData.reference,
        notes: formData.notes,
        schoolAccount: {
          bankName: schoolAccount.bankName,
          accountName: schoolAccount.accountName,
          accountNumber: schoolAccount.accountNumber,
          sortCode: schoolAccount.sortCode
        }
      };

      const result = await processPayment(paymentData);
      
      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Payment Initiated',
          message: `Payment reference: ${formData.reference}. Please complete the bank transfer.`
        });

        onPaymentComplete?.(result.data);
        onClose?.();
      } else {
        throw new Error(result.error || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      addNotification({
        type: 'error',
        title: 'Payment Failed',
        message: error instanceof Error ? error.message : 'Payment processing failed'
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Student Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Student Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="student">Select Student *</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose your child" />
              </SelectTrigger>
              <SelectContent>
                {parentChildren.length === 0 ? (
                  <SelectItem value="" disabled>
                    No children found
                  </SelectItem>
                ) : (
                  parentChildren.map((student) => (
                    <SelectItem key={student.studentId} value={student.studentId}>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium">{student.fullName}</div>
                          <div className="text-xs text-muted-foreground">
                            {student.class} • ID: {student.studentId}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {parentChildren.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                No children found. Please contact the school if this is an error.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="term">Academic Term *</Label>
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="First Term">First Term</SelectItem>
                <SelectItem value="Second Term">Second Term</SelectItem>
                <SelectItem value="Third Term">Third Term</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedStudentData && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <School className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Student Information</span>
              </div>
              <div className="space-y-1 text-sm">
                <div><strong>Name:</strong> {selectedStudentData.fullName}</div>
                <div><strong>Class:</strong> {selectedStudentData.class}</div>
                <div><strong>Session:</strong> {currentSession?.name}</div>
                <div><strong>Term:</strong> {selectedTerm}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fee Structure */}
      {feeStructure && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Fee Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(feeStructure.fees).map(([key, amount]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="capitalize text-sm">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center font-semibold">
                <span>Total Amount</span>
                <span className="text-lg">{formatCurrency(feeStructure.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payerName">Payer Name *</Label>
              <Input
                id="payerName"
                value={formData.payerName}
                onChange={(e) => setFormData(prev => ({ ...prev, payerName: e.target.value }))}
                placeholder="Full name of person making payment"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="payerEmail">Email Address *</Label>
              <Input
                id="payerEmail"
                type="email"
                value={formData.payerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, payerEmail: e.target.value }))}
                placeholder="Email for payment confirmation"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="payerPhone">Phone Number</Label>
            <Input
              id="payerPhone"
              value={formData.payerPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, payerPhone: e.target.value }))}
              placeholder="Contact phone number"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="amount">Payment Amount *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              placeholder="Amount to pay"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="reference">Payment Reference</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              placeholder="Unique payment reference"
              className="mt-1"
              readOnly
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use this reference for your bank transfer
            </p>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional information"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* School Account Information */}
      {schoolAccount && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              School Account Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
              <div><strong>Bank:</strong> {schoolAccount.bankName}</div>
              <div><strong>Account Name:</strong> {schoolAccount.accountName}</div>
              <div><strong>Account Number:</strong> {schoolAccount.accountNumber}</div>
              {schoolAccount.sortCode && (
                <div><strong>Sort Code:</strong> {schoolAccount.sortCode}</div>
              )}
              <div className="text-xs text-muted-foreground mt-2">
                Please use the payment reference above when making your transfer
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Alerts */}
      {!feeStructure && selectedStudent && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Fee structure not found for {selectedStudentData?.class} - {selectedTerm}. 
            Please contact the school administration.
          </AlertDescription>
        </Alert>
      )}

      {!schoolAccount && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            School account information not available. Please contact the school administration.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
        {onClose && (
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
        )}
        <Button 
          onClick={handlePayment} 
          disabled={!selectedStudent || !feeStructure || !schoolAccount || isProcessing}
          className="w-full sm:w-auto"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Proceed to Payment
            </>
          )}
        </Button>
      </div>
    </div>
  );
}