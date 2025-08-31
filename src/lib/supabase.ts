// Offline-first educational management system
// This module provides local storage-based functionality without external dependencies

// Mock Supabase client for compatibility
export const supabase = {
  from: () => ({
    select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
    insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
    update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }),
    delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) })
  }),
  removeAllChannels: () => {},
  channel: () => ({
    on: () => ({ subscribe: () => {} })
  })
};

// Database types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'supervisor' | 'accountant' | 'parent';
  name: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
  password_changed_at?: string;
  must_change_password?: boolean;
}

export interface Student {
  id: string;
  name: string;
  admission_number: string;
  class_id: string;
  parent_id?: string;
  date_of_birth?: string;
  address?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Class {
  id: string;
  name: string;
  level: string;
  capacity: number;
  class_teacher_id?: string;
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

export interface Staff {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  qualification?: string;
  date_employed?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface StaffAssignment {
  id: string;
  staff_id: string;
  subject_id?: string;
  class_id?: string;
  assignment_type: 'subject' | 'class' | 'both';
  created_at: string;
  updated_at: string;
}

export interface Result {
  id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  term: string;
  session: string;
  test1_score?: number;
  test2_score?: number;
  exam_score?: number;
  total_score: number;
  grade: string;
  position?: number;
  supervisor_id: string;
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
  amount: number;
  purpose: string;
  payment_method: string;
  transaction_ref: string;
  status: 'pending' | 'verified' | 'approved' | 'completed';
  payment_date: string;
  approved_by?: string;
  receipt_number?: string;
  created_at: string;
  updated_at: string;
}

// Additional interfaces for Result Context
export interface StudentScore {
  id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  class_id: string;
  class_name: string;
  term: string;
  session: string;
  test1_score?: number;
  test2_score?: number;
  exam_score?: number;
  total_score: number;
  grade: string;
  position?: number;
  supervisor_id: string;
  supervisor_name?: string;
  status: 'draft' | 'submitted' | 'approved' | 'published';
  submitted_at?: string;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicSession {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface Term {
  id: string;
  session_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

// School configuration interface
export interface SchoolConfig {
  id: string;
  school_name: string;
  school_address: string;
  school_phone: string;
  school_email: string;
  current_session: string;
  current_term: 'First Term' | 'Second Term' | 'Third Term';
  school_logo_url?: string;
  created_at: string;
  updated_at: string;
}

// Offline authentication - no external requests
export const signIn = async (email: string, password: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate processing time
      if (email === 'admin@gra.edu' && password === 'admin123') {
        resolve({
          success: true,
          user: {
            id: 'admin-1',
            email: 'admin@gra.edu',
            name: 'System Administrator',
            role: 'admin',
            is_active: true,
            must_change_password: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        });
      } else {
        resolve({ success: false, error: 'Invalid credentials' });
      }
    }, 500);
  });
};

export const signOut = async () => {
  return { success: true };
};

// Mock real-time subscriptions
export const subscribeToTable = (table: string, callback: (payload: any) => void) => {
  return {
    unsubscribe: () => {}
  };
};

// Utility functions
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('gra_current_user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: User) => {
  try {
    localStorage.setItem('gra_current_user', JSON.stringify(user));
  } catch (error) {
    console.warn('Failed to save user to localStorage');
  }
};

export const clearCurrentUser = () => {
  try {
    localStorage.removeItem('gra_current_user');
  } catch (error) {
    console.warn('Failed to clear user from localStorage');
  }
};

// Password management
export const changePassword = async (userId: string, newPassword: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real system, this would update the database
      resolve({ success: true });
    }, 1000);
  });
};

export const resetUserPassword = async (userId: string, newPassword: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real system, this would update the database
      resolve({ success: true });
    }, 1000);
  });
};

// Connection status checker
export const isSupabaseConnected = async (): Promise<boolean> => {
  return true; // Always return true for demo mode
};

// Generic database operations (localStorage-based)
export const insertRecord = async (table: string, data: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const key = `gra_${table}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const newRecord = {
          ...data,
          id: data.id || `${table}_${Date.now()}`,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        existing.push(newRecord);
        localStorage.setItem(key, JSON.stringify(existing));
        resolve({ success: true, data: newRecord });
      } catch (error) {
        resolve({ success: false, error: 'Failed to insert record' });
      }
    }, 300);
  });
};

export const updateRecord = async (table: string, id: string, data: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const key = `gra_${table}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const index = existing.findIndex((item: any) => item.id === id);
        if (index !== -1) {
          existing[index] = { ...existing[index], ...data, updated_at: new Date().toISOString() };
          localStorage.setItem(key, JSON.stringify(existing));
          resolve({ success: true, data: existing[index] });
        } else {
          resolve({ success: false, error: 'Record not found' });
        }
      } catch (error) {
        resolve({ success: false, error: 'Failed to update record' });
      }
    }, 300);
  });
};

export const deleteRecord = async (table: string, id: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const key = `gra_${table}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = existing.filter((item: any) => item.id !== id);
        localStorage.setItem(key, JSON.stringify(filtered));
        resolve({ success: true });
      } catch (error) {
        resolve({ success: false, error: 'Failed to delete record' });
      }
    }, 300);
  });
};

export const fetchRecords = async (table: string, options: any = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const key = `gra_${table}`;
        let data = JSON.parse(localStorage.getItem(key) || '[]');
        
        if (options.where) {
          Object.entries(options.where).forEach(([field, value]) => {
            data = data.filter((item: any) => item[field] === value);
          });
        }
        
        if (options.orderBy) {
          data.sort((a: any, b: any) => {
            const aVal = a[options.orderBy.column];
            const bVal = b[options.orderBy.column];
            if (options.orderBy.ascending) {
              return aVal > bVal ? 1 : -1;
            } else {
              return aVal < bVal ? 1 : -1;
            }
          });
        }
        
        if (options.limit) {
          data = data.slice(0, options.limit);
        }

        resolve({ success: true, data });
      } catch (error) {
        resolve({ success: false, error: 'Failed to fetch records' });
      }
    }, 200);
  });
};

// Supabase helpers object
export const supabaseHelpers = {
  insertRecord,
  updateRecord,
  deleteRecord,
  fetchRecords,
  isConnected: isSupabaseConnected,
  
  // Helper for generating unique IDs
  generateId: () => crypto.randomUUID(),
  
  // Helper for formatting dates
  formatDate: (date: string | Date) => {
    return new Date(date).toISOString();
  },
  
  // Helper for checking if table exists
  checkTableExists: async (tableName: string) => {
    return true; // Always return true for demo
  },
  
  // Helper for bulk operations
  bulkInsert: async (table: string, records: any[]) => {
    try {
      const results = await Promise.all(
        records.map(record => insertRecord(table, record))
      );
      const data = results.map(r => (r as any).data).filter(Boolean);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Bulk insert failed' };
    }
  },
  
  // Helper for searching records
  searchRecords: async (table: string, searchColumn: string, searchTerm: string) => {
    const result = await fetchRecords(table);
    if (result.success && result.data) {
      const filtered = (result.data as any[]).filter((item: any) => 
        item[searchColumn]?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return { success: true, data: filtered };
    }
    return result;
  },

  // Result-specific helper functions
  getScoresForApproval: async (classId: string, session: string, term: string) => {
    // Mock data for demonstration
    const mockResults: StudentScore[] = [
      {
        id: '1',
        student_id: '1',
        student_name: 'John Doe',
        admission_number: 'GRA/2024/001',
        subject_id: '1',
        subject_name: 'Mathematics',
        subject_code: 'MTH',
        class_id: classId || '1',
        class_name: 'Primary 1',
        term: term || 'First Term',
        session: session || '2024/2025',
        test1_score: 18,
        test2_score: 16,
        exam_score: 55,
        total_score: 89,
        grade: 'A',
        position: 1,
        supervisor_id: '1',
        supervisor_name: 'Mrs. Smith',
        status: 'submitted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    return { data: mockResults, error: null };
  },

  getSupervisorAssignments: async (userId: string) => {
    const mockAssignments = [
      {
        id: '1',
        staff_id: '1',
        class_id: '1',
        subject_id: '1',
        assignment_type: 'both' as const
      }
    ];
    
    return { data: mockAssignments, error: null };
  },

  getStudentScores: async (studentId: string, session: string, term: string) => {
    const mockScores: StudentScore[] = [
      {
        id: '1',
        student_id: studentId,
        student_name: 'John Doe',
        admission_number: 'GRA/2024/001',
        subject_id: '1',
        subject_name: 'Mathematics',
        subject_code: 'MTH',
        class_id: '1',
        class_name: 'Primary 1',
        term: term,
        session: session,
        test1_score: 18,
        test2_score: 16,
        exam_score: 55,
        total_score: 89,
        grade: 'A',
        position: 1,
        supervisor_id: '1',
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    return { data: mockScores, error: null };
  },

  // Session and term helpers
  getCurrentSession: async () => {
    const mockSession: AcademicSession = {
      id: '1',
      name: '2024/2025',
      start_date: '2024-09-01',
      end_date: '2025-07-31',
      is_current: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return { data: mockSession, error: null };
  },

  getCurrentTerm: async () => {
    const mockTerm: Term = {
      id: '1',
      session_id: '1',
      name: 'First Term',
      start_date: '2024-09-01',
      end_date: '2024-12-20',
      is_current: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return { data: mockTerm, error: null };
  },

  getAllSessions: async () => {
    const mockSessions: AcademicSession[] = [
      {
        id: '1',
        name: '2024/2025',
        start_date: '2024-09-01',
        end_date: '2025-07-31',
        is_current: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    return { data: mockSessions, error: null };
  },

  getSessionTerms: async (sessionId: string) => {
    const mockTerms: Term[] = [
      {
        id: '1',
        session_id: sessionId,
        name: 'First Term',
        start_date: '2024-09-01',
        end_date: '2024-12-20',
        is_current: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        session_id: sessionId,
        name: 'Second Term',
        start_date: '2025-01-15',
        end_date: '2025-04-10',
        is_current: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        session_id: sessionId,
        name: 'Third Term',
        start_date: '2025-04-15',
        end_date: '2025-07-31',
        is_current: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    return { data: mockTerms, error: null };
  },

  // School configuration helper
  getSchoolConfig: async () => {
    const mockConfig: SchoolConfig = {
      id: '1',
      school_name: 'Graceland Royal Academy',
      school_address: '123 Education Street, Academic City',
      school_phone: '+234-xxx-xxx-xxxx',
      school_email: 'info@gra.edu',
      current_session: '2024/2025',
      current_term: 'First Term',
      school_logo_url: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return { data: mockConfig, error: null };
  }
};

// Export all helper functions individually as well
export {
  insertRecord as insert,
  updateRecord as update,
  deleteRecord as remove,
  fetchRecords as fetch
};