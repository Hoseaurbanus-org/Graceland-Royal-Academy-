import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Eye, EyeOff, Search } from 'lucide-react';
import { filterStudents } from './accountant-utils';

interface StudentAccessControlProps {
  students: any[];
  classes: any[];
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onToggleStudentAccess: (studentId: string, canViewResult: boolean) => void;
}

export function StudentAccessControl({
  students,
  classes,
  selectedClass,
  setSelectedClass,
  searchTerm,
  setSearchTerm,
  onToggleStudentAccess
}: StudentAccessControlProps) {
  const filteredStudents = filterStudents(students, selectedClass, searchTerm);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Individual Student Result Access Control</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.filter(c => c.isActive).map(classData => (
                <SelectItem key={classData.id} value={classData.name}>
                  {classData.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Student Details</TableHead>
                <TableHead className="text-xs">Class</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Parent</TableHead>
                <TableHead className="text-xs">Result Access</TableHead>
                <TableHead className="text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                    No students found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map(student => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{student.fullName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{student.studentId}</div>
                        {/* Mobile: Show parent info here */}
                        <div className="sm:hidden text-xs text-muted-foreground">
                          {student.parentName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{student.class}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="space-y-1">
                        <div className="text-sm">{student.parentName}</div>
                        <div className="text-xs text-muted-foreground">{student.parentEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {student.canViewResult ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">
                          {student.canViewResult ? 'Allowed' : 'Blocked'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={student.canViewResult}
                        onCheckedChange={(checked) => onToggleStudentAccess(student.studentId, checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}