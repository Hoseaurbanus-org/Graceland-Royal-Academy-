import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConnected } from '../lib/supabase';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_type: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface CalendarContextType {
  events: CalendarEvent[];
  loading: boolean;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  refreshEvents: () => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshEvents = async () => {
    // Check connection status asynchronously
    const connected = await isSupabaseConnected();
    
    if (!connected) {
      // Provide mock events when not connected
      setEvents([
        {
          id: '1',
          title: 'First Term Begins',
          description: 'Start of the academic term',
          event_date: '2024-09-15',
          event_type: 'academic',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Mid-Term Break',
          description: 'One week break',
          event_date: '2024-11-01',
          event_type: 'break',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'First Term Ends',
          description: 'End of first academic term',
          event_date: '2024-12-15',
          event_type: 'academic',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Error loading events:', error);
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    const connected = await isSupabaseConnected();
    
    if (!connected) {
      // Mock add for demo
      const newEvent: CalendarEvent = {
        ...eventData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setEvents(prev => [...prev, newEvent].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()));
      return true;
    }

    try {
      const { error } = await supabase
        .from('calendar_events')
        .insert([eventData]);

      if (error) {
        console.error('Error adding event:', error);
        return false;
      }

      await refreshEvents();
      return true;
    } catch (error) {
      console.error('Error adding event:', error);
      return false;
    }
  };

  const updateEvent = async (id: string, eventData: Partial<CalendarEvent>): Promise<boolean> => {
    const connected = await isSupabaseConnected();
    
    if (!connected) {
      // Mock update for demo
      setEvents(prev => prev.map(event => 
        event.id === id 
          ? { ...event, ...eventData, updated_at: new Date().toISOString() }
          : event
      ));
      return true;
    }

    try {
      const { error } = await supabase
        .from('calendar_events')
        .update(eventData)
        .eq('id', id);

      if (error) {
        console.error('Error updating event:', error);
        return false;
      }

      await refreshEvents();
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      return false;
    }
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    const connected = await isSupabaseConnected();
    
    if (!connected) {
      // Mock delete for demo
      setEvents(prev => prev.filter(event => event.id !== id));
      return true;
    }

    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting event:', error);
        return false;
      }

      await refreshEvents();
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  };

  useEffect(() => {
    refreshEvents();
  }, []);

  const value = {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}