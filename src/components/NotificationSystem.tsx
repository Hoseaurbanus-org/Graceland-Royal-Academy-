import React, { useEffect, useState, forwardRef, useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from './AuthContext';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Bell,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationItemProps {
  notification: any;
  onClose: () => void;
  onAction?: () => void;
}

const NotificationItem = forwardRef<HTMLDivElement, NotificationItemProps>(
  ({ notification, onClose, onAction }, ref) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      // Auto-dismiss after 4 seconds for better UX
      timeoutRef.current = setTimeout(() => {
        onClose();
      }, 4000);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [onClose]);

    const getIcon = (type: string) => {
      switch (type) {
        case 'success':
          return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'error':
          return <AlertCircle className="h-5 w-5 text-red-600" />;
        case 'warning':
          return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
        case 'info':
        default:
          return <Info className="h-5 w-5 text-blue-600" />;
      }
    };

    const getBorderColor = (type: string) => {
      switch (type) {
        case 'success':
          return 'border-green-200 bg-green-50';
        case 'error':
          return 'border-red-200 bg-red-50';
        case 'warning':
          return 'border-yellow-200 bg-yellow-50';
        case 'info':
        default:
          return 'border-blue-200 bg-blue-50';
      }
    };

    return (
      <div ref={ref} className="w-full max-w-md">
        <Alert className={`relative ${getBorderColor(notification.type)} shadow-lg border-2`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 pt-0.5">
              {getIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <AlertTitle className="text-sm font-semibold mb-1">
                {notification.title}
              </AlertTitle>
              <AlertDescription className="text-sm text-gray-700">
                {notification.message}
              </AlertDescription>
              
              {/* Action button if provided */}
              {notification.action && (
                <Button
                  onClick={() => {
                    notification.action.onClick();
                    onAction?.();
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-2 h-7 text-xs"
                >
                  {notification.action.label}
                </Button>
              )}
            </div>

            {/* Close button */}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="flex-shrink-0 h-6 w-6 p-0 hover:bg-white/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress bar for auto-dismiss */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 4, ease: "linear" }}
          />
        </Alert>
      </div>
    );
  }
);

NotificationItem.displayName = "NotificationItem";

export function NotificationSystem() {
  const { notifications, markNotificationAsRead, clearAllNotifications } = useAuth();
  const [displayedNotifications, setDisplayedNotifications] = useState<any[]>([]);
  const [processedIds, setProcessedIds] = useState(new Set<string>());

  // Update displayed notifications when new ones arrive, ensuring uniqueness
  useEffect(() => {
    const unread = notifications
      .filter(n => !n.isRead && !processedIds.has(n.id))
      .slice(0, 3); // Show max 3 at once
    
    if (unread.length > 0) {
      setDisplayedNotifications(prev => {
        // Remove any notifications that are no longer in the unread list
        const currentIds = new Set(unread.map(n => n.id));
        const filtered = prev.filter(n => currentIds.has(n.id));
        
        // Add new notifications that aren't already displayed
        const existingIds = new Set(filtered.map(n => n.id));
        const newNotifications = unread.filter(n => !existingIds.has(n.id));
        
        return [...filtered, ...newNotifications];
      });
      
      // Track processed IDs to prevent duplicates
      setProcessedIds(prev => {
        const newSet = new Set(prev);
        unread.forEach(n => newSet.add(n.id));
        return newSet;
      });
    } else {
      // Clear displayed notifications if no unread ones
      setDisplayedNotifications([]);
    }
  }, [notifications, processedIds]);

  const handleCloseNotification = (id: string) => {
    markNotificationAsRead(id);
    setDisplayedNotifications(prev => prev.filter(n => n.id !== id));
    
    // Clean up processed IDs periodically to prevent memory bloat
    setProcessedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleActionComplete = (id: string) => {
    markNotificationAsRead(id);
    setDisplayedNotifications(prev => prev.filter(n => n.id !== id));
    
    setProcessedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleClearAll = () => {
    clearAllNotifications();
    setDisplayedNotifications([]);
    setProcessedIds(new Set());
  };

  if (displayedNotifications.length === 0) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 pointer-events-none" />
      
      {/* Notification Container */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="space-y-3 w-full max-w-md pointer-events-auto">
          <AnimatePresence mode="popLayout">
            {displayedNotifications.map((notification) => (
              <motion.div
                key={`notification-${notification.id}-${notification.timestamp}`} // Ensure unique keys
                initial={{ opacity: 0, y: -50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                layout
              >
                <NotificationItem
                  notification={notification}
                  onClose={() => handleCloseNotification(notification.id)}
                  onAction={() => handleActionComplete(notification.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Clear all button if multiple notifications */}
          {displayedNotifications.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center pt-2"
            >
              <Button
                onClick={handleClearAll}
                variant="outline"
                size="sm"
                className="bg-white/90 backdrop-blur-sm text-xs"
              >
                Clear All ({displayedNotifications.length})
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

// Notification Bell Component for Header/Navigation
export function NotificationBell() {
  const { notifications, getUnreadNotifications } = useAuth();
  const unreadCount = getUnreadNotifications().length;

  if (unreadCount === 0) {
    return null;
  }

  return (
    <div className="relative">
      <Bell className="h-5 w-5 text-gray-600" />
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2"
        >
          <Badge 
            variant="destructive" 
            className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        </motion.div>
      )}
    </div>
  );
}

// Hook for programmatic notifications
export function useNotification() {
  const { addNotification } = useAuth();

  const showNotification = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    action?: { label: string; onClick: () => void }
  ) => {
    addNotification({
      type,
      title,
      message,
      action
    });
  };

  return {
    success: (title: string, message: string, action?: { label: string; onClick: () => void }) => 
      showNotification('success', title, message, action),
    error: (title: string, message: string, action?: { label: string; onClick: () => void }) => 
      showNotification('error', title, message, action),
    warning: (title: string, message: string, action?: { label: string; onClick: () => void }) => 
      showNotification('warning', title, message, action),
    info: (title: string, message: string, action?: { label: string; onClick: () => void }) => 
      showNotification('info', title, message, action)
  };
}