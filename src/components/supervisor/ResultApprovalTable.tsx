import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  FileText,
  AlertTriangle 
} from 'lucide-react';
import { 
  SEARCH_PLACEHOLDERS, 
  MESSAGES,
  PERMISSIONS 
} from './class-supervisor-constants';
import { 
  getGradeColor, 
  getResultStatusColor, 
  formatDate 
} from './class-supervisor-utils';

interface ResultApprovalTableProps {
  results: any[];
  subjects: any[];
  searchTerm: string;
  filterSubject: string;
  selectedResults: string[];
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onSelectResult: (resultId: string, checked: boolean) => void;
  onSelectAll: () => void;
  onApproveSelected: () => void;
}

export function ResultApprovalTable({
  results,
  subjects,
  searchTerm,
  filterSubject,
  selectedResults,
  onSearchChange,
  onFilterChange,
  onSelectResult,
  onSelectAll,
  onApproveSelected
}: ResultApprovalTableProps) {
  const pendingResults = results.filter(r => !r.isApproved);
  const hasResults = results.length > 0;
  const hasPendingResults = pendingResults.length > 0;
  const allPendingSelected = pendingResults.length > 0 && 
    pendingResults.every(r => selectedResults.includes(r.id));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-base">Result Approval</CardTitle>
            {PERMISSIONS.CAN_APPROVE_RESULTS && hasPendingResults && (
              <Button 
                onClick={onApproveSelected}
                disabled={selectedResults.length === 0}
                className="w-full sm:w-auto"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve Selected ({selectedResults.length})
              </Button>
            )}
          </div>

          {hasResults && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder={SEARCH_PLACEHOLDERS.RESULTS}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-full sm:w-48">
                <Select value={filterSubject} onValueChange={onFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {!hasResults ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-muted-foreground mb-2">{MESSAGES.NO_RESULTS}</p>
            <p className="text-sm text-muted-foreground">
              Results will appear here once teachers submit student scores
            </p>
          </div>
        ) : results.length === 0 ? (
          <Alert>
            <Search className="h-4 w-4" />
            <AlertDescription>
              No results match your search criteria. Try adjusting your filters.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {/* Bulk Actions */}
            {PERMISSIONS.CAN_APPROVE_RESULTS && hasPendingResults && (
              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                <Checkbox
                  checked={allPendingSelected}
                  onCheckedChange={onSelectAll}
                />
                <span className="text-sm">
                  Select all pending results ({pendingResults.length})
                </span>
              </div>
            )}

            {/* Results Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {PERMISSIONS.CAN_APPROVE_RESULTS && (
                      <TableHead className="w-12">
                        <span className="sr-only">Select</span>
                      </TableHead>
                    )}
                    <TableHead>Student</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Scores</TableHead>
                    <TableHead>Total & Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      {PERMISSIONS.CAN_APPROVE_RESULTS && (
                        <TableCell>
                          {!result.isApproved && (
                            <Checkbox
                              checked={selectedResults.includes(result.id)}
                              onCheckedChange={(checked) => 
                                onSelectResult(result.id, checked as boolean)
                              }
                            />
                          )}
                        </TableCell>
                      )}
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{result.studentName}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            ID: {result.studentId}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{result.subjectName}</div>
                          <div className="text-xs text-muted-foreground">
                            {result.subjectCode}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>T1: {result.scores.test1}</div>
                          <div>T2: {result.scores.test2}</div>
                          <div>Exam: {result.scores.exam}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{result.total}</div>
                          <Badge className={getGradeColor(result.grade)}>
                            Grade {result.grade}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getResultStatusColor(result.isApproved)}>
                          {result.isApproved ? 'Approved' : 'Pending'}
                        </Badge>
                        {result.isApproved && result.approvedDate && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Approved: {formatDate(result.approvedDate)}
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{formatDate(result.submittedDate)}</div>
                          <div className="text-xs text-muted-foreground">
                            by {result.submittedByName}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-4 border-t">
              <span>Total: {results.length} results</span>
              <span>Approved: {results.filter(r => r.isApproved).length}</span>
              <span>Pending: {results.filter(r => !r.isApproved).length}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}