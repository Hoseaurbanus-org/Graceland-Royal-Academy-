import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

// Core Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'supervisor' | 'accountant' | 'parent';
  name: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
  password?: string;
  must_change_password?: boolean;
  isNewUser?: boolean;
}

export interface Class {
  id: string;
  name: string;
  level: string;
  capacity: number;
  assigned_subjects: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Student {
  id: string;
  name: string;
  admission_number: string;
  class_id: string;
  parent_id?: string;
  assigned_subjects: string[];
  date_of_birth?: string;
  address?: string;
  phone?: string;
  photo_url?: string;
  blood_group?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Staff {
  id: string;
  user_id: string;
  name: string;
  email: string;
  assigned_classes: string[];
  assigned_subjects: string[];
  phone?: string;
  qualification?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Result {
  id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  supervisor_id: string;
  term: string;
  session: string;
  test1_score: number;
  test2_score: number;
  exam_score: number;
  total_score: number;
  percentage: number;
  grade: string;
  position?: number;
  status: 'draft' | 'submitted' | 'approved' | 'published';
  submitted_at?: string;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  parent_id: string;
  amount: number;
  purpose: string;
  payment_method: string;
  reference: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payment_date: string;
  session: string;
  term: string;
  created_at: string;
  updated_at: string;
}

export interface SessionTerm {
  id: string;
  session: string;
  term: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  students: Student[];
  classes: Class[];
  subjects: Subject[];
  staff: Staff[];
  results: Result[];
  payments: Payment[];
  sessionTerms: SessionTerm[];
  currentSession: string;
  currentTerm: string;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  completeOnboarding: () => void;
  refreshData: () => Promise<void>;
  isConnected: boolean;
  
  // Admin Functions
  createClass: (classData: { name: string; level: string; capacity: number }) => Promise<{ success: boolean; error?: string }>;
  updateClass: (classId: string, classData: Partial<Class>) => Promise<{ success: boolean; error?: string }>;
  deleteClass: (classId: string) => Promise<{ success: boolean; error?: string }>;
  
  createSubject: (subjectData: { name: string; code: string; description?: string }) => Promise<{ success: boolean; error?: string }>;
  updateSubject: (subjectId: string, subjectData: Partial<Subject>) => Promise<{ success: boolean; error?: string }>;
  deleteSubject: (subjectId: string) => Promise<{ success: boolean; error?: string }>;
  
  createStaff: (staffData: { name: string; email: string; password: string; role: 'supervisor' | 'accountant'; assigned_classes?: string[]; assigned_subjects?: string[] }) => Promise<{ success: boolean; error?: string }>;
  updateStaff: (staffId: string, staffData: Partial<Staff>) => Promise<{ success: boolean; error?: string }>;
  deleteStaff: (staffId: string) => Promise<{ success: boolean; error?: string }>;
  
  registerStudent: (studentData: { name: string; admission_number: string; class_id: string; parent_name?: string; parent_email?: string; photo?: File }) => Promise<{ success: boolean; error?: string }>;
  updateStudent: (studentId: string, studentData: Partial<Student>) => Promise<{ success: boolean; error?: string }>;
  deleteStudent: (studentId: string) => Promise<{ success: boolean; error?: string }>;
  
  assignSubjectsToClass: (classId: string, subjectIds: string[]) => Promise<{ success: boolean; error?: string }>;
  assignSubjectsToStudent: (studentId: string, subjectIds: string[]) => Promise<{ success: boolean; error?: string }>;
  
  setActiveSessionTerm: (session: string, term: string) => Promise<{ success: boolean; error?: string }>;
  
  // Supervisor Functions
  recordResult: (resultData: { student_id: string; subject_id: string; test1_score: number; test2_score: number; exam_score: number }) => Promise<{ success: boolean; error?: string }>;
  submitResults: (classId: string, subjectId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Admin Result Management
  approveResults: (classId: string, subjectId: string, session: string, term: string) => Promise<{ success: boolean; error?: string }>;
  publishResults: (classId: string, session: string, term: string) => Promise<{ success: boolean; error?: string }>;
  
  // Parent Functions
  makePayment: (paymentData: { student_id: string; amount: number; purpose: string; payment_method: string }) => Promise<{ success: boolean; error?: string; reference?: string }>;
  
  // Parent Registration
  registerParent: (parentData: { parentName: string; parentEmail: string; parentPhone: string; studentId: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  
  // Utility Functions
  uploadStudentPhoto: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  getStudentsByClass: (classId: string) => Student[];
  getResultsByStudent: (studentId: string, session?: string, term?: string) => Result[];
  getMyChildren: (parentId: string) => Student[];
  getStaffAssignments: (staffId: string) => { classes: string[]; subjects: string[] };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Default Admin User
const getAdminUser = (): User => ({
  id: 'admin-1',
  email: 'admin@gra.edu',
  role: 'admin',
  name: 'System Administrator',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_active: true,
  password: 'admin123'
});

// Default Academic Structure
const getDefaultClasses = (): Class[] => [
  {
    id: 'class-1',
    name: 'Nursery 1',
    level: 'Pre-Primary',
    capacity: 25,
    assigned_subjects: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true
  },
  {
    id: 'class-2',
    name: 'Nursery 2',
    level: 'Pre-Primary',
    capacity: 25,
    assigned_subjects: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true
  },
  {
    id: 'class-3',
    name: 'Primary 1',
    level: 'Primary',
    capacity: 30,
    assigned_subjects: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true
  },
  {
    id: 'class-4',
    name: 'Primary 2',
    level: 'Primary',
    capacity: 30,
    assigned_subjects: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true
  },
  {
    id: 'class-5',
    name: 'Primary 3',
    level: 'Primary',
    capacity: 30,
    assigned_subjects: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true
  }
];

const getDefaultSubjects = (): Subject[] => [
  {
    id: 'subject-1',
    name: 'Mathematics',
    code: 'MTH',
    description: 'General Mathematics',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true
  },
  {
    id: 'subject-2',
    name: 'English Language',
    code: 'ENG',
    description: 'English Language and Literature',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true
  },
  {
    id: 'subject-3',
    name: 'Basic Science',
    code: 'BSC',
    description: 'Basic Science and Technology',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true
  },
  {
    id: 'subject-4',
    name: 'Social Studies',
    code: 'SOS',
    description: 'Social Studies and Civic Education',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true
  }
];

const getDefaultSessionTerms = (): SessionTerm[] => [
  {
    id: 'st-1',
    session: '2024/2025',
    term: 'First Term',
    is_active: true,
    start_date: '2024-09-01',
    end_date: '2024-12-15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'st-2',
    session: '2024/2025',
    term: 'Second Term',
    is_active: false,
    start_date: '2025-01-08',
    end_date: '2025-04-15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'st-3',
    session: '2024/2025',
    term: 'Third Term',
    is_active: false,
    start_date: '2025-04-22',
    end_date: '2025-07-15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sessionTerms, setSessionTerms] = useState<SessionTerm[]>([]);
  const [currentSession, setCurrentSession] = useState('2024/2025');
  const [currentTerm, setCurrentTerm] = useState('First Term');
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  // Storage helpers
  const getStorageKey = (key: string) => `gra_${key}`;
  
  const saveToStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(getStorageKey(key), JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  };

  const loadFromStorage = (key: string, defaultValue: any = []) => {
    try {
      const stored = localStorage.getItem(getStorageKey(key));
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return defaultValue;
    }
  };

  // Initialize data
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Check for existing user session
      const existingUser = loadFromStorage('current_user', null);
      if (existingUser) {
        setUser(existingUser);
      }
      
      // Load all data
      await loadInitialData();
      
    } catch (error) {
      console.error('Auth initialization error:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      // Load or initialize default data
      const loadedStudents = loadFromStorage('students', []);
      const loadedClasses = loadFromStorage('classes', getDefaultClasses());
      const loadedSubjects = loadFromStorage('subjects', getDefaultSubjects());
      const loadedStaff = loadFromStorage('staff', []);
      const loadedResults = loadFromStorage('results', []);
      const loadedPayments = loadFromStorage('payments', []);
      const loadedSessionTerms = loadFromStorage('session_terms', getDefaultSessionTerms());

      // Get active session/term
      const activeSessionTerm = loadedSessionTerms.find((st: SessionTerm) => st.is_active);
      if (activeSessionTerm) {
        setCurrentSession(activeSessionTerm.session);
        setCurrentTerm(activeSessionTerm.term);
      }

      setStudents(loadedStudents);
      setClasses(loadedClasses);
      setSubjects(loadedSubjects);
      setStaff(loadedStaff);
      setResults(loadedResults);
      setPayments(loadedPayments);
      setSessionTerms(loadedSessionTerms);

      // Save defaults
      saveToStorage('students', loadedStudents);
      saveToStorage('classes', loadedClasses);
      saveToStorage('subjects', loadedSubjects);
      saveToStorage('staff', loadedStaff);
      saveToStorage('results', loadedResults);
      saveToStorage('payments', loadedPayments);
      saveToStorage('session_terms', loadedSessionTerms);

      setIsConnected(true);
    } catch (error) {
      console.error('Data loading error:', error);
      setIsConnected(false);
    }
  };

  // Authentication
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Admin login
      if (email === 'admin@gra.edu' && password === 'admin123') {
        const adminUser = getAdminUser();
        const updatedUser = {
          ...adminUser,
          last_login: new Date().toISOString()
        };
        setUser(updatedUser);
        saveToStorage('current_user', updatedUser);
        return { success: true };
      }

      // Check for staff and parent users
      const createdUsers = loadFromStorage('created_users', []);
      const foundUser = createdUsers.find((u: User) => u.email === email);
      
      if (!foundUser) {
        return { success: false, error: 'Invalid email address. Please check your credentials or contact the administrator.' };
      }

      if (!foundUser.is_active) {
        return { success: false, error: 'Account is deactivated. Please contact the administrator.' };
      }

      if (foundUser.password !== password) {
        return { success: false, error: 'Invalid password. Please check your password or contact the administrator.' };
      }

      // Successful login
      const updatedUser = {
        ...foundUser,
        last_login: new Date().toISOString()
      };
      
      setUser(updatedUser);
      saveToStorage('current_user', updatedUser);
      
      return { success: true };
      
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(getStorageKey('current_user'));
    toast.success('Signed out successfully');
  };

  const completeOnboarding = () => {
    if (user) {
      const updatedUser = { ...user, isNewUser: false };
      setUser(updatedUser);
      saveToStorage('current_user', updatedUser);
    }
  };

  const refreshData = async () => {
    await loadInitialData();
    toast.success('Data refreshed');
  };

  // Grade calculation
  const calculateGrade = (percentage: number): string => {
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    return 'F';
  };

  // Photo upload
  const uploadStudentPhoto = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'File size must be less than 5MB' };
      }

      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'File must be an image' };
      }

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          resolve({ success: true, url: dataUrl });
        };
        reader.onerror = () => {
          resolve({ success: false, error: 'Failed to process image' });
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      return { success: false, error: 'Failed to upload photo' };
    }
  };

  // Admin Functions
  const createClass = async (classData: { name: string; level: string; capacity: number }) => {
    try {
      if (!user || user.role !== 'admin') {
        return { success: false, error: 'Only administrators can create classes' };
      }

      const existingClass = classes.find(c => c.name === classData.name && c.is_active);
      if (existingClass) {
        return { success: false, error: 'Class with this name already exists' };
      }

      const newClass: Class = {
        id: `class-${Date.now()}`,
        name: classData.name,
        level: classData.level,
        capacity: classData.capacity,
        assigned_subjects: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      };

      const updatedClasses = [...classes, newClass];
      setClasses(updatedClasses);
      saveToStorage('classes', updatedClasses);

      toast.success(`Class ${classData.name} created successfully`);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to create class' };
    }
  };

  const updateClass = async (classId: string, classData: Partial<Class>) => {
    try {
      if (!user || user.role !== 'admin') {
        return { success: false, error: 'Only administrators can update classes' };
      }

      const updatedClasses = classes.map(c => 
        c.id === classId ? { ...c, ...classData, updated_at: new Date().toISOString() } : c
      );
      setClasses(updatedClasses);
      saveToStorage('classes', updatedClasses);

      toast.success('Class updated successfully');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update class' };
    }
  };

  const deleteClass = async (classId: string) => {
    try {
      if (!user || user.role !== 'admin') {
        return { success: false, error: 'Only administrators can delete classes' };
      }

      const updatedClasses = classes.filter(c => c.id !== classId);
      setClasses(updatedClasses);
      saveToStorage('classes', updatedClasses);

      toast.success('Class deleted successfully');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete class' };
    }
  };

  const createSubject = async (subjectData: { name: string; code: string; description?: string }) => {
    try {
      if (!user || user.role !== 'admin') {
        return { success: false, error: 'Only administrators can create subjects' };
      }

      const existingSubject = subjects.find(s => s.code === subjectData.code && s.is_active);
      if (existingSubject) {
        return { success: false, error: 'Subject with this code already exists' };
      }

      const newSubject: Subject = {
        id: `subject-${Date.now()}`,
        name: subjectData.name,
        code: subjectData.code,
        description: subjectData.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      };

      const updatedSubjects = [...subjects, newSubject];
      setSubjects(updatedSubjects);
      saveToStorage('subjects', updatedSubjects);

      toast.success(`Subject ${subjectData.name} created successfully`);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to create subject' };
    }
  };

  const updateSubject = async (subjectId: string, subjectData: Partial<Subject>) => {
    try {
      if (!user || user.role !== 'admin') {
        return { success: false, error: 'Only administrators can update subjects' };
      }

      const updatedSubjects = subjects.map(s => 
        s.id === subjectId ? { ...s, ...subjectData, updated_at: new Date().toISOString() } : s
      );
      setSubjects(updatedSubjects);
      saveToStorage('subjects', updatedSubjects);

      toast.success('Subject updated successfully');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update subject' };
    }
  };

  const deleteSubject = async (subjectId: string) => {
    try {
      if (!user || user.role !== 'admin') {
        return { success: false, error: 'Only administrators can delete subjects' };
      }

      const updatedSubjects = subjects.filter(s => s.id !== subjectId);
      setSubjects(updatedSubjects);
      saveToStorage('subjects', updatedSubjects);

      toast.success('Subject deleted successfully');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete subject' };
    }
  };

  const createStaff = async (staffData: { name: string; email: string; password: string; role: 'supervisor' | 'accountant'; assigned_classes?: string[]; assigned_subjects?: string[] }) => {
    try {
      if (!user || user.role !== 'admin') {
        return { success: false, error: 'Only administrators can create staff' };
      }

      // Check if user already exists
      const createdUsers = loadFromStorage('created_users', []);
      const existingUser = createdUsers.find((u: User) => u.email === staffData.email);
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Create user account
      const newUser: User = {
        id: `${staffData.role}-${Date.now()}`,
        email: staffData.email,
        name: staffData.name,
        role: staffData.role,
        password: staffData.password,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        must_change_password: false
      };

      // Create staff record
      const newStaff: Staff = {
        id: `staff-${Date.now()}`,
        user_id: newUser.id,
        name: staffData.name,
        email: staffData.email,
        assigned_classes: staffData.assigned_classes || [],
        assigned_subjects: staffData.assigned_subjects || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      };

      // Save user
      const updatedUsers = [...createdUsers, newUser];
      saveToStorage('created_users', updatedUsers);

      // Save staff
      const updatedStaff = [...staff, newStaff];
      setStaff(updatedStaff);
      saveToStorage('staff', updatedStaff);

      toast.success(`${staffData.role} ${staffData.name} created successfully`);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to create staff' };
    }
  };

  const updateStaff = async (staffId: string, staffData: Partial<Staff>) => {
    try {
      if (!user || user.role !== 'admin') {
        return { success: false, error: 'Only administrators can update staff' };
      }

      const updatedStaff = staff.map(s => 
        s.id === staffId ? { ...s, ...staffData, updated_at: new Date().toISOString() } : s
      );
      setStaff(updatedStaff);
      saveToStorage('staff', updatedStaff);

      toast.success('Staff updated successfully');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update staff' };
    }
  };

  const deleteStaff = async (staffId: string) => {
    try {
      if (!user || user.role !== 'admin') {
        return { success: false, error: 'Only administrators can delete staff' };
      }

      const staffMember = staff.find(s => s.id === staffId);
      if (staffMember) {
        // Remove user account
        const createdUsers = loadFromStorage('created_users', []);
        const updatedUsers = createdUsers.filter((u: User) => u.id !== staffMember.user_id);
        saveToStorage('created_users', updatedUsers);
      }

      // Remove staff record
      const updatedStaff = staff.filter(s => s.id !== staffId);
      setStaff(updatedStaff);
      saveToStorage('staff', updatedStaff);

      toast.success('Staff deleted successfully');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete staff' };
    }
  };

  const registerStudent = async (studentData: { name: string; admission_number: string; class_id: string; parent_name?: string; parent_email?: string; photo?: File }) => {
    try {
      if (!user || user.role !== 'admin') {
        return { success: false, error: 'Only administrators can register students' };
      }

      // Check if admission number already exists
      const existingStudent = students.find(s => s.admission_number === studentData.admission_number);
      if (existingStudent) {
        return { success: false, error: 'Student with this admission number already exists' };
      }

      let parentId = null;
      let photoUrl = undefined;

      // Upload photo if provided
      if (studentData.photo) {
        const photoResult = await uploadStudentPhoto(studentData.photo);
        if (photoResult.success) {
          photoUrl = photoResult.url;
        } else {
          return { success: false, error: photoResult.error };
        }
      }

      // Create parent account if details provided
      if (studentData.parent_email && studentData.parent_name) {
        const createdUsers = loadFromStorage('created_users', []);
        
        // Check if parent already exists
        const existingParent = createdUsers.find((u: User) => u.email === studentData.parent_email);
        if (!existingParent) {
          const newParent: User = {
            id: `parent-${Date.now()}`,
            email: studentData.parent_email,
            name: studentData.parent_name,
            role: 'parent',
            password: 'parent123', // Default password
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            isNewUser: true
          };

          const updatedUsers = [...createdUsers, newParent];
          saveToStorage('created_users', updatedUsers);
          parentId = newParent.id;
        } else {
          parentId = existingParent.id;
        }
      }

      // Get class assigned subjects
      const selectedClass = classes.find(c => c.id === studentData.class_id);
      const assignedSubjects = selectedClass?.assigned_subjects || [];

      // Create student
      const newStudent: Student = {
        id: `student-${Date.now()}`,
        name: studentData.name,
        admission_number: studentData.admission_number,
        class_id: studentData.class_id,
        parent_id: parentId,
        assigned_subjects: assignedSubjects,
        photo_url: photoUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      };

      const updatedStudents = [...students, newStudent];
      setStudents(updatedStudents);
      saveToStorage('students', updatedStudents);

      toast.success(`Student ${studentData.name} registered successfully`);
      if (parentId && studentData.parent_name) {
        toast.info(`Parent account created for ${studentData.parent_name}`);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to register student' };
    }
  };

  const updateStudent = async (studentId: string, studentData: Partial<Student>) => {
    try {
      if (!user || user.role !== 'admin') {
        return { success: false, error: 'Only administrators can update students' };
      }

      const updatedStudents = students.map(s => 
        s.id === studentId ? { ...s, ...studentData, updated_at: new Date().toISOString() } : s
      );
      setStudents(updatedStudents);
      saveToStorage('students', updatedStudents);

      toast.success('Student updated successfully');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update student' };
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
      if (!user || user.role !== 'admin') {
        return { success: false, error: 'Only administrators can delete students' };
      }

      const updatedStudents = students.filter(s => s.id !== studentId);
      setStudents(updatedStudents);
      saveToStorage('students', updatedStudents);

      toast.success('Student deleted successfully');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete student' };
    }
  };

  const assignSubjectsToClass = async (classId: string, subjectIds: string[]) => {
    try {
      if (!user || user.role !== 'admin') {
        return { success: false, error: 'Only administrators can assign subjects' };
      }

      const updatedClasses = classes.map(c => 
        c.id === classId ? { ...c, assigned_subjects: subjectIds, updated_at: new Date().toISOString() } : c
      );
      setClasses(updatedClasses);
      saveToStorage('classes', updatedClasses);

      // Update all students in this class
      const updatedStudents = students.map(s => 
        s.class_id === classId ? { ...s, assigned_subjects: subjectIds, updated_at: new Date().toISOString() } : s
      );
      setStudents(updatedStudents);
      saveToStorage('students', updatedStudents);

      toast.success('Subjects assigned to class successfully');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to assign subjects' };
    }
  };

  const assignSubjectsToStudent = async (studentId: string, subjectIds: string[]) => {
    try {
      if (!user || user.role !== 'admin') {
        return { success: false, error: 'Only administrators can assign subjects' };
      }

      const updatedStudents = students.map(s => 
        s.id === studentId ? { ...s, assigned_subjects: subjectIds, updated_at: new Date().toISOString() } : s
      );
      setStudents(updatedStudents);
      saveToStorage('students', updatedStudents);

      toast.success('Subjects assigned to student successfully');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to assign subjects' };
    }
  };

  const setActiveSessionTerm = async (session: string, term: string) => {
    try {
      if (!user || user.role !== 'admin') {
        return { success: false, error: 'Only administrators can set active session/term' };
      }

      const updatedSessionTerms = sessionTerms.map(st => ({
        ...st,
        is_active: st.session === session && st.term === term,
        updated_at: new Date().toISOString()
      }));

      setSessionTerms(updatedSessionTerms);
      saveToStorage('session_terms', updatedSessionTerms);
      setCurrentSession(session);
      setCurrentTerm(term);

      toast.success(`Active session/term set to ${session} - ${term}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to set active session/term' };
    }
  };

  // Supervisor Functions
  const recordResult = async (resultData: { student_id: string; subject_id: string; test1_score: number; test2_score: number; exam_score: number }) => {
    try {
      if (!user || user.role !== 'supervisor') {
        return { success: false, error: 'Only supervisors can record results' };
      }

      const student = students.find(s => s.id === resultData.student_id);
      if (!student) {
        return { success: false, error: 'Student not found' };
      }

      // Calculate totals
      const totalScore = resultData.test1_score + resultData.test2_score + resultData.exam_score;
      const percentage = Math.round((totalScore / 300) * 100);
      const grade = calculateGrade(percentage);

      // Check if result already exists
      const existingResultIndex = results.findIndex(r => 
        r.student_id === resultData.student_id &&
        r.subject_id === resultData.subject_id &&
        r.session === currentSession &&
        r.term === currentTerm
      );

      const newResult: Result = {
        id: existingResultIndex >= 0 ? results[existingResultIndex].id : `result-${Date.now()}`,
        student_id: resultData.student_id,
        subject_id: resultData.subject_id,
        class_id: student.class_id,
        supervisor_id: user.id,
        term: currentTerm,
        session: currentSession,
        test1_score: resultData.test1_score,
        test2_score: resultData.test2_score,
        exam_score: resultData.exam_score,
        total_score: totalScore,
        percentage: percentage,
        grade: grade,
        status: 'draft',
        created_at: existingResultIndex >= 0 ? results[existingResultIndex].created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let updatedResults;
      if (existingResultIndex >= 0) {
        updatedResults = [...results];
        updatedResults[existingResultIndex] = newResult;
      } else {
        updatedResults = [...results, newResult];
      }

      setResults(updatedResults);
      saveToStorage('results', updatedResults);

      toast.success('Result recorded successfully');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to record result' };
    }
  };

  const submitResults = async (classId: string, subjectId: string) => {
    try {
      if (!user || user.role !== 'supervisor') {
        return { success: false, error: 'Only supervisors can submit results' };
      }

      const updatedResults = results.map(r => 
        r.class_id === classId && 
        r.subject_id === subjectId && 
        r.session === currentSession && 
        r.term === currentTerm &&
        r.supervisor_id === user.id
          ? { ...r, status: 'submitted' as const, submitted_at: new Date().toISOString() }
          : r
      );

      setResults(updatedResults);
      saveToStorage('results', updatedResults);

      toast.success('Results submitted for admin review');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to submit results' };
    }
  };

  // Admin Result Management
  const approveResults = async (classId: string, subjectId: string, session: string, term: string) => {
    try {
      if (!user || user.role !== 'admin') {
        return { success: false, error: 'Only administrators can approve results' };
      }

      const updatedResults = results.map(r => 
        r.class_id === classId && 
        r.subject_id === subjectId && 
        r.session === session && 
        r.term === term
          ? { 
              ...r, 
              status: 'approved' as const, 
              approved_at: new Date().toISOString(),
              approved_by: user.id
            }
          : r
      );

      setResults(updatedResults);
      saveToStorage('results', updatedResults);

      toast.success('Results approved successfully');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to approve results' };
    }
  };

  const publishResults = async (classId: string, session: string, term: string) => {
    try {
      if (!user || user.role !== 'admin') {
        return { success: false, error: 'Only administrators can publish results' };
      }

      const updatedResults = results.map(r => 
        r.class_id === classId && 
        r.session === session && 
        r.term === term &&
        r.status === 'approved'
          ? { ...r, status: 'published' as const }
          : r
      );

      setResults(updatedResults);
      saveToStorage('results', updatedResults);

      toast.success('Results published for parents');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to publish results' };
    }
  };

  // Parent Functions
  const makePayment = async (paymentData: { student_id: string; amount: number; purpose: string; payment_method: string }) => {
    try {
      if (!user || user.role !== 'parent') {
        return { success: false, error: 'Only parents can make payments' };
      }

      const reference = `GRA${Date.now()}`;
      const newPayment: Payment = {
        id: `payment-${Date.now()}`,
        student_id: paymentData.student_id,
        parent_id: user.id,
        amount: paymentData.amount,
        purpose: paymentData.purpose,
        payment_method: paymentData.payment_method,
        reference: reference,
        status: 'completed', // Simplified for demo
        payment_date: new Date().toISOString(),
        session: currentSession,
        term: currentTerm,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const updatedPayments = [...payments, newPayment];
      setPayments(updatedPayments);
      saveToStorage('payments', updatedPayments);

      toast.success('Payment completed successfully');
      return { success: true, reference };
    } catch (error) {
      return { success: false, error: 'Failed to process payment' };
    }
  };

  // Parent Registration
  const registerParent = async (parentData: { parentName: string; parentEmail: string; parentPhone: string; studentId: string; password: string }) => {
    try {
      // Check if student exists and doesn't have a parent
      const student = students.find(s => s.id === parentData.studentId);
      if (!student) {
        return { success: false, error: 'Student not found' };
      }

      if (student.parent_id) {
        return { success: false, error: 'This student already has a registered parent' };
      }

      // Check if email already exists
      const createdUsers = loadFromStorage('created_users', []);
      const existingUser = createdUsers.find((u: User) => u.email === parentData.parentEmail);
      if (existingUser) {
        return { success: false, error: 'Email already registered' };
      }

      // Create parent user
      const newParent: User = {
        id: `parent-${Date.now()}`,
        email: parentData.parentEmail,
        name: parentData.parentName,
        role: 'parent',
        password: parentData.password,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        isNewUser: true
      };

      // Save parent user
      const updatedUsers = [...createdUsers, newParent];
      saveToStorage('created_users', updatedUsers);

      // Link student to parent
      const updatedStudents = students.map(s => 
        s.id === parentData.studentId ? { ...s, parent_id: newParent.id } : s
      );
      setStudents(updatedStudents);
      saveToStorage('students', updatedStudents);

      toast.success('Parent registration successful! You can now log in.');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  // Utility Functions
  const getStudentsByClass = (classId: string) => {
    return students.filter(s => s.class_id === classId && s.is_active);
  };

  const getResultsByStudent = (studentId: string, session?: string, term?: string) => {
    return results.filter(r => 
      r.student_id === studentId &&
      (!session || r.session === session) &&
      (!term || r.term === term)
    );
  };

  const getMyChildren = (parentId: string) => {
    return students.filter(s => s.parent_id === parentId && s.is_active);
  };

  const getStaffAssignments = (staffId: string) => {
    const staffMember = staff.find(s => s.user_id === staffId);
    return {
      classes: staffMember?.assigned_classes || [],
      subjects: staffMember?.assigned_subjects || []
    };
  };

  const value: AuthContextType = {
    user,
    students,
    classes,
    subjects,
    staff,
    results,
    payments,
    sessionTerms,
    currentSession,
    currentTerm,
    loading,
    signIn,
    signOut,
    completeOnboarding,
    refreshData,
    isConnected,
    createClass,
    updateClass,
    deleteClass,
    createSubject,
    updateSubject,
    deleteSubject,
    createStaff,
    updateStaff,
    deleteStaff,
    registerStudent,
    updateStudent,
    deleteStudent,
    assignSubjectsToClass,
    assignSubjectsToStudent,
    setActiveSessionTerm,
    recordResult,
    submitResults,
    approveResults,
    publishResults,
    makePayment,
    registerParent,
    uploadStudentPhoto,
    getStudentsByClass,
    getResultsByStudent,
    getMyChildren,
    getStaffAssignments
  };

  return (
    <AuthContext.Provider value={value}>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background flex items-center justify-center z-50"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-muted-foreground">Loading Graceland Royal Academy...</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
}