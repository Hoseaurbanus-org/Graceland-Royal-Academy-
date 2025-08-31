import { GRADE_COLORS, RESULT_STATUS_COLORS } from './class-supervisor-constants';

export const calculateGrade = (total: number, maxTotal: number = 100): string => {
  const percentage = (total / maxTotal) * 100;
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'B'; 
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

export const getGradeColor = (grade: string): string => {
  return GRADE_COLORS[grade as keyof typeof GRADE_COLORS] || GRADE_COLORS.F;
};

export const getResultStatusColor = (isApproved: boolean): string => {
  return isApproved ? RESULT_STATUS_COLORS.approved : RESULT_STATUS_COLORS.pending;
};

export const calculateCompletionRate = (studentsWithResults: number, totalStudents: number): number => {
  return totalStudents > 0 ? Math.round((studentsWithResults / totalStudents) * 100) : 0;
};

export const groupResultsByStudent = (results: any[], students: any[]) => {
  return results.reduce((acc, result) => {
    if (!acc[result.studentId]) {
      acc[result.studentId] = {
        student: students.find(s => s.studentId === result.studentId),
        results: []
      };
    }
    acc[result.studentId].results.push(result);
    return acc;
  }, {} as Record<string, { student: any; results: any[] }>);
};

export const filterResults = (results: any[], searchTerm: string, subjectFilter: string) => {
  return results.filter(result => {
    const matchesSearch = !searchTerm || 
      result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = subjectFilter === 'all' || result.subjectId === subjectFilter;
    
    return matchesSearch && matchesSubject;
  });
};

export const getUniqueSubjects = (results: any[], subjects: any[]) => {
  return Array.from(new Set(results.map(r => r.subjectId)))
    .map(subjectId => {
      const subject = subjects.find(s => s.id === subjectId);
      return subject ? { id: subject.id, name: subject.name } : null;
    })
    .filter(Boolean);
};

export const calculateStats = (students: any[], results: any[], resultsByStudent: any) => {
  const totalStudents = students.length;
  const totalResults = results.length;
  const approvedResults = results.filter(r => r.isApproved).length;
  const pendingResults = results.filter(r => !r.isApproved).length;
  const completionRate = calculateCompletionRate(Object.keys(resultsByStudent).length, totalStudents);

  return {
    totalStudents,
    totalResults,
    approvedResults,
    pendingResults,
    completionRate
  };
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};

export const validateResultSelection = (selectedResults: string[]): boolean => {
  return selectedResults.length > 0;
};

export const getPendingResults = (results: any[]): any[] => {
  return results.filter(r => !r.isApproved);
};

export const getApprovedResults = (results: any[]): any[] => {
  return results.filter(r => r.isApproved);
};