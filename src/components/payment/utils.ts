import { generatePaymentReceiptPDF } from '../admin/PDFResultGenerator';
import { PaymentInfo, Payment } from './types';

export const generateReceiptNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const timestamp = Date.now().toString().substr(-4);
  
  return `RCT${year}${month}${day}${timestamp}`;
};

export const formatCurrency = (amount: number): string => {
  return `₦${amount.toLocaleString()}`;
};

export const validatePaymentAmount = (amount: number, maxAmount: number): { valid: boolean; message?: string } => {
  if (amount <= 0) {
    return { valid: false, message: 'Payment amount must be greater than zero' };
  }
  
  if (amount > maxAmount) {
    return { valid: false, message: 'Payment amount cannot exceed outstanding balance' };
  }
  
  return { valid: true };
};

export const generatePaymentReference = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  
  return `GRA${year}${month}${day}${random}`;
};

export const calculateOutstandingBalance = (totalFee: number, totalPaid: number): number => {
  return Math.max(0, totalFee - totalPaid);
};

// Alternative name for the same function to match import
export const calculateRemainingBalance = calculateOutstandingBalance;

export const getPaymentStatus = (totalFee: number, totalPaid: number): 'pending' | 'partial' | 'cleared' => {
  if (totalPaid >= totalFee) return 'cleared';
  if (totalPaid > 0) return 'partial';
  return 'pending';
};

export const formatPaymentDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const validateBankReference = (reference: string): boolean => {
  // Basic validation for bank reference format
  return reference.length >= 8 && /^[A-Z0-9]+$/.test(reference);
};

export const getPaymentMethodDisplayName = (method: string): string => {
  switch (method.toLowerCase()) {
    case 'cash': return 'Cash Payment';
    case 'bank_transfer': return 'Bank Transfer';
    case 'pos': return 'POS Payment';
    case 'online': return 'Online Payment';
    default: return method;
  }
};

// Process payment function
export const processPayment = async (
  paymentData: {
    studentId: string;
    amount: number;
    paymentMethod: string;
    referenceNumber: string;
    paymentDate: string;
  }
): Promise<{ success: boolean; payment?: Payment; error?: string }> => {
  try {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validate payment data
    if (!paymentData.studentId) {
      return { success: false, error: 'Student ID is required' };
    }
    
    if (paymentData.amount <= 0) {
      return { success: false, error: 'Payment amount must be greater than zero' };
    }
    
    if (!paymentData.referenceNumber) {
      return { success: false, error: 'Payment reference is required' };
    }
    
    // Create payment record
    const payment: Payment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: paymentData.amount,
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod,
      referenceNumber: paymentData.referenceNumber,
      status: 'confirmed', // In real app, this would depend on payment gateway response
      receiptNumber: generateReceiptNumber()
    };
    
    return { success: true, payment };
  } catch (error) {
    console.error('Payment processing error:', error);
    return { success: false, error: 'Payment processing failed. Please try again.' };
  }
};

// Generate receipt PDF function
export const generateReceiptPDF = async (paymentInfo: PaymentInfo, payment: Payment): Promise<void> => {
  try {
    // Get fee breakdown based on class level
    const isPrimary = paymentInfo.className.toLowerCase().includes('primary');
    
    const feeBreakdown = isPrimary ? {
      'Tuition Fee': 15000,
      'Development Levy': 5000,
      'Sports Fee': 2000,
      'Library Fee': 1000,
      'PTA Dues': 1000
    } : {
      'Tuition Fee': 20000,
      'Development Levy': 7000,
      'Laboratory Fee': 3000,
      'Sports Fee': 2000,
      'Library Fee': 1500,
      'PTA Dues': 1500
    };
    
    const receiptData = {
      receiptNumber: payment.receiptNumber || generateReceiptNumber(),
      studentName: paymentInfo.studentName,
      studentId: paymentInfo.studentId,
      className: paymentInfo.className,
      academicSession: '2024/2025',
      paymentDate: formatPaymentDate(payment.paymentDate),
      totalAmount: payment.amount,
      paymentMethod: getPaymentMethodDisplayName(payment.paymentMethod),
      referenceNumber: payment.referenceNumber,
      breakdown: feeBreakdown
    };
    
    // Use the existing PDF generator
    await generatePaymentReceiptPDF(receiptData);
  } catch (error) {
    console.error('Receipt generation error:', error);
    // Create a simple text receipt as fallback
    const receiptText = createTextReceipt(paymentInfo, payment);
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${paymentInfo.studentName.replace(/\s+/g, '_')}_${payment.receiptNumber}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
};

// Helper function to create text receipt
const createTextReceipt = (paymentInfo: PaymentInfo, payment: Payment): string => {
  return `
GRACELAND ROYAL ACADEMY
Wisdom & Illumination
God's Glorious Tabernacle of witness, Opposite NNPC Depot, After NEWMAP, Tumfure, Gombe

OFFICIAL FEE PAYMENT RECEIPT

Receipt No: ${payment.receiptNumber || generateReceiptNumber()}
Date: ${formatPaymentDate(payment.paymentDate)}

STUDENT INFORMATION:
Name: ${paymentInfo.studentName}
Student ID: ${paymentInfo.studentId}
Class: ${paymentInfo.className}
Academic Session: 2024/2025

PAYMENT DETAILS:
Amount Paid: ${formatCurrency(payment.amount)}
Payment Method: ${getPaymentMethodDisplayName(payment.paymentMethod)}
Reference Number: ${payment.referenceNumber}
Status: ${payment.status.toUpperCase()}

Thank you for your payment.
This is an official computer-generated receipt.

Generated on: ${new Date().toLocaleString()}
  `;
};

// Utility to validate payment form data
export const validatePaymentFormData = (data: {
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  paymentDate: string;
}): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  if (!data.amount || data.amount <= 0) {
    errors.amount = 'Payment amount is required and must be greater than zero';
  }
  
  if (!data.paymentMethod) {
    errors.paymentMethod = 'Payment method is required';
  }
  
  if (!data.referenceNumber?.trim()) {
    errors.referenceNumber = 'Payment reference is required';
  } else if (data.paymentMethod === 'bank_transfer' && !validateBankReference(data.referenceNumber)) {
    errors.referenceNumber = 'Invalid bank reference format';
  }
  
  if (!data.paymentDate) {
    errors.paymentDate = 'Payment date is required';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Helper to calculate payment summary
export const calculatePaymentSummary = (paymentInfo: PaymentInfo) => {
  const totalPaid = paymentInfo.totalPaid;
  const totalFee = paymentInfo.totalFee;
  const outstanding = calculateOutstandingBalance(totalFee, totalPaid);
  const paymentPercentage = totalFee > 0 ? (totalPaid / totalFee) * 100 : 0;
  
  return {
    totalFee,
    totalPaid,
    outstanding,
    paymentPercentage: Math.round(paymentPercentage),
    isFullyPaid: outstanding === 0,
    hasPartialPayment: totalPaid > 0 && outstanding > 0
  };
};