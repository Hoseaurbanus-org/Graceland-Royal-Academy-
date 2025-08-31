import { STUDENT_ID_CONFIG, CLASS_LEVELS } from './constants';
import { Staff } from './types';

export const generateUniqueId = (prefix: string): string => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateStudentId = (className: string, existingStudents: any[]): string => {
  // Determine if class is primary or secondary
  const isPrimary = Object.keys(CLASS_LEVELS.primary).some(level => 
    className.toLowerCase().includes(level.toLowerCase().split(' ')[0])
  );
  
  const prefix = isPrimary ? STUDENT_ID_CONFIG.primaryPrefix : STUDENT_ID_CONFIG.secondaryPrefix;
  
  // Find existing students with the same prefix
  const existingIds = existingStudents
    .filter(student => student.id.startsWith(prefix))
    .map(student => {
      const idParts = student.id.split('/');
      return parseInt(idParts[2]) || 0;
    });
  
  // Get the next available number
  const nextNumber = Math.max(0, ...existingIds) + 1;
  const paddedNumber = nextNumber.toString().padStart(STUDENT_ID_CONFIG.counterDigits, '0');
  
  return `${prefix}/${paddedNumber}`;
};

export const generateEmployeeId = (existingStaff: any[]): string => {
  const existingIds = existingStaff
    .filter(staff => staff.employeeId && staff.employeeId.startsWith('GRA/STF/'))
    .map(staff => {
      const idParts = staff.employeeId.split('/');
      return parseInt(idParts[2]) || 0;
    });
  
  const nextNumber = Math.max(0, ...existingIds) + 1;
  const paddedNumber = nextNumber.toString().padStart(3, '0');
  
  return `GRA/STF/${paddedNumber}`;
};

export const generateReceiptNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const timestamp = Date.now().toString().substr(-4);
  
  return `GRA${year}${month}${day}${timestamp}`;
};

export const validateStudentId = (studentId: string): boolean => {
  const primaryPattern = new RegExp(`^${STUDENT_ID_CONFIG.primaryPrefix}/\\d{${STUDENT_ID_CONFIG.counterDigits}}$`);
  const secondaryPattern = new RegExp(`^${STUDENT_ID_CONFIG.secondaryPrefix}/\\d{${STUDENT_ID_CONFIG.counterDigits}}$`);
  
  return primaryPattern.test(studentId) || secondaryPattern.test(studentId);
};

export const getClassLevel = (className: string): 'primary' | 'secondary' => {
  const isPrimary = Object.keys(CLASS_LEVELS.primary).some(level => 
    className.toLowerCase().includes(level.toLowerCase().split(' ')[0])
  );
  
  return isPrimary ? 'primary' : 'secondary';
};

export const calculateFeeStructure = (className: string): any => {
  const level = getClassLevel(className);
  return level === 'primary' ? 
    { ...CLASS_LEVELS.primary, fee: 24000 } : 
    { ...CLASS_LEVELS.secondary, fee: 35000 };
};

export const formatCurrency = (amount: number): string => {
  return `₦${amount.toLocaleString()}`;
};

export const calculateGrade = (average: number): string => {
  if (average >= 90) return 'A+';
  if (average >= 80) return 'A';
  if (average >= 70) return 'B';
  if (average >= 60) return 'C';
  if (average >= 50) return 'D';
  return 'F';
};

export const calculateStudentRanking = (students: any[], subjectScores: any): number => {
  // Calculate total scores for all students
  const studentsWithTotals = students
    .map(student => {
      const totalScore = Object.values(student.scores || {})
        .reduce((sum: number, subject: any) => {
          return sum + (subject.total || 0);
        }, 0);
      return { id: student.id, total: totalScore };
    })
    .sort((a, b) => b.total - a.total);
  
  // Find the rank of current student
  const currentTotal = Object.values(subjectScores)
    .reduce((sum: number, subject: any) => sum + (subject.total || 0), 0);
  
  return studentsWithTotals.findIndex(s => s.total <= currentTotal) + 1;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+234|0)[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // If starts with 234, add +
  if (digits.startsWith('234')) {
    return `+${digits}`;
  }
  
  // If starts with 0, replace with +234
  if (digits.startsWith('0')) {
    return `+234${digits.substr(1)}`;
  }
  
  // If 10 digits, assume it's missing country code
  if (digits.length === 10) {
    return `+234${digits}`;
  }
  
  return phone;
};

export const getAcademicSession = (): string => {
  const currentYear = new Date().getFullYear();
  return `${currentYear}/${currentYear + 1}`;
};

export const getCurrentTerm = (): string => {
  const month = new Date().getMonth() + 1; // 1-12
  
  if (month >= 9 || month <= 1) return '1st Term';
  if (month >= 2 && month <= 5) return '2nd Term';
  return '3rd Term';
};

export const isValidPassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password should contain at least one number' };
  }
  
  return { valid: true };
};

// Staff validation function
export const validateStaffData = (staffData: Partial<Staff>): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Required fields validation
  if (!staffData.name?.trim()) {
    errors.name = 'Staff name is required';
  }

  if (!staffData.email?.trim()) {
    errors.email = 'Email address is required';
  } else if (!validateEmail(staffData.email)) {
    errors.email = 'Invalid email format';
  }

  if (!staffData.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!validatePhone(staffData.phone)) {
    errors.phone = 'Invalid phone number format';
  }

  if (!staffData.role) {
    errors.role = 'Staff role is required';
  }

  if (!staffData.employeeId?.trim()) {
    errors.employeeId = 'Employee ID is required';
  }

  if (!staffData.qualification?.trim()) {
    errors.qualification = 'Qualification is required';
  }

  if (!staffData.dateJoined) {
    errors.dateJoined = 'Date joined is required';
  }

  // Password validation for new staff
  if (staffData.password && !isValidPassword(staffData.password).valid) {
    errors.password = isValidPassword(staffData.password).message || 'Invalid password';
  }

  // Subject assignment validation for teachers
  if (staffData.role === 'teacher' && (!staffData.subjects || staffData.subjects.length === 0)) {
    errors.subjects = 'Teachers must be assigned at least one subject';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

export const exportToCSV = (data: any[], filename: string): void => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(',')
  );
  
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  
  window.URL.revokeObjectURL(url);
};

export const importFromCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.trim().split('\n');
        
        if (lines.length < 2) {
          reject(new Error('CSV file must have at least a header and one data row'));
          return;
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });
        
        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse CSV file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};