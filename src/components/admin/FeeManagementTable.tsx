import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Edit } from 'lucide-react';
import { formatCurrency, getClassStudents } from './accountant-utils';

interface FeeManagementTableProps {
  classes: any[];
  students: any[];
  selectedTerm: string;
  setSelectedTerm: (term: string) => void;
  getFeeStructureForClass: (className: string, term: string) => any;
  onEditFeeStructure: (className: string, term: string) => void;
}

export function FeeManagementTable({
  classes,
  students,
  selectedTerm,
  setSelectedTerm,
  getFeeStructureForClass,
  onEditFeeStructure
}: FeeManagementTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Fee Structure Management</CardTitle>
        <div className="flex gap-4">
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="First Term">First Term</SelectItem>
              <SelectItem value="Second Term">Second Term</SelectItem>
              <SelectItem value="Third Term">Third Term</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Class</TableHead>
                <TableHead className="text-xs">Level</TableHead>
                <TableHead className="text-xs">Students</TableHead>
                <TableHead className="text-xs">Current Fee</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Last Updated</TableHead>
                <TableHead className="text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.filter(c => c.isActive).map(classData => {
                const feeStructure = getFeeStructureForClass(classData.name, selectedTerm);
                const classStudents = getClassStudents(students, classData.name);
                
                return (
                  <TableRow key={classData.id}>
                    <TableCell className="text-sm font-medium">{classData.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {classData.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{classStudents.length}</TableCell>
                    <TableCell>
                      {feeStructure ? (
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(feeStructure.total)}
                        </div>
                      ) : (
                        <span className="text-sm text-orange-600">Not set</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {feeStructure ? (
                        <div className="text-xs text-muted-foreground">
                          {new Date(feeStructure.lastUpdated).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditFeeStructure(classData.name, selectedTerm)}
                        className="text-xs"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        {feeStructure ? 'Edit' : 'Set'}
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
  );
}