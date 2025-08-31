import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  MessageSquare,
  Heart,
  Brain,
  Users,
  Zap,
  Shield,
  Star,
  Target,
  Award,
  Plus,
  Edit,
  Save,
  Search,
  Filter,
  FileText,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner@2.0.3';

interface AffectiveRemark {
  id: string;
  student_id: string;
  session: string;
  term: string;
  punctuality: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';
  attendance: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';
  neatness: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';
  politeness: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';
  honesty: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';
  leadership: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';
  cooperation: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';
  sports: 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';
  created_at: string;
  updated_at: string;
}

interface StudentRemark {
  id: string;
  student_id: string;
  session: string;
  term: string;
  class_teacher_remark: string;
  principal_remark: string;
  next_term_begins: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const affectiveRatingScale = [
  { value: 'Excellent', color: 'text-green-600 bg-green-50', score: 5 },
  { value: 'Very Good', color: 'text-blue-600 bg-blue-50', score: 4 },
  { value: 'Good', color: 'text-yellow-600 bg-yellow-50', score: 3 },
  { value: 'Fair', color: 'text-orange-600 bg-orange-50', score: 2 },
  { value: 'Poor', color: 'text-red-600 bg-red-50', score: 1 }
];

const affectiveTraits = [
  { key: 'punctuality', label: 'Punctuality', icon: CheckCircle },
  { key: 'attendance', label: 'Attendance', icon: Users },
  { key: 'neatness', label: 'Neatness', icon: Star },
  { key: 'politeness', label: 'Politeness', icon: Heart },
  { key: 'honesty', label: 'Honesty', icon: Shield },
  { key: 'leadership', label: 'Leadership', icon: Target },
  { key: 'cooperation', label: 'Cooperation', icon: Users },
  { key: 'sports', label: 'Sports & Games', icon: Zap }
];

function RemarksSystem() {
  const { 
    user,
    students, 
    classes, 
    currentSession, 
    currentTerm,
    getStudentsByClass 
  } = useAuth();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('affective');
  const [remarkDialog, setRemarkDialog] = useState(false);
  const [affectiveDialog, setAffectiveDialog] = useState(false);

  // Local state for remarks data
  const [affectiveRemarks, setAffectiveRemarks] = useState<AffectiveRemark[]>([]);
  const [studentRemarks, setStudentRemarks] = useState<StudentRemark[]>([]);

  // Form states
  const [affectiveForm, setAffectiveForm] = useState<Partial<AffectiveRemark>>({});
  const [remarkForm, setRemarkForm] = useState<Partial<StudentRemark>>({});

  // Load data from localStorage
  useEffect(() => {
    const loadedAffective = JSON.parse(localStorage.getItem('gra_affective_remarks') || '[]');
    const loadedRemarks = JSON.parse(localStorage.getItem('gra_student_remarks') || '[]');
    setAffectiveRemarks(loadedAffective);
    setStudentRemarks(loadedRemarks);
  }, []);

  // Save data to localStorage
  const saveAffectiveRemarks = (data: AffectiveRemark[]) => {
    setAffectiveRemarks(data);
    localStorage.setItem('gra_affective_remarks', JSON.stringify(data));
  };

  const saveStudentRemarks = (data: StudentRemark[]) => {
    setStudentRemarks(data);
    localStorage.setItem('gra_student_remarks', JSON.stringify(data));
  };

  // Get class students
  const classStudents = selectedClass 
    ? (typeof getStudentsByClass === 'function' 
       ? getStudentsByClass(selectedClass) 
       : students.filter(s => s.class_id === selectedClass && s.is_active))
    : [];

  // Filter students based on search
  const filteredStudents = classStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get existing remarks for a student
  const getStudentAffectiveRemark = (studentId: string) => {
    return affectiveRemarks.find(r => 
      r.student_id === studentId && 
      r.session === currentSession && 
      r.term === currentTerm
    );
  };

  const getStudentRemark = (studentId: string) => {
    return studentRemarks.find(r => 
      r.student_id === studentId && 
      r.session === currentSession && 
      r.term === currentTerm
    );
  };

  // Handle affective remark submission
  const handleAffectiveSubmit = async () => {
    if (!selectedStudent || !affectiveForm.punctuality) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const existingIndex = affectiveRemarks.findIndex(r => 
        r.student_id === selectedStudent && 
        r.session === currentSession && 
        r.term === currentTerm
      );

      const remarkData: AffectiveRemark = {
        id: existingIndex >= 0 ? affectiveRemarks[existingIndex].id : `affective-${Date.now()}`,
        student_id: selectedStudent,
        session: currentSession,
        term: currentTerm,
        punctuality: affectiveForm.punctuality as any,
        attendance: affectiveForm.attendance as any,
        neatness: affectiveForm.neatness as any,
        politeness: affectiveForm.politeness as any,
        honesty: affectiveForm.honesty as any,
        leadership: affectiveForm.leadership as any,
        cooperation: affectiveForm.cooperation as any,
        sports: affectiveForm.sports as any,
        created_at: existingIndex >= 0 ? affectiveRemarks[existingIndex].created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let updatedRemarks;
      if (existingIndex >= 0) {
        updatedRemarks = [...affectiveRemarks];
        updatedRemarks[existingIndex] = remarkData;
      } else {
        updatedRemarks = [...affectiveRemarks, remarkData];
      }

      saveAffectiveRemarks(updatedRemarks);
      setAffectiveDialog(false);
      setAffectiveForm({});
      toast.success('Affective assessment saved successfully');
    } catch (error) {
      toast.error('Failed to save affective assessment');
    }
  };

  // Handle student remark submission
  const handleRemarkSubmit = async () => {
    if (!selectedStudent || !remarkForm.class_teacher_remark) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const existingIndex = studentRemarks.findIndex(r => 
        r.student_id === selectedStudent && 
        r.session === currentSession && 
        r.term === currentTerm
      );

      const remarkData: StudentRemark = {
        id: existingIndex >= 0 ? studentRemarks[existingIndex].id : `remark-${Date.now()}`,
        student_id: selectedStudent,
        session: currentSession,
        term: currentTerm,
        class_teacher_remark: remarkForm.class_teacher_remark || '',
        principal_remark: remarkForm.principal_remark || '',
        next_term_begins: remarkForm.next_term_begins || '',
        created_by: user?.id || '',
        created_at: existingIndex >= 0 ? studentRemarks[existingIndex].created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let updatedRemarks;
      if (existingIndex >= 0) {
        updatedRemarks = [...studentRemarks];
        updatedRemarks[existingIndex] = remarkData;
      } else {
        updatedRemarks = [...studentRemarks, remarkData];
      }

      saveStudentRemarks(updatedRemarks);
      setRemarkDialog(false);
      setRemarkForm({});
      toast.success('Student remark saved successfully');
    } catch (error) {
      toast.error('Failed to save student remark');
    }
  };

  // Calculate affective score
  const calculateAffectiveScore = (remark: AffectiveRemark) => {
    const traits = [
      remark.punctuality, remark.attendance, remark.neatness, remark.politeness,
      remark.honesty, remark.leadership, remark.cooperation, remark.sports
    ];

    const totalScore = traits.reduce((sum, trait) => {
      const rating = affectiveRatingScale.find(r => r.value === trait);
      return sum + (rating?.score || 0);
    }, 0);

    const maxScore = traits.length * 5;
    return Math.round((totalScore / maxScore) * 100);
  };

  // Open affective dialog
  const openAffectiveDialog = (studentId: string) => {
    setSelectedStudent(studentId);
    const existingRemark = getStudentAffectiveRemark(studentId);
    if (existingRemark) {
      setAffectiveForm(existingRemark);
    } else {
      setAffectiveForm({});
    }
    setAffectiveDialog(true);
  };

  // Open remark dialog
  const openRemarkDialog = (studentId: string) => {
    setSelectedStudent(studentId);
    const existingRemark = getStudentRemark(studentId);
    if (existingRemark) {
      setRemarkForm(existingRemark);
    } else {
      setRemarkForm({});
    }
    setRemarkDialog(true);
  };

  const getRatingColor = (rating: string) => {
    const scale = affectiveRatingScale.find(r => r.value === rating);
    return scale?.color || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary">Remarks & Affective Assessment</h2>
          <p className="text-muted-foreground">Record student behavior, character traits, and academic remarks</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Class and Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Class *</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.filter(c => c.is_active).map(classItem => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name} - {classItem.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Search Students</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search by name or admission no."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClass && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="affective">Affective Assessment</TabsTrigger>
            <TabsTrigger value="remarks">Academic Remarks</TabsTrigger>
          </TabsList>

          {/* Affective Assessment */}
          <TabsContent value="affective">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Student Affective Assessment
                </CardTitle>
                <CardDescription>
                  Evaluate student character traits and behavior patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Adm. No.</TableHead>
                        <TableHead className="text-center">Assessment Status</TableHead>
                        <TableHead className="text-center">Overall Score</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => {
                        const affectiveRemark = getStudentAffectiveRemark(student.id);
                        const score = affectiveRemark ? calculateAffectiveScore(affectiveRemark) : null;
                        
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.admission_number}</TableCell>
                            <TableCell className="text-center">
                              {affectiveRemark ? (
                                <Badge className="bg-green-50 text-green-600">
                                  Completed
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {score ? (
                                <div className="flex items-center justify-center gap-2">
                                  <span className="font-bold">{score}%</span>
                                  {score >= 80 && <Star className="h-4 w-4 text-yellow-500" />}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                variant={affectiveRemark ? "outline" : "default"}
                                onClick={() => openAffectiveDialog(student.id)}
                              >
                                {affectiveRemark ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                {affectiveRemark ? 'Edit' : 'Assess'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredStudents.length === 0 && (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No students found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Remarks */}
          <TabsContent value="remarks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  Academic Remarks & Comments
                </CardTitle>
                <CardDescription>
                  Add teacher and principal remarks for each student
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Adm. No.</TableHead>
                        <TableHead>Teacher Remark</TableHead>
                        <TableHead>Principal Remark</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => {
                        const remark = getStudentRemark(student.id);
                        
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.admission_number}</TableCell>
                            <TableCell className="max-w-xs">
                              {remark?.class_teacher_remark ? (
                                <p className="truncate">{remark.class_teacher_remark}</p>
                              ) : (
                                <span className="text-muted-foreground">No remark</span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              {remark?.principal_remark ? (
                                <p className="truncate">{remark.principal_remark}</p>
                              ) : (
                                <span className="text-muted-foreground">No remark</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {remark ? (
                                <Badge className="bg-green-50 text-green-600">
                                  Completed
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                variant={remark ? "outline" : "default"}
                                onClick={() => openRemarkDialog(student.id)}
                              >
                                {remark ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                {remark ? 'Edit' : 'Add'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!selectedClass && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a class to view students and add remarks</p>
          </CardContent>
        </Card>
      )}

      {/* Affective Assessment Dialog */}
      <Dialog open={affectiveDialog} onOpenChange={setAffectiveDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Affective Assessment</DialogTitle>
            <DialogDescription>
              Rate the student's character traits and behavior patterns
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6">
            {affectiveTraits.map(trait => {
              const Icon = trait.icon;
              return (
                <div key={trait.key} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {trait.label}
                  </Label>
                  <Select 
                    value={affectiveForm[trait.key as keyof AffectiveRemark] as string || ''} 
                    onValueChange={(value) => setAffectiveForm({ ...affectiveForm, [trait.key]: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {affectiveRatingScale.map(rating => (
                        <SelectItem key={rating.value} value={rating.value}>
                          <div className="flex items-center gap-2">
                            <span>{rating.value}</span>
                            <Badge className={rating.color}>
                              {rating.score}/5
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setAffectiveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAffectiveSubmit}>
              <Save className="h-4 w-4 mr-2" />
              Save Assessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Remark Dialog */}
      <Dialog open={remarkDialog} onOpenChange={setRemarkDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Academic Remarks</DialogTitle>
            <DialogDescription>
              Add teacher and principal remarks for the student
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="teacherRemark">Class Teacher's Remark *</Label>
              <Textarea
                id="teacherRemark"
                placeholder="Enter class teacher's remark about the student's academic performance..."
                value={remarkForm.class_teacher_remark || ''}
                onChange={(e) => setRemarkForm({ ...remarkForm, class_teacher_remark: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="principalRemark">Principal's Remark</Label>
              <Textarea
                id="principalRemark"
                placeholder="Enter principal's remark..."
                value={remarkForm.principal_remark || ''}
                onChange={(e) => setRemarkForm({ ...remarkForm, principal_remark: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="nextTerm">Next Term Begins</Label>
              <Input
                id="nextTerm"
                type="date"
                value={remarkForm.next_term_begins || ''}
                onChange={(e) => setRemarkForm({ ...remarkForm, next_term_begins: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setRemarkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRemarkSubmit}>
              <Save className="h-4 w-4 mr-2" />
              Save Remark
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RemarksSystem;