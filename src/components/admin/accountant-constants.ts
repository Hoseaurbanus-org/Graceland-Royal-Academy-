export const TERMS = ['First Term', 'Second Term', 'Third Term'];

export const RESULT_VIEW_TYPES = {
  individual: 'Individual Results Only',
  class: 'Class & Individual Results',
  none: 'No Result Access'
} as const;

export const RESULT_VIEW_TYPE_COLORS = {
  individual: 'bg-blue-100 text-blue-800',
  class: 'bg-green-100 text-green-800',
  none: 'bg-red-100 text-red-800'
} as const;

export const DEFAULT_FEE_STRUCTURE = {
  primary: {
    tuition: 400000,
    development: 50000,
    sports: 25000,
    library: 15000,
    examination: 20000,
    transport: 75000,
    feeding: 100000,
    uniform: 0,
    books: 0
  },
  secondary: {
    tuition: 600000,
    development: 50000,
    sports: 25000,
    library: 15000,
    examination: 20000,
    transport: 75000,
    feeding: 100000,
    uniform: 0,
    books: 0
  }
} as const;

export const FEE_FORM_FIELDS = [
  { key: 'tuition', label: 'Tuition Fee' },
  { key: 'development', label: 'Development Fee' },
  { key: 'sports', label: 'Sports Fee' },
  { key: 'library', label: 'Library Fee' },
  { key: 'examination', label: 'Examination Fee' },
  { key: 'transport', label: 'Transport Fee (Optional)' },
  { key: 'feeding', label: 'Feeding Fee (Optional)' },
  { key: 'uniform', label: 'Uniform Fee (Optional)' },
  { key: 'books', label: 'Books Fee (Optional)' }
] as const;