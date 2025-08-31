export interface Student {
  id: string;
  name: string;
  class: string;
  rollNumber: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  dateOfBirth: string;
  address: string;
  registrationSession: string;
  status: 'active' | 'inactive';
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'teacher' | 'supervisor' | 'admin' | 'support_staff';
  subjects: string[]; // Array of subject IDs this staff is assigned to
  classes: string[];
  employeeId: string;
  dateJoined: string;
  qualification: string;
  status: 'active' | 'inactive';
  password: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  category?: string;
  level?: string;
  description?: string;
  assignedStaff: string[]; // Array of staff IDs assigned to this subject
  maxScores?: {
    test1: number;
    test2: number;
    exam: number;
  };
  createdBy?: string;
}

export interface ClassData {
  id: string;
  name: string;
  level: string;
  capacity: number;
  currentStudents: number;
  supervisor: string;
  academicSession: string;
}

export interface StudentScore {
  test1: number;
  test2: number;
  exam: number;
  total: number;
  average: number;
  grade: string;
  rank: number;
}

export interface StudentResults {
  [subjectName: string]: {
    [term: string]: StudentScore;
  };
}

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

export interface FeeStructure {
  tuition: number;
  development: number;
  sports: number;
  library: number;
  pta: number;
  laboratory?: number;
  total: number;
}

export interface AcademicSession {
  year: string;
  currentTerm: string;
  startDate: string;
  endDate: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  type: 'session' | 'term' | 'holiday' | 'exam' | 'event';
  description: string;
  createdBy: string;
  createdAt: Date;
}

export interface Grade {
  letter: string;
  minScore: number;
  maxScore: number;
  description: string;
}

export interface AssessmentWeights {
  test1: number;
  test2: number;
  exam: number;
}

export interface ClassStatistics {
  totalStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  gradeDistribution: { [grade: string]: number };
}

// Score-related interfaces for the result compilation system
export interface ScoreEntry {
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  test1: number;
  test2: number;
  exam: number;
  total: number;
  grade: string;
  term: string;
  session: string;
  enteredBy: string;
  enteredAt: string;
}

export interface ResultSummary {
  studentId: string;
  studentName: string;
  class: string;
  session: string;
  term: string;
  subjects: {
    [subjectId: string]: {
      subjectName: string;
      test1: number;
      test2: number;
      exam: number;
      total: number;
      grade: string;
      position: number;
    };
  };
  totalScore: number;
  averageScore: number;
  overallGrade: string;
  overallPosition: number;
  numberOfSubjects: number;
}

export type UserRole = 'admin' | 'teacher' | 'supervisor' | 'parent' | 'accountant';
export type PaymentStatus = 'pending' | 'partial' | 'cleared';
export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'transferred';
export type StaffStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';