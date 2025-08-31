import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabaseHelpers, StudentScore, Student, Subject } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useSession } from './SessionContext';

interface ResultContextType {
  studentResults: StudentScore[];
  loading: boolean;
  refreshResults: () => Promise<void>;
  getStudentResults: (studentId: string) => Promise<StudentScore[]>;
  getClassResults: (classId: string) => Promise<StudentScore[]>;
  approveResults: (resultIds: string[], approvedBy: string) => Promise<boolean>;
  submitScore: (scoreData: Partial<StudentScore>) => Promise<boolean>;
}

const ResultContext = createContext<ResultContextType | undefined>(undefined);

export function ResultProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { currentSession, currentTerm } = useSession();
  const [studentResults, setStudentResults] = useState<StudentScore[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshResults = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load results based on user role
      if (user.role === 'admin') {
        // Admin can see all results
        const { data, error } = await supabaseHelpers.getScoresForApproval('', currentSession, currentTerm);
        if (!error && data) {
          setStudentResults(data);
        }
      } else if (user.role === 'supervisor') {
        // Supervisor can see their assigned results
        const { data: assignments } = await supabaseHelpers.getSupervisorAssignments(user.id);
        if (assignments) {
          const allResults: StudentScore[] = [];
          for (const assignment of assignments) {
            const { data: results } = await supabaseHelpers.getScoresForApproval(
              assignment.class_id, 
              currentSession, 
              currentTerm
            );
            if (results) {
              allResults.push(...results);
            }
          }
          setStudentResults(allResults);
        }
      }
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentResults = async (studentId: string): Promise<StudentScore[]> => {
    try {
      const { data, error } = await supabaseHelpers.getStudentScores(studentId, currentSession, currentTerm);
      if (error) {
        console.error('Error loading student results:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error loading student results:', error);
      return [];
    }
  };

  const getClassResults = async (classId: string): Promise<StudentScore[]> => {
    try {
      const { data, error } = await supabaseHelpers.getScoresForApproval(classId, currentSession, currentTerm);
      if (error) {
        console.error('Error loading class results:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error loading class results:', error);
      return [];
    }
  };

  const approveResults = async (resultIds: string[], approvedBy: string): Promise<boolean> => {
    // This would implement the approval logic
    // For now, return true as mock
    console.log('Approving results:', resultIds, 'by:', approvedBy);
    await refreshResults();
    return true;
  };

  const submitScore = async (scoreData: Partial<StudentScore>): Promise<boolean> => {
    // This would implement score submission logic
    // For now, return true as mock
    console.log('Submitting score:', scoreData);
    await refreshResults();
    return true;
  };

  useEffect(() => {
    if (user && currentSession && currentTerm) {
      refreshResults();
    }
  }, [user, currentSession, currentTerm]);

  const value = {
    studentResults,
    loading,
    refreshResults,
    getStudentResults,
    getClassResults,
    approveResults,
    submitScore,
  };

  return (
    <ResultContext.Provider value={value}>
      {children}
    </ResultContext.Provider>
  );
}

export function useResults() {
  const context = useContext(ResultContext);
  if (context === undefined) {
    throw new Error('useResults must be used within a ResultProvider');
  }
  return context;
}