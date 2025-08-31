import React, { createContext, useContext, useState, ReactNode } from 'react';

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

export interface FeeStructure {
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

interface PaymentContextType {
  // Payment records
  paymentRecords: PaymentRecord[];
  feeStructures: FeeStructure[];
  
  // Payment management
  createPayment: (payment: Omit<PaymentRecord, 'id' | 'date' | 'status'>) => void;
  updatePayment: (paymentId: string, updates: Partial<PaymentRecord>) => void;
  confirmPayment: (paymentId: string, receiptNumber: string, confirmedBy: string) => void;
  rejectPayment: (paymentId: string, reason: string, rejectedBy: string) => void;
  
  // Fee structure management
  updateFeeStructure: (classId: string, structure: Partial<FeeStructure>) => void;
  
  // Utility functions
  getPaymentsByStudent: (studentId: string) => PaymentRecord[];
  getPaymentsByStatus: (status: PaymentRecord['status']) => PaymentRecord[];
  getTotalPaidByStudent: (studentId: string) => number;
  getFeeStructureByClass: (className: string) => FeeStructure | null;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function usePayment() {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}

interface PaymentProviderProps {
  children: ReactNode;
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([
    // Mock initial data
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
    }
  ]);

  const [feeStructures] = useState<FeeStructure[]>([
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
  ]);

  const createPayment = (paymentData: Omit<PaymentRecord, 'id' | 'date' | 'status'>) => {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'pending'
    };
    setPaymentRecords(prev => [newPayment, ...prev]);
  };

  const updatePayment = (paymentId: string, updates: Partial<PaymentRecord>) => {
    setPaymentRecords(prev => prev.map(payment => 
      payment.id === paymentId ? { ...payment, ...updates } : payment
    ));
  };

  const confirmPayment = (paymentId: string, receiptNumber: string, confirmedBy: string) => {
    setPaymentRecords(prev => prev.map(payment => 
      payment.id === paymentId ? {
        ...payment,
        status: 'confirmed' as const,
        receiptNumber,
        confirmedBy,
        confirmedAt: new Date().toISOString()
      } : payment
    ));
  };

  const rejectPayment = (paymentId: string, reason: string, rejectedBy: string) => {
    setPaymentRecords(prev => prev.map(payment => 
      payment.id === paymentId ? {
        ...payment,
        status: 'rejected' as const,
        adminNotes: reason,
        rejectedBy,
        rejectedAt: new Date().toISOString()
      } : payment
    ));
  };

  const updateFeeStructure = (classId: string, structure: Partial<FeeStructure>) => {
    // Implementation for updating fee structures
    console.log('Update fee structure:', classId, structure);
  };

  const getPaymentsByStudent = (studentId: string): PaymentRecord[] => {
    return paymentRecords.filter(payment => payment.studentId === studentId);
  };

  const getPaymentsByStatus = (status: PaymentRecord['status']): PaymentRecord[] => {
    return paymentRecords.filter(payment => payment.status === status);
  };

  const getTotalPaidByStudent = (studentId: string): number => {
    return getPaymentsByStudent(studentId)
      .filter(payment => payment.status === 'confirmed')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const getFeeStructureByClass = (className: string): FeeStructure | null => {
    if (className.toLowerCase().includes('primary')) {
      return feeStructures.find(f => f.class === 'Primary') || null;
    }
    if (className.toLowerCase().includes('jss') || className.toLowerCase().includes('sss')) {
      return feeStructures.find(f => f.class === 'Secondary') || null;
    }
    return null;
  };

  const value: PaymentContextType = {
    paymentRecords,
    feeStructures,
    createPayment,
    updatePayment,
    confirmPayment,
    rejectPayment,
    updateFeeStructure,
    getPaymentsByStudent,
    getPaymentsByStatus,
    getTotalPaidByStudent,
    getFeeStructureByClass,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
}