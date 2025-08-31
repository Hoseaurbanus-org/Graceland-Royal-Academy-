import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { Search, Users, User } from 'lucide-react';
import { SEARCH_PLACEHOLDERS, MESSAGES } from './class-supervisor-constants';

interface StudentListProps {
  students: any[];
  resultsByStudent: Record<string, { student: any; results: any[] }>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function StudentList({ 
  students, 
  resultsByStudent, 
  searchTerm, 
  onSearchChange 
}: StudentListProps) {
  const filteredStudents = students.filter(student =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-base">Class Students</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder={SEARCH_PLACEHOLDERS.STUDENTS}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-muted-foreground mb-2">
              {students.length === 0 ? MESSAGES.NO_STUDENTS : 'No students match your search'}
            </p>
            {students.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Students will appear here once they are registered for this class
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Details</TableHead>
                  <TableHead>Parent Contact</TableHead>
                  <TableHead>Results Status</TableHead>
                  <TableHead>Registration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const studentResults = resultsByStudent[student.studentId]?.results || [];
                  const approvedCount = studentResults.filter(r => r.isApproved).length;
                  const totalCount = studentResults.length;

                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{student.fullName}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            ID: {student.studentId}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            DOB: {new Date(student.dateOfBirth).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{student.parentName}</div>
                          <div className="text-xs text-muted-foreground">{student.parentEmail}</div>
                          <div className="text-xs text-muted-foreground">{student.parentPhone}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {totalCount} results
                            </Badge>
                            {approvedCount > 0 && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                {approvedCount} approved
                              </Badge>
                            )}
                          </div>
                          {student.canViewResult ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                              Can view results
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">
                              No result access
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {new Date(student.registrationDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {student.academicSession}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}