import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { useSession } from './SessionContext';
import { 
  User, 
  Award, 
  BookOpen, 
  Calendar,
  Mail,
  Phone,
  Download,
  Bell,
  Clock,
  TrendingUp
} from 'lucide-react';

interface ChildData {
  id: string;
  name: string;
  class: string;
  rollNumber: string;
  termScores: {
    [term: string]: {
      [subject: string]: {
        test1?: number;
        test2?: number;
        endOfTermExam?: number;
        termAverage: number;
      };
    };
  };
  attendance: number;
  rank: number;
  totalStudents: number;
}

export function ParentDashboard() {
  const { sessionSettings } = useSession();

  // Simulated payment status and receipt for each child
  const [payments, setPayments] = useState(() => ([
    { childId: '1', status: 'paid', amount: 50000, receiptUrl: '/receipts/receipt1.pdf', term: '1st Term', session: '2024/2025' },
    { childId: '2', status: 'pending', amount: 50000, receiptUrl: '', term: '1st Term', session: '2024/2025' }
  ]));

  const handlePayFees = (childId: string) => {
    // Simulate payment process
    setPayments(prev => prev.map(p => p.childId === childId ? { ...p, status: 'paid', receiptUrl: '/receipts/receipt_' + childId + '.pdf' } : p));
    alert('Payment successful! Receipt will be available for download.');
  };

  const getPayment = (childId: string) => payments.find(p => p.childId === childId && p.term === sessionSettings.currentTerm && p.session === sessionSettings.academicYear);

  const [children] = useState<ChildData[]>([
    {
      id: '1',
      name: 'Emma Wilson',
      class: 'Grade 10A',
      rollNumber: '005',
      termScores: {
        '1st Term': {
          'Mathematics': { test1: 95, test2: 92, endOfTermExam: 94, termAverage: 94 },
          'English Language': { test1: 89, test2: 91, endOfTermExam: 90, termAverage: 90 },
          'Science': { test1: 93, test2: 95, endOfTermExam: 94, termAverage: 94 },
          'Social Studies': { test1: 91, test2: 88, endOfTermExam: 90, termAverage: 90 }
        },
        '2nd Term': {
          'Mathematics': { test1: 96, test2: 97, termAverage: 96.6 },
          'English Language': { test1: 92, test2: 88, termAverage: 90 },
          'Science': { test1: 95, test2: 91, termAverage: 93 },
          'Social Studies': { test1: 92, test2: 93, termAverage: 92.5 }
        },
        '3rd Term': {
          'Mathematics': { termAverage: 0 },
          'English Language': { termAverage: 0 },
          'Science': { termAverage: 0 },
          'Social Studies': { termAverage: 0 }
        }
      },
      attendance: 96.5,
      rank: 1,
      totalStudents: 32
    },
    {
      id: '2',
      name: 'John Wilson',
      class: 'Grade 8B',
      rollNumber: '012',
      termScores: {
        '1st Term': {
          'Mathematics': { test1: 88, test2: 85, endOfTermExam: 87, termAverage: 87 },
          'English Language': { test1: 91, test2: 89, endOfTermExam: 90, termAverage: 90 },
          'Science': { test1: 86, test2: 88, endOfTermExam: 87, termAverage: 87 },
          'Social Studies': { test1: 89, test2: 87, endOfTermExam: 88, termAverage: 88 }
        },
        '2nd Term': {
          'Mathematics': { test1: 90, test2: 87, termAverage: 88.5 },
          'English Language': { test1: 93, test2: 91, termAverage: 92 },
          'Science': { test1: 89, test2: 90, termAverage: 89.5 },
          'Social Studies': { test1: 91, test2: 88, termAverage: 89.5 }
        },
        '3rd Term': {
          'Mathematics': { termAverage: 0 },
          'English Language': { termAverage: 0 },
          'Science': { termAverage: 0 },
          'Social Studies': { termAverage: 0 }
        }
      },
      attendance: 94.2,
      rank: 3,
      totalStudents: 35
    }
  ]);

  const [selectedChild, setSelectedChild] = useState(children[0]);

  const calculateOverallAverage = (child: ChildData, term: string) => {
    const termData = child.termScores[term];
    if (!termData) return 0;
    
    const averages = Object.values(termData).map(subject => subject.termAverage).filter(avg => avg > 0);
    if (averages.length === 0) return 0;
    
    return Math.round(averages.reduce((sum, avg) => sum + avg, 0) / averages.length);
  };

  const getCurrentTermData = (child: ChildData) => {
    return child.termScores[sessionSettings.currentTerm] || {};
  };

  const [announcements] = useState([
    {
      id: 1,
      title: `${sessionSettings.currentTerm} Results Available`,
      date: '2024-02-15',
      message: `Academic results for ${sessionSettings.currentTerm} are now published in your dashboard.`
    },
    {
      id: 2,
      title: 'Parent-Teacher Conference',
      date: '2024-02-20',
      message: 'Individual meetings scheduled for discussing term progress.'
    },
    {
      id: 3,
      title: 'School Sports Day',
      date: '2024-02-25',
      message: 'Annual sports competition. Students should report by 8:00 AM.'
    }
  ]);

  const currentTermAverage = calculateOverallAverage(selectedChild, sessionSettings.currentTerm);
  const currentTermData = getCurrentTermData(selectedChild);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Parent Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your children's academic progress - {sessionSettings.currentTerm} ({sessionSettings.academicYear})
          </p>
        </div>
        <Button>
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </Button>
      </div>

      {/* Child Selector */}
      <div className="flex space-x-4 mb-8">
        {children.map((child) => (
          <Card 
            key={child.id}
            className={`cursor-pointer transition-all ${selectedChild.id === child.id ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedChild(child)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">{child.name}</h4>
                  <p className="text-sm text-muted-foreground">{child.class}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fee Payment & Receipt Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Fee Payment & Receipt</CardTitle>
          <CardDescription>Pay school fees and download receipts for each child</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {children.map(child => {
              const payment = getPayment(child.id);
              return (
                <Card key={child.id} className="flex-1 border p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">{child.name}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm text-muted-foreground">Term: {sessionSettings.currentTerm}, Session: {sessionSettings.academicYear}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm">Amount: <span className="font-bold">₦{payment?.amount?.toLocaleString() || 'N/A'}</span></span>
                  </div>
                  <div className="mb-2">
                    <Badge variant={payment?.status === 'paid' ? 'default' : 'destructive'}>
                      {payment?.status === 'paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {payment?.status !== 'paid' && (
                      <Button size="sm" onClick={() => handlePayFees(child.id)}>
                        Pay Fees
                      </Button>
                    )}
                    {payment?.status === 'paid' && payment.receiptUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={payment.receiptUrl} download target="_blank">Download Receipt</a>
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats for Selected Child */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{sessionSettings.currentTerm} Average</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentTermAverage}%</div>
            <p className="text-xs text-muted-foreground">
              {currentTermAverage >= 90 ? 'Excellent' : currentTermAverage >= 80 ? 'Very Good' : currentTermAverage >= 70 ? 'Good' : 'Needs Improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Rank</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedChild.rank}</div>
            <p className="text-xs text-muted-foreground">out of {selectedChild.totalStudents} students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedChild.attendance}%</div>
            <p className="text-xs text-muted-foreground">Above average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Term</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionSettings.currentTerm}</div>
            <p className="text-xs text-muted-foreground">Roll: {selectedChild.rollNumber}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList>
          <TabsTrigger value="results">Current Term Results</TabsTrigger>
          <TabsTrigger value="progress">Term Comparison</TabsTrigger>
          <TabsTrigger value="announcements">School Updates</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{selectedChild.name} - {sessionSettings.currentTerm} Results</CardTitle>
                <CardDescription>Subject-wise performance breakdown for current term</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(currentTermData).map(([subject, scores]) => {
                    const s = scores as any;
                    return (
                      <div key={subject}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{subject}</span>
                          <Badge variant="default">{s.termAverage}%</Badge>
                        </div>
                        <Progress value={s.termAverage} className="h-2 mb-2" />
                        {/* Assessment breakdown */}
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div className="text-center">
                            <div>Test 1</div>
                            <div className="font-medium">{s.test1 || '--'}</div>
                          </div>
                          <div className="text-center">
                            <div>Test 2</div>
                            <div className="font-medium">{s.test2 || '--'}</div>
                          </div>
                          <div className="text-center">
                            <div>Term Exam</div>
                            <div className="font-medium">{s.endOfTermExam || '--'}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report Card
                  </Button>
                  <Button variant="outline">View Detailed Analysis</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{sessionSettings.currentTerm} Performance Summary</CardTitle>
                <CardDescription>Overall academic standing for current term</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {currentTermAverage}%
                    </div>
                    <p className="text-green-700">{sessionSettings.currentTerm} Average</p>
                    <Badge className="mt-2" variant="default">
                      {currentTermAverage >= 90 ? 'Grade A' : currentTermAverage >= 80 ? 'Grade B' : currentTermAverage >= 70 ? 'Grade C' : 'Grade D'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(currentTermData).length > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span>Strongest Subject:</span>
                          <span className="font-medium">
                            {Object.entries(currentTermData).reduce((best, [subject, scores]) => 
                              scores.termAverage > (currentTermData[best]?.termAverage || 0) ? subject : best
                            , Object.keys(currentTermData)[0])}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Areas for Focus:</span>
                          <span className="font-medium">
                            {Object.entries(currentTermData).reduce((lowest, [subject, scores]) => 
                              scores.termAverage < (currentTermData[lowest]?.termAverage || 100) && scores.termAverage > 0 ? subject : lowest
                            , Object.keys(currentTermData)[0])}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span>Class Position:</span>
                      <span className="font-medium">{selectedChild.rank} of {selectedChild.totalStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Attendance Rate:</span>
                      <span className="font-medium">{selectedChild.attendance}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Academic Progress Across Terms</CardTitle>
              <CardDescription>Compare your child's performance across different terms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['1st Term', '2nd Term', '3rd Term'].map((term) => {
                  const termAvg = calculateOverallAverage(selectedChild, term);
                  const isCurrentTerm = term === sessionSettings.currentTerm;
                  
                  return (
                    <div key={term} className={`p-4 border rounded-lg ${isCurrentTerm ? 'border-blue-500 bg-blue-50' : ''}`}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{term}</h4>
                          {isCurrentTerm && <Badge variant="default">Current</Badge>}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Average:</span>
                          <Badge variant={termAvg >= 80 ? "default" : "secondary"}>
                            {termAvg > 0 ? `${termAvg}%` : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      
                      {termAvg > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {Object.entries(selectedChild.termScores[term]).map(([subject, scores]) => (
                            <div key={subject} className="text-center p-2 bg-white rounded border">
                              <div className="text-xs text-muted-foreground truncate">{subject}</div>
                              <div className="font-medium">{(scores as any).termAverage}%</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {isCurrentTerm ? 'Assessment in progress' : 'Results not yet available'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements">
          <Card>
            <CardHeader>
              <CardTitle>School Announcements</CardTitle>
              <CardDescription>Latest updates and important notices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{announcement.title}</h4>
                      <span className="text-xs text-muted-foreground">{announcement.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{announcement.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Class Teacher</CardTitle>
                <CardDescription>Reach out to your child's supervisor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Mary Johnson</h4>
                      <p className="text-sm text-muted-foreground">Class Supervisor - {selectedChild.class}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>School Administration</CardTitle>
                <CardDescription>Contact school office for general inquiries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">info@gracelandroyal.edu</span>
                  </div>
                  
                  <div className="pt-4">
                    <h5 className="font-medium mb-2">Office Hours</h5>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Monday - Friday: 8:00 AM - 4:00 PM</div>
                      <div>Saturday: 9:00 AM - 1:00 PM</div>
                      <div>Sunday: Closed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}