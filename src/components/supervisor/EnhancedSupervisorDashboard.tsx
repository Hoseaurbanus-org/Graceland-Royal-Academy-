import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  BookOpen, 
  School, 
  Users, 
  FileText,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { SchoolLogo } from '../SchoolLogo';

function EnhancedSupervisorDashboard() {
  const { user, currentSession, currentTerm } = useAuth();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SchoolLogo size="md" />
          <div>
            <h1>Supervisor Dashboard</h1>
            <p className="text-muted-foreground">Result Entry & Management System</p>
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
                <p className="text-sm text-muted-foreground">Classes</p>
                <p>2</p>
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
                <p>3</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p>45</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Results</p>
                <p>23</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Result Entry System
          </CardTitle>
          <CardDescription>
            Record test scores and exam results for your assigned classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3>Select Class and Subject</h3>
            <p className="text-muted-foreground mb-4">
              Choose a class and subject to begin entering results
            </p>
            <Button>Get Started</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EnhancedSupervisorDashboard;