import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  Clock, 
  BarChart3 
} from 'lucide-react';

interface StatCardsProps {
  stats: {
    totalStudents: number;
    totalResults: number;
    approvedResults: number;
    pendingResults: number;
    completionRate: number;
  };
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Students</p>
              <p className="text-lg font-semibold">{stats.totalStudents}</p>
            </div>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Results</p>
              <p className="text-lg font-semibold">{stats.totalResults}</p>
            </div>
            <FileText className="h-4 w-4 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-lg font-semibold">{stats.approvedResults}</p>
            </div>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold">{stats.pendingResults}</p>
            </div>
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Completion</p>
              <p className="text-lg font-semibold">{stats.completionRate}%</p>
            </div>
            <BarChart3 className="h-4 w-4 text-indigo-600" />
          </div>
          <Progress value={stats.completionRate} className="mt-2 h-1" />
        </CardContent>
      </Card>
    </div>
  );
}