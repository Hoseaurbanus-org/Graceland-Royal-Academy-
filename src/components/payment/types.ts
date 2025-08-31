export interface PaymentInfo {
  studentId: string;
  studentName: string;
  className: string;
  totalFee: number;
  totalPaid: number;
  status: 'pending' | 'partial' | 'cleared';
  payments: Payment[];
  lastPaymentDate?: string;
}

export interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
  status: 'pending' | 'confirmed' | 'failed';
  receiptNumber?: string;
}

export interface PaymentFormData {
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  paymentDate: string;
}

export interface FeeBreakdown {
  tuition: number;
  development: number;
  sports: number;
  library: number;
  pta: number;
  laboratory?: number;
  total: number;
}

export type PaymentStatus = 'pending' | 'partial' | 'cleared';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'pos' | 'online';