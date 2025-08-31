export const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash Payment' },
  { value: 'pos', label: 'POS Payment' },
  { value: 'online', label: 'Online Payment' }
];

export const BANK_DETAILS = {
  bankName: 'First Bank Nigeria',
  accountName: 'Graceland Royal Academy',
  accountNumber: '2015678901',
  sortCode: '011',
  swiftCode: 'FBNBNGLA'
};

export const PAYMENT_POLICIES = {
  minimumAmount: 1000,
  maximumCashPayment: 50000,
  paymentDeadline: {
    firstTerm: '2024-11-30',
    secondTerm: '2025-03-31',
    thirdTerm: '2025-06-30'
  },
  latePaymentPenalty: 5000 // Flat penalty for late payments
};

export const FEE_COMPONENTS = {
  primary: {
    tuition: { amount: 15000, description: 'Tuition fees for academic instruction' },
    development: { amount: 5000, description: 'School infrastructure development' },
    sports: { amount: 2000, description: 'Sports and recreational activities' },
    library: { amount: 1000, description: 'Library services and books' },
    pta: { amount: 1000, description: 'Parent-Teacher Association dues' }
  },
  secondary: {
    tuition: { amount: 20000, description: 'Tuition fees for academic instruction' },
    development: { amount: 7000, description: 'School infrastructure development' },
    laboratory: { amount: 3000, description: 'Laboratory equipment and materials' },
    sports: { amount: 2000, description: 'Sports and recreational activities' },
    library: { amount: 1500, description: 'Library services and books' },
    pta: { amount: 1500, description: 'Parent-Teacher Association dues' }
  }
};

export const RECEIPT_TEMPLATE = {
  header: 'OFFICIAL FEE PAYMENT RECEIPT',
  footer: 'This is a computer-generated receipt. Please keep for your records.',
  terms: [
    'Payment is non-refundable once confirmed',
    'Receipt must be presented for any payment-related queries',
    'Full payment grants access to academic results',
    'Contact school office for payment assistance'
  ]
};

export const PAYMENT_STATUS_COLORS = {
  pending: 'bg-red-100 text-red-800 border-red-200',
  partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cleared: 'bg-green-100 text-green-800 border-green-200'
};

export const PAYMENT_STATUS_LABELS = {
  pending: 'Payment Pending',
  partial: 'Partial Payment',
  cleared: 'Payment Cleared'
};