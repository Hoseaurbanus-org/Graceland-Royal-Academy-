import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabaseHelpers, SchoolConfig } from '../lib/supabase';

interface SessionContextType {
  currentSession: string;
  currentTerm: 'First Term' | 'Second Term' | 'Third Term';
  schoolConfig: SchoolConfig | null;
  setCurrentSession: (session: string) => void;
  setCurrentTerm: (term: 'First Term' | 'Second Term' | 'Third Term') => void;
  refreshConfig: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [currentSession, setCurrentSession] = useState('2024/2025');
  const [currentTerm, setCurrentTerm] = useState<'First Term' | 'Second Term' | 'Third Term'>('First Term');
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig | null>(null);

  const refreshConfig = async () => {
    try {
      const { data, error } = await supabaseHelpers.getSchoolConfig();
      if (data && !error) {
        setSchoolConfig(data);
        setCurrentSession(data.current_session);
        setCurrentTerm(data.current_term);
      }
    } catch (error) {
      console.error('Error loading school config:', error);
    }
  };

  useEffect(() => {
    refreshConfig();
  }, []);

  const value = {
    currentSession,
    currentTerm,
    schoolConfig,
    setCurrentSession,
    setCurrentTerm,
    refreshConfig,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}