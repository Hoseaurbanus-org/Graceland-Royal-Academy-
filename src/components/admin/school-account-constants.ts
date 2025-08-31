export const BANK_NAMES = [
  'Access Bank',
  'Fidelity Bank',
  'First Bank Nigeria',
  'Guarantee Trust Bank (GTBank)',
  'Union Bank',
  'United Bank for Africa (UBA)',
  'Zenith Bank',
  'Stanbic IBTC Bank',
  'Sterling Bank',
  'Wema Bank',
  'Keystone Bank',
  'Heritage Bank',
  'Polaris Bank',
  'Ecobank Nigeria',
  'FCMB (First City Monument Bank)',
  'Other'
] as const;

export const ACCOUNT_TYPES = [
  { value: 'savings', label: 'Savings Account' },
  { value: 'current', label: 'Current Account' },
  { value: 'domiciliary', label: 'Domiciliary Account' }
] as const;

export const ACCOUNT_STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800'
} as const;

export const DEFAULT_SCHOOL_ACCOUNT = {
  bankName: 'First Bank Nigeria',
  accountName: 'Graceland Royal Academy',
  accountNumber: '',
  sortCode: '',
  routingNumber: '',
  swiftCode: '',
  isActive: true,
  isPrimary: false,
  description: ''
} as const;

export const FORM_VALIDATION_RULES = {
  bankName: { required: true, message: 'Bank name is required' },
  accountName: { required: true, message: 'Account name is required' },
  accountNumber: { 
    required: true, 
    message: 'Account number is required',
    pattern: /^\d{10}$/,
    patternMessage: 'Account number must be 10 digits'
  },
  sortCode: {
    pattern: /^\d{3}-\d{3}-\d{3}$/,
    patternMessage: 'Sort code format: XXX-XXX-XXX'
  }
} as const;