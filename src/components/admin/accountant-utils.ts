import { RESULT_VIEW_TYPES, RESULT_VIEW_TYPE_COLORS } from './accountant-constants';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(amount);
};

export const getResultViewTypeLabel = (type: string): string => {
  return RESULT_VIEW_TYPES[type as keyof typeof RESULT_VIEW_TYPES] || RESULT_VIEW_TYPES.individual;
};

export const getResultViewTypeBadge = (type: string): string => {
  return RESULT_VIEW_TYPE_COLORS[type as keyof typeof RESULT_VIEW_TYPE_COLORS] || RESULT_VIEW_TYPE_COLORS.individual;
};

export const filterStudents = (
  students: any[],
  selectedClass: string,
  searchTerm: string
) => {
  let filteredStudents = students.filter(s => s.isActive);
  
  if (selectedClass && selectedClass !== 'all') {
    filteredStudents = filteredStudents.filter(s => s.class === selectedClass);
  }
  
  if (searchTerm) {
    filteredStudents = filteredStudents.filter(s => 
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  return filteredStudents;
};

export const getClassStudents = (students: any[], className: string) => {
  return students.filter(s => s.class === className && s.isActive);
};

export const getParentsByClass = (students: any[], parents: any[], className: string) => {
  const classStudents = getClassStudents(students, className);
  const parentEmails = [...new Set(classStudents.map(s => s.parentEmail))];
  return parents.filter(p => parentEmails.includes(p.email));
};