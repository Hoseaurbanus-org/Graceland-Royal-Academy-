import React, { useState, useEffect } from 'react';
import { X, Info, AlertTriangle, CheckCircle, XCircle, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { supabase, subscribeToTable, markNotificationAsRead, isSupabaseConnected } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  target_role?: string;
  target_user_id?: string;
  is_global: boolean;
  is_read: boolean;
  created_by?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NotificationBarProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const NotificationBar: React.FC<NotificationBarProps> = ({ notification, onDismiss }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`border-l-4 p-4 mb-2 rounded-r-lg ${getBackgroundColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1">
            <h4 className="font-medium">{notification.title}</h4>
            <p className="mt-1 text-sm">{notification.message}</p>
            <p className="mt-1 text-xs opacity-75">
              {new Date(notification.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDismiss(notification.id)}
          className="ml-4 h-8 w-8 p-0 hover:bg-white/50"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export const GlobalNotificationBar: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(false);

  useEffect(() => {
    checkSupabaseConnection();
    loadNotifications();
  }, [user]);

  const checkSupabaseConnection = async () => {
    const connected = await isSupabaseConnected();
    setIsSupabaseAvailable(connected);
    
    if (!connected) {
      // Load from localStorage if Supabase is not available
      loadLocalNotifications();
    }
  };

  const loadLocalNotifications = () => {
    try {
      const localNotifications = localStorage.getItem('graceland_notifications');
      if (localNotifications) {
        const parsed = JSON.parse(localNotifications);
        setNotifications(parsed);
        updateUnreadCount(parsed);
      }
    } catch (error) {
      console.error('Error loading local notifications:', error);
    }
  };

  const saveToLocalStorage = (notificationList: Notification[]) => {
    try {
      localStorage.setItem('graceland_notifications', JSON.stringify(notificationList));
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  };

  const loadNotifications = async () => {
    if (!user || !isSupabaseAvailable) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`target_role.eq.${user.role},target_user_id.eq.${user.id},is_global.eq.true`)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      if (data) {
        setNotifications(data);
        updateUnreadCount(data);
        
        // Subscribe to real-time updates
        const channel = subscribeToTable('notifications', (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as Notification;
            if (shouldShowNotification(newNotification)) {
              setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
              updateUnreadCount([newNotification, ...notifications]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotification = payload.new as Notification;
            setNotifications(prev => 
              prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
            );
          }
        });

        return () => {
          supabase.removeChannel(channel);
        };
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const shouldShowNotification = (notification: Notification): boolean => {
    if (!user) return false;
    
    return (
      notification.is_global ||
      notification.target_role === user.role ||
      notification.target_user_id === user.id
    );
  };

  const updateUnreadCount = (notificationList: Notification[]) => {
    const unread = notificationList.filter(n => !n.is_read).length;
    setUnreadCount(unread);
  };

  const handleDismiss = async (notificationId: string) => {
    if (isSupabaseAvailable && user) {
      await markNotificationAsRead(notificationId, user.id);
    }
    
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, is_read: true } : n
    );
    setNotifications(updatedNotifications);
    updateUnreadCount(updatedNotifications);
    
    if (!isSupabaseAvailable) {
      saveToLocalStorage(updatedNotifications);
    }
  };

  const handleToggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const activeNotifications = notifications.filter(n => 
    !n.is_read && 
    (!n.expires_at || new Date(n.expires_at) > new Date())
  );

  if (!user) return null;

  return (
    <>
      {/* Notification Bell */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={handleToggleVisibility}
          variant="outline"
          size="sm"
          className="relative bg-navy hover:bg-navy/80 text-white border-gold shadow-lg"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-gold text-navy text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Notification Panel */}
      {isVisible && (
        <div className="fixed top-16 right-4 w-96 max-h-96 bg-white border border-gray-200 rounded-lg shadow-xl z-40 overflow-hidden">
          <div className="bg-navy text-white px-4 py-3 border-b border-gold">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleVisibility}
                className="text-white hover:bg-navy/80 h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {activeNotifications.length > 0 ? (
              <div className="p-2">
                {activeNotifications.map((notification) => (
                  <NotificationBar
                    key={notification.id}
                    notification={notification}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No new notifications</p>
              </div>
            )}
          </div>
          
          {!isSupabaseAvailable && (
            <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-2 text-xs text-yellow-800">
              <div className="flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Demo Mode - Using local storage</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global notification bars at the top */}
      {activeNotifications.slice(0, 3).map((notification) => (
        <div key={`global-${notification.id}`} className="fixed top-0 left-0 right-0 z-30">
          <NotificationBar
            notification={notification}
            onDismiss={handleDismiss}
          />
        </div>
      ))}
    </>
  );
};

export default GlobalNotificationBar;