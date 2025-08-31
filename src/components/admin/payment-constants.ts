export const PAYMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected'
} as const;

export const PAYMENT_METHODS = {
  CASH: 'cash',
  TRANSFER: 'transfer',
  POS: 'pos',
  CHEQUE: 'cheque',
  ONLINE: 'online'
} as const;

export const PROCESSING_STATUS = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  SUCCESS: 'success'
} as const;

export const MOCK_PAYMENT_RECORDS = [
  {
    id: 'pay-001',
    studentId: 'gra25/pry/001',
    studentName: 'John Doe Jr.',
    class: 'Primary 1',
    amount: 150000,
    paymentType: 'Part Payment - Tuition',
    paymentMethod: 'transfer' as const,
    parentName: 'Mr. John Smith',
    parentPhone: '+234-XXX-XXX-XXXX',
    parentEmail: 'john.smith@gmail.com',
    term: 'First Term',
    session: '2024/2025',
    date: '2024-12-20T10:00:00Z',
    status: 'pending' as const,
    bankDetails: {
      accountName: 'John Smith',
      accountNumber: '1234567890',
      bankName: 'First Bank',
      transactionRef: 'FBN123456789'
    },
    notes: 'Transfer made via mobile banking'
  },
  {
    id: 'pay-002',
    studentId: 'gra25/pry/025',
    studentName: 'Jane Doe',
    class: 'Primary 3',
    amount: 25000,
    paymentType: 'Sports Fee',
    paymentMethod: 'cash' as const,
    parentName: 'Mr. John Smith',
    parentPhone: '+234-XXX-XXX-XXXX',
    term: 'First Term',
    session: '2024/2025',
    date: '2024-12-19T14:30:00Z',
    status: 'pending' as const,
    notes: 'Paid at school office'
  },
  {
    id: 'pay-003',
    studentId: 'gra25/sec/015',
    studentName: 'Michael Johnson',
    class: 'JSS 1',
    amount: 100000,
    paymentType: 'Development Fee',
    paymentMethod: 'pos' as const,
    parentName: 'Mrs. Mary Johnson',
    parentPhone: '+234-YYY-YYY-YYYY',
    parentEmail: 'mary.johnson@yahoo.com',
    term: 'First Term',
    session: '2024/2025',
    date: '2024-12-18T16:00:00Z',
    status: 'confirmed' as const,
    receiptNumber: 'GRA/RCT/003/2024',
    confirmedBy: 'Mrs. Comfort Nwankwo',
    confirmedAt: '2024-12-18T17:00:00Z'
  },
  {
    id: 'pay-004',
    studentId: 'gra25/pry/012',
    studentName: 'Fatima Ibrahim',
    class: 'Primary 2',
    amount: 75000,
    paymentType: 'Library Fee',
    paymentMethod: 'cheque' as const,
    parentName: 'Dr. Ahmed Ibrahim',
    parentPhone: '+234-ZZZ-ZZZ-ZZZZ',
    term: 'First Term',
    session: '2024/2025',
    date: '2024-12-17T11:00:00Z',
    status: 'rejected' as const,
    rejectedBy: 'Mrs. Comfort Nwankwo',
    rejectedAt: '2024-12-17T15:00:00Z',
    adminNotes: 'Cheque bounced - insufficient funds'
  }
];