import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { motion } from 'motion/react';
import { LogOut, User, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { toast } from 'sonner@2.0.3';

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  showText?: boolean;
  className?: string;
}

export function LogoutButton({ 
  variant = 'outline', 
  size = 'default', 
  showText = true, 
  className = '' 
}: LogoutButtonProps) {
  const { user, signOut } = useAuth();
  const { addNotification } = useNotifications();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await signOut();
      
      // Add a farewell notification
      toast.success('Successfully logged out');
      addNotification({
        type: 'info',
        title: 'Logged Out',
        message: 'You have been successfully logged out of Graceland Royal Academy system',
        autoHide: true
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'supervisor': return 'Supervisor';
      case 'accountant': return 'Accountant';
      case 'parent': return 'Parent';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'supervisor': return <User className="h-4 w-4 text-green-600" />;
      case 'accountant': return <User className="h-4 w-4 text-purple-600" />;
      case 'parent': return <User className="h-4 w-4 text-orange-600" />;
      default: return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`${className} transition-all duration-200 hover:scale-105`}
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
          {showText && <span className="ml-2">Logout</span>}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-destructive" />
            Confirm Logout
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to logout from Graceland Royal Academy?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current User Info */}
          <div className="bg-muted/50 rounded-lg p-4 border">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                {getRoleIcon(user.role)}
              </div>
              <div className="flex-1">
                <p className="font-medium">{user.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{user.email}</span>
                  <span>•</span>
                  <span>{getRoleLabel(user.role)}</span>
                </div>
                {user.last_login && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last login: {new Date(user.last_login).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notice:</strong> You will be redirected to the login page. Make sure to save any unsaved work before logging out.
            </AlertDescription>
          </Alert>

          {/* Session Info */}
          <div className="text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Session started:</span>
              <span>{user.last_login ? new Date(user.last_login).toLocaleString() : 'Unknown'}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Current time:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="min-w-[100px]"
            >
              {isLoggingOut ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Alternative compact logout button for tight spaces
export function CompactLogoutButton({ className = '' }: { className?: string }) {
  return (
    <LogoutButton 
      variant="ghost" 
      size="sm" 
      showText={false} 
      className={`w-8 h-8 p-0 hover:bg-destructive/10 hover:text-destructive ${className}`}
    />
  );
}

// Header logout button with user info
export function HeaderLogoutButton() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="flex items-center space-x-3">
      <div className="hidden sm:block text-right">
        <p className="text-sm font-medium">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
      <LogoutButton 
        variant="outline" 
        size="sm" 
        showText={false}
        className="flex-shrink-0"
      />
    </div>
  );
}