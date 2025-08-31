import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, BarChart3, Users } from 'lucide-react';

export function PerformanceChart() {
  // Sample data for the chart
  const subjectData = [
    { subject: 'Mathematics', average: 78, trend: 'up', students: 25 },
    { subject: 'English Language', average: 82, trend: 'up', students: 25 },
    { subject: 'Science', average: 75, trend: 'down', students: 25 },
    { subject: 'Social Studies', average: 80, trend: 'up', students: 25 }
  ];

  const termComparison = [
    { term: '1st Term', average: 76 },
    { term: '2nd Term', average: 79 },
    { term: '3rd Term', average: 82 }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Class Performance Analytics
          </CardTitle>
          <CardDescription>
            Visual representation of student performance across subjects and terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Subject Performance Chart */}
          <div className="space-y-4">
            <h4 className="font-medium">Subject Performance Overview</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjectData.map((subject, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium">{subject.subject}</h5>
                    <div className="flex items-center space-x-1">
                      {subject.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ${subject.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {subject.trend === 'up' ? '+2%' : '-1%'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Class Average</span>
                      <span className="font-medium">{subject.average}%</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          subject.average >= 80 ? 'bg-green-500' : 
                          subject.average >= 70 ? 'bg-blue-500' : 
                          subject.average >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${subject.average}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {subject.students} students
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {subject.average >= 80 ? 'Excellent' : 
                         subject.average >= 70 ? 'Good' : 
                         subject.average >= 60 ? 'Fair' : 'Needs Improvement'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Term Comparison */}
          <div className="mt-8 space-y-4">
            <h4 className="font-medium">Term-over-Term Progress</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {termComparison.map((term, index) => (
                <div key={index} className="p-4 border rounded-lg text-center">
                  <h5 className="font-medium mb-2">{term.term}</h5>
                  <div className="text-2xl font-bold text-primary mb-1">
                    {term.average}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Class Average
                  </div>
                  {index > 0 && (
                    <div className={`text-xs mt-2 ${
                      term.average > termComparison[index - 1].average ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {term.average > termComparison[index - 1].average ? '+' : ''}
                      {(term.average - termComparison[index - 1].average).toFixed(1)}% from previous term
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="mt-8">
            <h4 className="font-medium mb-4">Performance Trend Chart</h4>
            <div className="h-64 border rounded-lg flex items-center justify-center bg-gray-50">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Chart.js visualization would be rendered here</p>
                <p className="text-sm">Interactive charts showing detailed performance trends</p>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h5 className="font-medium text-green-800 mb-2">Strengths</h5>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• English Language shows consistent improvement</li>
                <li>• Mathematics performance above school average</li>
                <li>• Overall upward trend across most subjects</li>
              </ul>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h5 className="font-medium text-orange-800 mb-2">Areas for Focus</h5>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Science requires additional attention</li>
                <li>• Consider supplementary classes for struggling students</li>
                <li>• Review teaching methodologies for better engagement</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}