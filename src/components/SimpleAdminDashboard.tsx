import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Users, 
  School, 
  BookOpen, 
  FileText,
  Settings,
  BarChart3,
  Database,
  Shield
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { SchoolLogo } from './SchoolLogo';

export function SimpleAdminDashboard() {
  const { user, currentSession, currentTerm } = useAuth();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SchoolLogo size="md" />
          <div>
            <h1>Admin Dashboard</h1>
            <p className="text-muted-foreground">School Management System</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{currentSession || '2024/2025'}</Badge>
          <Badge variant="secondary">{currentTerm || 'First Term'}</Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p>150</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Classes</p>
                <p>8</p>
              </div>
              <School className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Subjects</p>
                <p>12</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Staff</p>
                <p>25</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student Management
            </CardTitle>
            <CardDescription>
              Manage student records and enrollment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Manage Students</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Results Management
            </CardTitle>
            <CardDescription>
              Review and approve academic results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">View Results</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription>
              View performance analytics and reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">View Analytics</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>
              Configure school settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Backup and restore school data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Manage Data</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage user access and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Security Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SimpleAdminDashboard;