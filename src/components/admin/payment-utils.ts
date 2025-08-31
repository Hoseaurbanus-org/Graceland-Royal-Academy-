import { CheckCircle, XCircle, Clock } from 'lucide-react';

export interface PaymentRecord {
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
  rejectedBy?: string;
  rejectedAt?: string;
  notes?: string;
  adminNotes?: string;
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'confirmed': return CheckCircle;
    case 'pending': return Clock;
    case 'rejected': return XCircle;
    default: return Clock;
  }
};

export const getPaymentMethodColor = (method: string) => {
  switch (method) {
    case 'transfer': return 'bg-blue-100 text-blue-800';
    case 'cash': return 'bg-green-100 text-green-800';
    case 'pos': return 'bg-purple-100 text-purple-800';
    case 'cheque': return 'bg-orange-100 text-orange-800';
    case 'online': return 'bg-cyan-100 text-cyan-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const generateReceiptNumber = (): string => {
  return `GRA/RCT/${String(Date.now()).slice(-3)}/${new Date().getFullYear()}`;
};

export const calculatePaymentStatistics = (payments: PaymentRecord[]) => {
  const pending = payments.filter(p => p.status === 'pending');
  const confirmed = payments.filter(p => p.status === 'confirmed');
  const rejected = payments.filter(p => p.status === 'rejected');
  
  const totalPendingAmount = pending.reduce((sum, p) => sum + p.amount, 0);
  const totalConfirmedAmount = confirmed.reduce((sum, p) => sum + p.amount, 0);
  
  return {
    pending: pending.length,
    confirmed: confirmed.length,
    rejected: rejected.length,
    totalPendingAmount,
    totalConfirmedAmount,
    total: payments.length
  };
};

export const formatCurrency = (amount: number): string => {
  return `₦${amount.toLocaleString()}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};