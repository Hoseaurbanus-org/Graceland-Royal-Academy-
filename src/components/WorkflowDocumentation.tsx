import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Users, 
  Upload, 
  Calculator, 
  Download, 
  BarChart3, 
  Shield, 
  Calendar,
  FileText,
  CheckCircle2,
  ArrowRight,
  Database,
  Bell,
  Printer
} from 'lucide-react';

export function WorkflowDocumentation() {
  const sampleStudentCSV = `student_name,email,roll_number,class,parent_email,date_of_birth,address
Alice Johnson,alice.j@student.graceland.edu,001,Grade 10A,johnson.parent@gmail.com,2008-03-15,123 Oak Street
Bob Smith,bob.s@student.graceland.edu,002,Grade 10A,smith.parent@gmail.com,2008-05-22,456 Pine Avenue
Carol Davis,carol.d@student.graceland.edu,003,Grade 10A,davis.parent@gmail.com,2008-07-10,789 Maple Road`;

  const sampleScoreCSV = `student_name,test1_score,test2_score,exam_score
Alice Johnson,18,17,52
Bob Smith,19,18,54
Carol Davis,16,16,48`;

  const sampleDataset = {
    students: [
      { name: 'Alice Johnson', math: 87, english: 86, science: 84 },
      { name: 'Bob Smith', math: 91, english: 80, science: 86 },
      { name: 'Carol Davis', math: 80, english: 88, science: 89 },
      { name: 'David Wilson', math: 87, english: 91, science: 88 },
      { name: 'Emma Brown', math: 94, english: 90, science: 94 },
      { name: 'Frank Miller', math: 82, english: 85, science: 83 },
      { name: 'Grace Lee', math: 88, english: 87, science: 90 },
      { name: 'Henry Taylor', math: 85, english: 83, science: 86 },
      { name: 'Ivy Chen', math: 92, english: 89, science: 91 },
      { name: 'Jack Brown', math: 89, english: 92, science: 88 }
    ]
  };

  const technologies = {
    frontend: [
      { name: 'React 18', purpose: 'Component-based UI framework with hooks and context' },
      { name: 'TypeScript', purpose: 'Type safety and enhanced development experience' },
      { name: 'Tailwind CSS', purpose: 'Utility-first CSS framework for responsive design' },
      { name: 'Chart.js', purpose: 'Interactive data visualization and charts' },
      { name: 'Radix UI', purpose: 'Accessible, unstyled component library' }
    ],
    backend: [
      { name: 'Node.js', purpose: 'JavaScript runtime for server-side development' },
      { name: 'Express.js', purpose: 'Fast, minimal web framework for APIs' },
      { name: 'Socket.io', purpose: 'Real-time bidirectional event-based communication' },
      { name: 'JWT', purpose: 'Secure token-based authentication' },
      { name: 'Bcrypt', purpose: 'Password hashing and security' }
    ],
    database: [
      { name: 'PostgreSQL', purpose: 'Primary relational database for structured data' },
      { name: 'Redis', purpose: 'In-memory caching and session storage' },
      { name: 'MongoDB', purpose: 'Document storage for flexible data structures' }
    ],
    infrastructure: [
      { name: 'Docker', purpose: 'Containerization for consistent deployments' },
      { name: 'Kubernetes', purpose: 'Container orchestration and scaling' },
      { name: 'AWS/Azure', purpose: 'Cloud infrastructure and services' },
      { name: 'Nginx', purpose: 'Load balancing and reverse proxy' }
    ]
  };

  const workflows = [
    {
      title: 'Student Upload Workflow',
      icon: <Users className="h-5 w-5" />,
      steps: [
        'Admin accesses Student Management section',
        'Click "Upload Students" button',
        'Prepare CSV with required format',
        'Paste CSV data or load sample',
        'System validates data for duplicates and format',
        'Progress bar shows upload status',
        'Students added to database with parent notifications'
      ],
      access: 'Admin Only',
      format: 'student_name,email,roll_number,class,parent_email,date_of_birth,address'
    },
    {
      title: 'Score Input Workflow',
      icon: <Calculator className="h-5 w-5" />,
      steps: [
        'Teacher selects subject and class',
        'Input scores via web form or CSV upload',
        'Real-time validation (Test1: 0-20, Test2: 0-20, Exam: 0-60)',
        'Automatic calculation of Total, Average, Grade, Rank',
        'Changes saved automatically',
        'Results immediately available to students/parents'
      ],
      access: 'Teachers Only',
      format: 'student_name,test1_score,test2_score,exam_score (NO Total column)'
    },
    {
      title: 'Result Compilation',
      icon: <CheckCircle2 className="h-5 w-5" />,
      steps: [
        'System receives score input',
        'Validates score ranges and student existence',
        'Calculates Total = Test1 + Test2 + Exam',
        'Calculates Average = Total ÷ 3',
        'Assigns Grade based on average (A≥80, B≥70, C≥60, D≥50, F<50)',
        'Determines Rank by sorting Total scores',
        'Updates database and triggers notifications'
      ],
      access: 'Automatic',
      format: 'Real-time processing upon score submission'
    },
    {
      title: 'Calendar Management',
      icon: <Calendar className="h-5 w-5" />,
      steps: [
        'Admin accesses Calendar Management',
        'Click "Add Event" to create new calendar entry',
        'Fill event details (title, dates, type, description)',
        'Save event to database',
        'Real-time updates pushed to all users',
        'Staff and parent dashboards reflect changes immediately'
      ],
      access: 'Admin Only',
      format: 'WebSocket-based real-time synchronization'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Complete Workflow Documentation</h2>
        <p className="text-muted-foreground">
          Comprehensive guide to system workflows, sample data, and implementation details
        </p>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="samples">Sample Data</TabsTrigger>
          <TabsTrigger value="technical">Technical Specs</TabsTrigger>
          <TabsTrigger value="security">Security & Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows">
          <div className="space-y-6">
            {workflows.map((workflow, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {workflow.icon}
                    <span className="ml-2">{workflow.title}</span>
                    <Badge variant="outline" className="ml-auto">{workflow.access}</Badge>
                  </CardTitle>
                  <CardDescription>Step-by-step process flow</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workflow.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-start space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                          {stepIndex + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{step}</p>
                        </div>
                        {stepIndex < workflow.steps.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                    
                    <Alert className="mt-4">
                      <AlertDescription>
                        <strong>Format:</strong> {workflow.format}
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="samples">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Upload CSV Format</CardTitle>
                <CardDescription>Required format for bulk student registration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono overflow-x-auto">
{sampleStudentCSV}
                  </pre>
                  <Alert>
                    <AlertDescription>
                      <strong>Required Fields:</strong> student_name, email, roll_number, class, parent_email, date_of_birth, address
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Score Import CSV Format</CardTitle>
                <CardDescription>Format for importing test scores (excludes Total column)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono overflow-x-auto">
{sampleScoreCSV}
                  </pre>
                  <Alert>
                    <AlertDescription>
                      <strong>Important:</strong> Total column is NOT included. System calculates Total, Average, Grade, and Rank automatically.
                      <br />
                      <strong>Score Limits:</strong> Test 1 (0-20), Test 2 (0-20), Exam (0-60)
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sample Dataset (10 Students, 3 Subjects)</CardTitle>
                <CardDescription>Complete sample data for testing and Chart.js visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 border-r">Student Name</th>
                        <th className="text-center p-2 border-r">Mathematics</th>
                        <th className="text-center p-2 border-r">English</th>
                        <th className="text-center p-2">Science</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleDataset.students.map((student, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 border-r font-medium">{student.name}</td>
                          <td className="text-center p-2 border-r">{student.math}%</td>
                          <td className="text-center p-2 border-r">{student.english}%</td>
                          <td className="text-center p-2">{student.science}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round(sampleDataset.students.reduce((sum, s) => sum + s.math, 0) / sampleDataset.students.length)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Math Average</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded">
                    <div className="text-lg font-bold text-red-600">
                      {Math.round(sampleDataset.students.reduce((sum, s) => sum + s.english, 0) / sampleDataset.students.length)}%
                    </div>
                    <p className="text-sm text-muted-foreground">English Average</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">
                      {Math.round(sampleDataset.students.reduce((sum, s) => sum + s.science, 0) / sampleDataset.students.length)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Science Average</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technical">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Technology Stack</CardTitle>
                <CardDescription>Complete technical implementation stack</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(technologies).map(([category, techs]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="font-medium capitalize">{category}</h4>
                      {techs.map((tech, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="font-medium">{tech.name}</div>
                          <p className="text-sm text-muted-foreground">{tech.purpose}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Code Snippets</CardTitle>
                <CardDescription>Essential implementation examples</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Score Calculation Logic</h5>
                    <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
{`// Automatic calculation function
const calculateResults = (test1, test2, exam) => {
  const total = test1 + test2 + exam;
  const average = Math.round((total / 3) * 100) / 100;
  const grade = average >= 80 ? 'A' : 
                average >= 70 ? 'B' : 
                average >= 60 ? 'C' : 
                average >= 50 ? 'D' : 'F';
  return { total, average, grade };
};`}
                    </pre>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">CSV Validation</h5>
                    <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
{`// CSV format validation
const validateCSV = (csvContent) => {
  const lines = csvContent.trim().split('\\n');
  const headers = lines[0].split(',');
  const expectedHeaders = ['student_name', 'test1_score', 'test2_score', 'exam_score'];
  return expectedHeaders.every(h => headers.includes(h));
};`}
                    </pre>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Chart.js Integration</h5>
                    <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
{`// Chart.js bar chart configuration
const chartConfig = {
  type: 'bar',
  data: {
    labels: ['Mathematics', 'English', 'Science'],
    datasets: [{
      label: 'Class Average',
      data: [mathAvg, englishAvg, scienceAvg],
      backgroundColor: ['#3B82F6', '#EF4444', '#10B981']
    }]
  },
  options: {
    responsive: true,
    scales: { y: { beginAtZero: true, max: 100 } }
  }
};`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Implementation
                </CardTitle>
                <CardDescription>Comprehensive security measures and compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2 flex items-center">
                        <Database className="h-4 w-4 mr-2" />
                        Role-Based Access Control
                      </h5>
                      <ul className="text-sm space-y-1">
                        <li>• Admin: Full system access, user management, reports</li>
                        <li>• Teacher: Score input, class management, analytics</li>
                        <li>• Parent: View child's results, notifications</li>
                        <li>• Student: View own results, progress tracking</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Data Protection
                      </h5>
                      <ul className="text-sm space-y-1">
                        <li>• AES-256 encryption for data at rest</li>
                        <li>• TLS 1.3 for data in transit</li>
                        <li>• GDPR compliant data handling</li>
                        <li>• Audit logging for all changes</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2 flex items-center">
                        <Bell className="h-4 w-4 mr-2" />
                        Real-time Features
                      </h5>
                      <ul className="text-sm space-y-1">
                        <li>• WebSocket connections for live updates</li>
                        <li>• Automatic notification delivery</li>
                        <li>• Real-time score calculation</li>
                        <li>• Instant calendar synchronization</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-2 flex items-center">
                        <Printer className="h-4 w-4 mr-2" />
                        Scalability
                      </h5>
                      <ul className="text-sm space-y-1">
                        <li>• Microservices architecture</li>
                        <li>• Horizontal auto-scaling</li>
                        <li>• Load balancing across regions</li>
                        <li>• 99.9% uptime SLA</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Standards</CardTitle>
                <CardDescription>Educational data protection and privacy compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">GDPR Compliance</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>✓ Data minimization principles</li>
                      <li>✓ Consent management system</li>
                      <li>✓ Right to be forgotten</li>
                      <li>✓ Data portability support</li>
                      <li>✓ Breach notification (≤72 hours)</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Educational Standards</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>✓ FERPA compliance (US)</li>
                      <li>✓ COPPA compliance for minors</li>
                      <li>✓ Student data privacy protection</li>
                      <li>✓ Secure parent communication</li>
                      <li>✓ Academic record confidentiality</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Note:</strong> This system implements enterprise-grade security measures suitable for educational institutions. 
                All sensitive operations require proper authentication and authorization. Data is encrypted both at rest and in transit, 
                with comprehensive audit logging for compliance and security monitoring.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}