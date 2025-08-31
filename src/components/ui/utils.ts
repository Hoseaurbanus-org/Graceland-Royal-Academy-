import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Additional utility functions for the educational platform
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A':
      return 'text-green-600 bg-green-50';
    case 'B':
      return 'text-blue-600 bg-blue-50';
    case 'C':
      return 'text-yellow-600 bg-yellow-50';
    case 'D':
      return 'text-orange-600 bg-orange-50';
    case 'E':
      return 'text-red-600 bg-red-50';
    case 'F':
      return 'text-red-800 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function generateReceiptNumber(): string {
  const prefix = 'GRA';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

export function getTermDates(term: string, session: string) {
  const year = parseInt(session.split('/')[0]);
  
  switch (term) {
    case 'First Term':
      return {
        start: new Date(year, 8, 15), // September 15
        end: new Date(year, 11, 15),  // December 15
      };
    case 'Second Term':
      return {
        start: new Date(year + 1, 0, 15), // January 15
        end: new Date(year + 1, 3, 15),   // April 15
      };
    case 'Third Term':
      return {
        start: new Date(year + 1, 4, 1),  // May 1
        end: new Date(year + 1, 6, 31),   // July 31
      };
    default:
      return {
        start: new Date(),
        end: new Date(),
      };
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}