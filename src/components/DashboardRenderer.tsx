import React from 'react';
import { AdminDashboard } from './AdminDashboard';
import { SupervisorDashboard } from './SupervisorDashboard';
import { AccountantDashboard } from './AccountantDashboard';
import { ParentDashboard } from './ParentDashboard';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Shield } from 'lucide-react';

interface DashboardRendererProps {
  user: {
    id: string;
    role: string;
    email: string;
    name?: string;
    isNewUser?: boolean;
  };
}

export function DashboardRenderer({ user }: DashboardRendererProps) {
  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'supervisor':
        return <SupervisorDashboard />;
      case 'accountant':
        return <AccountantDashboard />;
      case 'parent':
        return <ParentDashboard />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="mb-2">Access Restricted</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your account role is not recognized. Please contact the administrator for assistance.
                </p>
                <Badge variant="outline">{user.role || 'Unknown Role'}</Badge>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      {renderDashboard()}
    </div>
  );
}

export default DashboardRenderer;