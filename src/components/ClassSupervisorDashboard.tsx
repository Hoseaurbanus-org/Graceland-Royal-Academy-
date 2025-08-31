import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Users, 
  GraduationCap,
  School
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useCalendar } from './CalendarContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { StatCards } from './supervisor/StatCards';
import { StudentList } from './supervisor/StudentList';
import { ResultApprovalTable } from './supervisor/ResultApprovalTable';
import { 
  TAB_CONFIG, 
  MESSAGES,
  PERMISSIONS 
} from './supervisor/class-supervisor-constants';
import { 
  calculateStats,
  groupResultsByStudent,
  filterResults,
  getUniqueSubjects,
  validateResultSelection,
  getPendingResults
} from './supervisor/class-supervisor-utils';
import schoolLogo from 'figma:asset/fb26b4b240c171a6f425a75dbfc39e0ff4799694.png';

export function ClassSupervisorDashboard() {
  const { 
    user, 
    students, 
    resultRecords, 
    subjects,
    getStudentsByClass,
    getResultsByClass,
    approveResults,
    getClassesByStaff,
    addNotification
  } = useAuth();
  
  const { currentSession, currentTerm } = useCalendar();
  
  const [activeTab, setActiveTab] = useState(TAB_CONFIG.OVERVIEW);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [selectedResults, setSelectedResults] = useState<string[]>([]);

  // Get allocated classes for current supervisor
  const allocatedClasses = user ? getClassesByStaff(user.id) : [];

  // Set default class if only one class is allocated
  useEffect(() => {
    if (allocatedClasses.length === 1 && !selectedClass) {
      setSelectedClass(allocatedClasses[0].name);
    }
  }, [allocatedClasses, selectedClass]);

  // Get data for selected class
  const classStudents = selectedClass ? getStudentsByClass(selectedClass) : [];
  const classResults = selectedClass ? getResultsByClass(
    selectedClass, 
    currentSession?.name, 
    currentTerm?.name
  ) : [];

  // Process data
  const resultsByStudent = groupResultsByStudent(classResults, classStudents);
  const filteredResults = filterResults(classResults, searchTerm, filterSubject);
  const classSubjects = getUniqueSubjects(classResults, subjects);
  const stats = calculateStats(classStudents, classResults, resultsByStudent);

  const handleApproveSelected = async () => {
    if (!validateResultSelection(selectedResults)) {
      addNotification({
        type: 'warning',
        title: 'No Selection',
        message: MESSAGES.NO_SELECTION
      });
      return;
    }

    try {
      await approveResults(selectedResults, user?.id || '');
      setSelectedResults([]);
      
      addNotification({
        type: 'success',
        title: 'Results Approved',
        message: `Successfully approved ${selectedResults.length} result records.`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Approval Failed',
        message: MESSAGES.APPROVAL_ERROR
      });
    }
  };

  const handleSelectAll = () => {
    const pendingResults = getPendingResults(filteredResults);
    const pendingIds = pendingResults.map(r => r.id);
    
    if (selectedResults.length === pendingIds.length) {
      setSelectedResults([]);
    } else {
      setSelectedResults(pendingIds);
    }
  };

  const handleSelectResult = (resultId: string, checked: boolean) => {
    if (checked) {
      setSelectedResults(prev => [...prev, resultId]);
    } else {
      setSelectedResults(prev => prev.filter(id => id !== resultId));
    }
  };

  return (
    <div className="space-y-4 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <ImageWithFallback 
              src={schoolLogo} 
              alt="Graceland Royal Academy"
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
            />
            <div>
              <h1 className="text-lg sm:text-xl font-semibold">Class Supervisor Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Student & Result Management • {currentTerm?.name} - {currentSession?.name}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
            <GraduationCap className="h-3 w-3 mr-1" />
            Class Supervisor
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {allocatedClasses.length} Classes
          </Badge>
        </div>
      </div>

      {/* Class Selection */}
      {allocatedClasses.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Select Class:</label>
              <div className="flex gap-2">
                {allocatedClasses.map(classData => (
                  <button
                    key={classData.id}
                    onClick={() => setSelectedClass(classData.name)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      selectedClass === classData.name
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {classData.name}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Classes State */}
      {allocatedClasses.length === 0 && (
        <Alert>
          <School className="h-4 w-4" />
          <AlertDescription>
            {MESSAGES.NO_CLASSES}. Contact your administrator to get class assignments.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      {selectedClass && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-10">
            <TabsTrigger value={TAB_CONFIG.OVERVIEW} className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value={TAB_CONFIG.STUDENT_MANAGEMENT} className="text-xs">Students</TabsTrigger>
            <TabsTrigger value={TAB_CONFIG.RESULT_APPROVAL} className="text-xs">Results</TabsTrigger>
          </TabsList>

          <TabsContent value={TAB_CONFIG.OVERVIEW} className="space-y-4">
            {/* Stats Cards */}
            <StatCards stats={stats} />

            {/* Class Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Class Overview - {selectedClass}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Total Students</p>
                        <p className="text-xl font-semibold text-blue-700">{stats.totalStudents}</p>
                      </div>
                      <Users className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm text-purple-600">Subjects Covered</p>
                      <p className="text-xl font-semibold text-purple-700">{classSubjects.length}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-green-600">Approved Results</p>
                      <p className="text-xl font-semibold text-green-700">{stats.approvedResults}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-sm text-orange-600">Pending Approval</p>
                      <p className="text-xl font-semibold text-orange-700">{stats.pendingResults}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Recent Submissions</h4>
                  <div className="space-y-2">
                    {classResults
                      .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
                      .slice(0, 5)
                      .map(result => (
                        <div key={result.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="text-sm">
                            <span className="font-medium">{result.studentName}</span>
                            <span className="text-muted-foreground ml-2">- {result.subjectName}</span>
                          </div>
                          <Badge className={result.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {result.isApproved ? 'Approved' : 'Pending'}
                          </Badge>
                        </div>
                      ))}
                    {classResults.length === 0 && (
                      <p className="text-sm text-muted-foreground">No submissions yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value={TAB_CONFIG.STUDENT_MANAGEMENT} className="space-y-4">
            <StudentList
              students={classStudents}
              resultsByStudent={resultsByStudent}
              searchTerm={studentSearchTerm}
              onSearchChange={setStudentSearchTerm}
            />
          </TabsContent>

          <TabsContent value={TAB_CONFIG.RESULT_APPROVAL} className="space-y-4">
            <ResultApprovalTable
              results={filteredResults}
              subjects={classSubjects}
              searchTerm={searchTerm}
              filterSubject={filterSubject}
              selectedResults={selectedResults}
              onSearchChange={setSearchTerm}
              onFilterChange={setFilterSubject}
              onSelectResult={handleSelectResult}
              onSelectAll={handleSelectAll}
              onApproveSelected={handleApproveSelected}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}