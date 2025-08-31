import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { School, Users, UserCheck, DollarSign } from 'lucide-react';
import { formatCurrency, getClassStudents } from './accountant-utils';

interface OverviewCardsProps {
  classes: any[];
  students: any[];
  parents: any[];
  feeStructures: any[];
  selectedTerm: string;
  currentSession?: { name: string };
  getFeeStructureForClass: (className: string, term: string) => any;
}

export function OverviewCards({
  classes,
  students,
  parents,
  feeStructures,
  selectedTerm,
  currentSession,
  getFeeStructureForClass
}: OverviewCardsProps) {
  // Statistics with null checks
  const totalStudents = (students || []).filter(s => s.isActive).length;
  const registeredParents = (parents || []).filter(p => p.isRegistered).length;
  const totalFeeStructures = (feeStructures || []).filter(f => f.isActive).length;
  const activeClasses = (classes || []).filter(c => c.isActive).length;

  return (
    <>
      {/* Quick Stats - Mobile Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <School className="h-3 w-3 text-blue-600" />
              Classes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg lg:text-2xl font-bold text-blue-600">{activeClasses}</div>
            <p className="text-xs text-muted-foreground">Fee structures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <Users className="h-3 w-3 text-green-600" />
              Students
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg lg:text-2xl font-bold text-green-600">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active enrollment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <UserCheck className="h-3 w-3 text-purple-600" />
              Parents
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg lg:text-2xl font-bold text-purple-600">{registeredParents}</div>
            <p className="text-xs text-muted-foreground">Registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <DollarSign className="h-3 w-3 text-orange-600" />
              Fee Plans
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg lg:text-2xl font-bold text-orange-600">{totalFeeStructures}</div>
            <p className="text-xs text-muted-foreground">Active structures</p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Structure Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fee Structure Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(classes || []).filter(c => c.isActive).map(classData => {
              const currentFee = getFeeStructureForClass(classData.name, selectedTerm);
              const classStudents = getClassStudents(students, classData.name);
              
              return (
                <div key={classData.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">{classData.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {classStudents.length} students
                    </Badge>
                  </div>
                  
                  {currentFee ? (
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(currentFee.total)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        per student • {selectedTerm}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Updated: {new Date(currentFee.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-sm text-orange-600">Not Set</div>
                      <div className="text-xs text-muted-foreground">
                        No fee for {selectedTerm}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Parent Result Access Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parent Result Access Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {(parents || []).filter(p => p.canViewResults && p.resultViewType !== 'none').length}
              </div>
              <div className="text-xs text-green-700">Can View Results</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {(parents || []).filter(p => p.resultViewType === 'individual').length}
              </div>
              <div className="text-xs text-blue-700">Individual Only</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">
                {(parents || []).filter(p => p.resultViewType === 'class').length}
              </div>
              <div className="text-xs text-purple-700">Class & Individual</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}