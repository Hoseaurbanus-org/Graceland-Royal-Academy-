import { FORM_VALIDATION_RULES } from './school-account-constants';

export const validateAccountForm = (formData: any): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Bank name validation
  if (!formData.bankName?.trim()) {
    errors.bankName = FORM_VALIDATION_RULES.bankName.message;
  }

  // Account name validation
  if (!formData.accountName?.trim()) {
    errors.accountName = FORM_VALIDATION_RULES.accountName.message;
  }

  // Account number validation
  if (!formData.accountNumber?.trim()) {
    errors.accountNumber = FORM_VALIDATION_RULES.accountNumber.message;
  } else if (!FORM_VALIDATION_RULES.accountNumber.pattern.test(formData.accountNumber)) {
    errors.accountNumber = FORM_VALIDATION_RULES.accountNumber.patternMessage;
  }

  // Sort code validation (optional but format check if provided)
  if (formData.sortCode && !FORM_VALIDATION_RULES.sortCode.pattern.test(formData.sortCode)) {
    errors.sortCode = FORM_VALIDATION_RULES.sortCode.patternMessage;
  }

  return errors;
};

export const formatAccountNumber = (accountNumber: string): string => {
  // Remove any non-digits and limit to 10 digits
  const digits = accountNumber.replace(/\D/g, '').slice(0, 10);
  
  // Format as XXXX-XXXX-XX for display
  if (digits.length <= 4) return digits;
  if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
};

export const formatSortCode = (sortCode: string): string => {
  // Remove any non-digits and limit to 9 digits
  const digits = sortCode.replace(/\D/g, '').slice(0, 9);
  
  // Format as XXX-XXX-XXX
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export const generateAccountId = (): string => {
  return `account_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
};

export const maskAccountNumber = (accountNumber: string): string => {
  if (accountNumber.length <= 6) return accountNumber;
  const start = accountNumber.slice(0, 3);
  const end = accountNumber.slice(-3);
  const middle = '*'.repeat(accountNumber.length - 6);
  return `${start}${middle}${end}`;
};

export const getAccountStatusLabel = (isActive: boolean, isPrimary: boolean): string => {
  if (isPrimary && isActive) return 'Primary Account';
  if (isActive) return 'Active';
  return 'Inactive';
};

export const getAccountStatusColor = (isActive: boolean, isPrimary: boolean): string => {
  if (isPrimary && isActive) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (isActive) return 'bg-green-100 text-green-800 border-green-200';
  return 'bg-red-100 text-red-800 border-red-200';
};

export const sortAccountsByPriority = (accounts: any[]): any[] => {
  return [...accounts].sort((a, b) => {
    // Primary accounts first
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    
    // Then by active status
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    
    // Finally by creation date (newest first)
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  });
};

export const validateBankingDetails = (accountData: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!accountData.bankName) errors.push('Bank name is required');
  if (!accountData.accountName) errors.push('Account name is required');
  if (!accountData.accountNumber) errors.push('Account number is required');
  
  if (accountData.accountNumber && !/^\d{10}$/.test(accountData.accountNumber)) {
    errors.push('Account number must be exactly 10 digits');
  }

  if (accountData.sortCode && !/^\d{3}-\d{3}-\d{3}$/.test(accountData.sortCode)) {
    errors.push('Sort code must follow format: XXX-XXX-XXX');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};