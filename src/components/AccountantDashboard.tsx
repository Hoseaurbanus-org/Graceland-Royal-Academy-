import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Search,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  TrendingDown,
  Calculator
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigation } from './Layout';
import { SchoolLogo } from './SchoolLogo';
import { toast } from 'sonner@2.0.3';

export function AccountantDashboard() {
  const { 
    user,
    students = [],
    payments = [],
    currentSession,
    currentTerm 
  } = useAuth();

  const { currentView } = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current_term');

  // Filter payments based on search and filters
  const filteredPayments = payments.filter(payment => {
    const student = students.find(s => s?.id === payment?.student_id);
    const matchesSearch = !searchTerm || 
      student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment?.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment?.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || payment?.status === selectedStatus;
    
    return matchesSearch && matchesStatus && payment;
  });

  // Calculate statistics
  const stats = {
    totalPayments: payments.length,
    totalAmount: payments
      .filter(p => p?.status === 'completed')
      .reduce((sum, p) => sum + (p?.amount || 0), 0),
    pendingPayments: payments.filter(p => p?.status === 'pending').length,
    completedPayments: payments.filter(p => p?.status === 'completed').length,
    thisMonthAmount: payments
      .filter(p => {
        if (!p?.payment_date) return false;
        const paymentDate = new Date(p.payment_date);
        const now = new Date();
        return paymentDate.getMonth() === now.getMonth() && 
               paymentDate.getFullYear() === now.getFullYear() &&
               p.status === 'completed';
      })
      .reduce((sum, p) => sum + (p?.amount || 0), 0),
    averagePayment: payments.length > 0 
      ? Math.round(payments
          .filter(p => p?.status === 'completed')
          .reduce((sum, p) => sum + (p?.amount || 0), 0) / payments.filter(p => p?.status === 'completed').length)
      : 0
  };

  // Payment breakdown by purpose
  const paymentsByPurpose = payments
    .filter(p => p?.status === 'completed')
    .reduce((acc, payment) => {
      const purpose = payment?.purpose || 'Unknown';
      acc[purpose] = (acc[purpose] || 0) + (payment?.amount || 0);
      return acc;
    }, {} as Record<string, number>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const exportPayments = () => {
    // Create CSV content
    const headers = ['Date', 'Student', 'Purpose', 'Amount', 'Method', 'Reference', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredPayments.map(payment => {
        const student = students.find(s => s?.id === payment?.student_id);
        return [
          payment?.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '',
          student?.name || 'Unknown',
          payment?.purpose || '',
          payment?.amount || 0,
          payment?.payment_method || '',
          payment?.reference || '',
          payment?.status || ''
        ].join(',');
      })
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Payment report exported successfully');
  };

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'payments':
        return (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base sm:text-lg">Payment Management</CardTitle>
                  <CardDescription>View and manage all payment transactions</CardDescription>
                </div>
                <Button onClick={exportPayments} size="sm" className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payments Table */}
              {filteredPayments.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Student</TableHead>
                        <TableHead className="hidden sm:table-cell">Purpose</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="hidden md:table-cell">Method</TableHead>
                        <TableHead className="hidden lg:table-cell">Reference</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment, index) => {
                        if (!payment) return null;
                        const student = students.find(s => s?.id === payment.student_id);
                        return (
                          <motion.tr
                            key={payment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="hover:bg-muted/50"
                          >
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{student?.name || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground sm:hidden">{payment.purpose}</p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{payment.purpose}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(payment.amount || 0)}</TableCell>
                            <TableCell className="hidden md:table-cell capitalize">{payment.payment_method}</TableCell>
                            <TableCell className="hidden lg:table-cell font-mono text-xs">{payment.reference}</TableCell>
                            <TableCell>
                              <Badge className={`text-xs ${getStatusColor(payment.status || 'unknown')}`}>
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm">
                              {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'No date'}
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No payments found</p>
                  <p className="text-sm text-muted-foreground">Adjust your search criteria to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'reports':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>Generate and download financial reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Monthly Revenue Report</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Detailed breakdown of monthly revenue and payment trends
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Generate Report
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <PieChart className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Payment Analysis</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Analysis of payment methods and fee categories
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Generate Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Advanced reporting features with customizable date ranges and filters will be available in the full version.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'accounts':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Student Accounts</CardTitle>
              <CardDescription>Manage student financial accounts and payment history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.filter(s => s?.is_active).map((student) => {
                  const studentPayments = payments.filter(p => p?.student_id === student.id);
                  const totalPaid = studentPayments
                    .filter(p => p?.status === 'completed')
                    .reduce((sum, p) => sum + (p?.amount || 0), 0);
                  
                  return (
                    <div key={student.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">{student.admission_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">{formatCurrency(totalPaid)}</p>
                          <p className="text-xs text-muted-foreground">{studentPayments.length} payments</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {studentPayments.slice(0, 3).map((payment) => (
                          <Badge key={payment.id} variant="outline" className="text-xs">
                            {payment.purpose} - {formatCurrency(payment.amount || 0)}
                          </Badge>
                        ))}
                        {studentPayments.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{studentPayments.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {students.filter(s => s?.is_active).length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No student accounts found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'calendar':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Fee Calendar</CardTitle>
              <CardDescription>Payment schedules and important financial deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-primary/5">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">First Term Fee Payment</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Due: December 15, 2024</p>
                  <Badge variant="outline" className="mt-2">Upcoming</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calculator className="h-5 w-5 text-muted-foreground" />
                    <h4 className="font-medium">Second Term Fee Payment</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Due: April 15, 2025</p>
                  <Badge variant="secondary" className="mt-2">Scheduled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'fees':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fee Structure Management</CardTitle>
                <CardDescription>Configure school fee structures and billing</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertDescription>
                    Fee structure configuration and automated billing features will be available in the full version.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-lg sm:text-2xl font-bold text-green-600">{formatCurrency(stats.totalAmount)}</p>
                      </div>
                      <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">This Month</p>
                        <p className="text-lg sm:text-2xl font-bold text-primary">{formatCurrency(stats.thisMonthAmount)}</p>
                      </div>
                      <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
                        <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.completedPayments}</p>
                      </div>
                      <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
                        <p className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                      </div>
                      <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Recent Payments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Recent Payments</CardTitle>
                  <CardDescription>Latest payment transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {payments.slice(0, 5).map((payment) => {
                      if (!payment) return null;
                      const student = students.find(s => s?.id === payment.student_id);
                      return (
                        <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{student?.name || 'Unknown Student'}</p>
                            <p className="text-xs text-muted-foreground">
                              {payment.purpose} • {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'No date'}
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="font-medium text-sm">{formatCurrency(payment.amount || 0)}</p>
                            <Badge className={`text-xs ${getStatusColor(payment.status || 'unknown')}`}>
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                    {payments.length === 0 && (
                      <div className="text-center py-8">
                        <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No payments recorded yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Payment Breakdown</CardTitle>
                  <CardDescription>Revenue by payment purpose</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(paymentsByPurpose).map(([purpose, amount]) => (
                      <div key={purpose} className="flex items-center justify-between">
                        <span className="text-sm">{purpose}</span>
                        <span className="font-medium">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                    {Object.keys(paymentsByPurpose).length === 0 && (
                      <div className="text-center py-8">
                        <PieChart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No payment data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <p className="text-xs sm:text-sm text-muted-foreground">Average Payment</p>
                  <p className="text-lg sm:text-xl font-bold text-primary">{formatCurrency(stats.averagePayment)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Students</p>
                  <p className="text-lg sm:text-xl font-bold text-primary">{students.filter(s => s?.is_active).length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <p className="text-xs sm:text-sm text-muted-foreground">Payment Rate</p>
                  <p className="text-lg sm:text-xl font-bold text-primary">
                    {students.length > 0 ? Math.round((stats.completedPayments / students.length) * 100) : 0}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <p className="text-xs sm:text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">
                    {payments.length > 0 ? Math.round((stats.completedPayments / payments.length) * 100) : 0}%
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="hidden sm:block">
            <SchoolLogo size="md" />
          </div>
          <div className="sm:hidden">
            <SchoolLogo size="sm" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Accountant Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Financial Management & Payment Processing</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">{currentSession || '2024/2025'}</Badge>
          <Badge variant="secondary" className="text-xs">{currentTerm || 'First Term'}</Badge>
        </div>
      </div>

      {/* Dynamic Content */}
      {renderContent()}
    </div>
  );
}