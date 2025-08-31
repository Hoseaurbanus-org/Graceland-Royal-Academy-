import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  User, 
  BookOpen, 
  DollarSign, 
  Bell,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  FileText,
  Award
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { SchoolLogoWatermark } from './SchoolLogoWatermark';
import { LogoutButton } from './LogoutButton';
import { CalendarWidget } from './CalendarWidget';
import { EnhancedFeePaymentSystem } from './parent/EnhancedFeePaymentSystem';
import { motion } from 'motion/react';

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  class_level: string;
  current_average: number;
  attendance_rate: number;
  fee_status: 'paid' | 'partial' | 'unpaid';
  result_access: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  date: string;
  read: boolean;
}

export const EnhancedParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParentData();
  }, [user]);

  const loadParentData = async () => {
    try {
      // Load demo data for parent
      const demoStudents: Student[] = [
        {
          id: '1',
          student_id: 'GRA20241001',
          full_name: 'John Doe Jr.',
          class_level: 'JSS 1A',
          current_average: 85.5,
          attendance_rate: 92,
          fee_status: 'paid',
          result_access: true
        },
        {
          id: '2',
          student_id: 'GRA20241002',
          full_name: 'Jane Doe',
          class_level: 'JSS 2A', 
          current_average: 78.3,
          attendance_rate: 88,
          fee_status: 'partial',
          result_access: false
        }
      ];

      const demoNotifications: Notification[] = [
        {
          id: '1',
          title: 'Fee Payment Reminder',
          message: 'Second term fees are now due. Please complete payment to maintain result access.',
          type: 'warning',
          date: '2024-01-15',
          read: false
        },
        {
          id: '2',
          title: 'Parent-Teacher Conference',
          message: 'Parent-teacher conference scheduled for next week. Please confirm attendance.',
          type: 'info',
          date: '2024-01-14',
          read: false
        },
        {
          id: '3',
          title: 'Outstanding Performance',
          message: 'John Doe Jr. has been selected for the Mathematics Olympiad team!',
          type: 'success',
          date: '2024-01-13',
          read: true
        }
      ];

      setStudents(demoStudents);
      setNotifications(demoNotifications);
    } catch (error) {
      console.error('Error loading parent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Fully Paid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Partial Payment</Badge>;
      case 'unpaid':
        return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getGradeColor = (average: number) => {
    if (average >= 80) return 'text-green-600';
    if (average >= 70) return 'text-blue-600';
    if (average >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <SchoolLogoWatermark />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-navy to-blue-700 text-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Parent Portal</h1>
              <p className="text-blue-100 mt-1">
                Welcome, {user?.full_name || 'Parent'}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className="bg-white/20 text-white border-white/30">
                  WISDOM & ILLUMINATION
                </Badge>
                <Badge className="bg-gold text-navy">
                  Graceland Royal Academy
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <CalendarWidget />
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-6 bg-white shadow-sm">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-navy data-[state=active]:text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="payments"
              className="data-[state=active]:bg-navy data-[state=active]:text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Fee Payments
            </TabsTrigger>
            <TabsTrigger 
              value="results"
              className="data-[state=active]:bg-navy data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
            <TabsTrigger 
              value="notifications"
              className="data-[state=active]:bg-navy data-[state=active]:text-white"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              {notifications.filter(n => !n.read).length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs px-1">
                  {notifications.filter(n => !n.read).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Student Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {students.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden shadow-lg">
                    <div className="bg-gradient-to-r from-navy/10 to-gold/10 p-1">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-navy">{student.full_name}</CardTitle>
                            <p className="text-gray-600">{student.student_id} • {student.class_level}</p>
                          </div>
                          {getStatusBadge(student.fee_status)}
                        </div>
                      </CardHeader>
                    </div>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">Current Average</p>
                          <p className={`text-2xl font-bold ${getGradeColor(student.current_average)}`}>
                            {student.current_average.toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600">Attendance</p>
                          <p className="text-2xl font-bold text-green-600">
                            {student.attendance_rate}%
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Academic Progress</span>
                          <span>{student.current_average.toFixed(0)}%</span>
                        </div>
                        <Progress value={student.current_average} className="h-2" />
                      </div>

                      {!student.result_access && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Complete fee payment to access detailed results and reports.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-navy hover:bg-navy/80"
                          disabled={!student.result_access}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          View Results
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1 text-gold border-gold hover:bg-gold hover:text-white"
                        >
                          <Award className="w-3 h-3 mr-1" />
                          Progress Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-navy">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button 
                    className="h-20 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    onClick={() => setActiveTab('payments')}
                  >
                    <div className="text-center">
                      <CreditCard className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-sm">Make Payment</p>
                    </div>
                  </Button>
                  <Button 
                    className="h-20 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    onClick={() => setActiveTab('results')}
                  >
                    <div className="text-center">
                      <FileText className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-sm">View Results</p>
                    </div>
                  </Button>
                  <Button 
                    className="h-20 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                    onClick={() => setActiveTab('notifications')}
                  >
                    <div className="text-center">
                      <Bell className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-sm">Notifications</p>
                      {notifications.filter(n => !n.read).length > 0 && (
                        <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs">
                          {notifications.filter(n => !n.read).length}
                        </Badge>
                      )}
                    </div>
                  </Button>
                  <Button 
                    className="h-20 bg-gradient-to-br from-gold to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-navy"
                  >
                    <div className="text-center">
                      <Calendar className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-sm">School Calendar</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <EnhancedFeePaymentSystem />
          </TabsContent>

          <TabsContent value="results">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-navy">Student Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium">{student.full_name}</h3>
                          <p className="text-gray-600">{student.class_level}</p>
                        </div>
                        {student.result_access ? (
                          <Button className="bg-navy hover:bg-navy/80">
                            <FileText className="w-4 h-4 mr-2" />
                            Download Result
                          </Button>
                        ) : (
                          <div className="text-center">
                            <Alert className="mb-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Complete fee payment to access results
                              </AlertDescription>
                            </Alert>
                            <Button 
                              variant="outline" 
                              className="text-gold border-gold hover:bg-gold hover:text-white"
                              onClick={() => setActiveTab('payments')}
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Make Payment
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {student.result_access && (
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-600 mb-2">Current Term Performance:</p>
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Average</p>
                              <p className={`text-lg font-bold ${getGradeColor(student.current_average)}`}>
                                {student.current_average.toFixed(1)}%
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Position</p>
                              <p className="text-lg font-bold text-navy">5th</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Grade</p>
                              <p className="text-lg font-bold text-green-600">B+</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-navy">Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all ${
                        notification.type === 'success' 
                          ? 'bg-green-50 border-green-400' 
                          : notification.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-400'
                          : 'bg-blue-50 border-blue-400'
                      } ${!notification.read ? 'shadow-md' : 'opacity-75'}`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {notification.type === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : notification.type === 'warning' ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        ) : (
                          <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <Badge className="bg-red-100 text-red-800 text-xs">New</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};