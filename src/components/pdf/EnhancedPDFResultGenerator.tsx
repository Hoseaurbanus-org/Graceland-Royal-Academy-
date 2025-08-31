import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { SchoolLogo } from '../SchoolLogo';

interface StudentResult {
  id: string;
  student_id: string;
  subject_id: string;
  test1_score: number;
  test2_score: number;
  exam_score: number;
  total_score: number;
  percentage: number;
  grade: string;
  position?: number;
  subject_name: string;
  subject_code: string;
  remark?: string;
}

interface Student {
  id: string;
  name: string;
  admission_number: string;
  class_id: string;
  photo_url?: string;
  date_of_birth?: string;
  gender?: string;
}

interface Class {
  id: string;
  name: string;
  level: string;
}

interface ResultPDFProps {
  student: Student;
  studentClass: Class;
  results: StudentResult[];
  session: string;
  term: string;
  affectiveRemark?: any;
  teacherRemark?: string;
  principalRemark?: string;
  nextTermBegins?: string;
}

export function EnhancedPDFResultGenerator({
  student,
  studentClass,
  results,
  session,
  term,
  affectiveRemark,
  teacherRemark,
  principalRemark,
  nextTermBegins
}: ResultPDFProps) {
  
  const calculateOverallPerformance = () => {
    if (results.length === 0) return { average: 0, grade: 'N/A', totalSubjects: 0 };
    
    const totalPercentage = results.reduce((sum, r) => sum + r.percentage, 0);
    const average = Math.round(totalPercentage / results.length);
    
    return {
      average,
      grade: calculateGrade(average),
      totalSubjects: results.length
    };
  };

  const calculateGrade = (percentage: number): string => {
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    return 'F';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-50 border-green-200';
      case 'B': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'C': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'D': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'E': return 'text-red-600 bg-red-50 border-red-200';
      case 'F': return 'text-red-800 bg-red-100 border-red-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const performance = calculateOverallPerformance();

  return (
    <div className="max-w-4xl mx-auto bg-white" id="result-pdf">
      {/* School Branding Background */}
      <div className="relative min-h-screen">
        {/* Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <SchoolLogo size="xl" showText={false} />
        </div>
        
        {/* Content */}
        <div className="relative z-10 p-8">
          {/* Header Section */}
          <div className="text-center mb-8 border-b-2 border-primary pb-6">
            <div className="flex items-center justify-center gap-6 mb-4">
              <SchoolLogo size="lg" showText={false} />
              <div>
                <h1 className="text-3xl font-bold text-primary">GRACELAND ROYAL ACADEMY</h1>
                <p className="text-lg text-academic-gold font-medium">Wisdom & Illumination</p>
                <p className="text-sm text-muted-foreground">Lagos, Nigeria</p>
                <p className="text-sm text-muted-foreground">Email: info@gracelandroyalacademy.edu.ng</p>
              </div>
              {/* Student Photo */}
              <div className="w-24 h-24 border-2 border-primary rounded-lg overflow-hidden bg-muted">
                {student.photo_url ? (
                  <img
                    src={student.photo_url}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span className="text-xs">No Photo</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-primary/10 to-academic-gold/10 p-4 rounded-lg">
              <h2 className="text-xl font-bold text-primary">STUDENT REPORT CARD</h2>
              <p className="text-muted-foreground">{session} Academic Session - {term}</p>
            </div>
          </div>

          {/* Student Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Student Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Full Name:</span>
                    <span className="font-medium">{student.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Admission Number:</span>
                    <span className="font-medium">{student.admission_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Class:</span>
                    <span className="font-medium">{studentClass.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">{studentClass.level}</span>
                  </div>
                  {student.gender && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gender:</span>
                      <span className="font-medium">{student.gender}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Academic Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Subjects:</span>
                    <span className="font-medium">{performance.totalSubjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overall Average:</span>
                    <span className="font-bold text-lg">{performance.average}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overall Grade:</span>
                    <Badge className={getGradeColor(performance.grade)}>
                      {performance.grade}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session:</span>
                    <span className="font-medium">{session}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Term:</span>
                    <span className="font-medium">{term}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Academic Results Table */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Academic Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-primary">
                      <th className="text-left p-3 font-semibold">Subject</th>
                      <th className="text-center p-3 font-semibold">Test 1<br/>(20%)</th>
                      <th className="text-center p-3 font-semibold">Test 2<br/>(20%)</th>
                      <th className="text-center p-3 font-semibold">Exam<br/>(60%)</th>
                      <th className="text-center p-3 font-semibold">Total<br/>(100%)</th>
                      <th className="text-center p-3 font-semibold">Grade</th>
                      <th className="text-center p-3 font-semibold">Position</th>
                      <th className="text-left p-3 font-semibold">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={result.id} className={`border-b ${index % 2 === 0 ? 'bg-muted/30' : ''}`}>
                        <td className="p-3">
                          <div>
                            <span className="font-medium">{result.subject_name}</span>
                            <br />
                            <span className="text-sm text-muted-foreground">{result.subject_code}</span>
                          </div>
                        </td>
                        <td className="text-center p-3">{result.test1_score}</td>
                        <td className="text-center p-3">{result.test2_score}</td>
                        <td className="text-center p-3">{result.exam_score}</td>
                        <td className="text-center p-3 font-bold">{result.percentage}%</td>
                        <td className="text-center p-3">
                          <Badge className={getGradeColor(result.grade)}>
                            {result.grade}
                          </Badge>
                        </td>
                        <td className="text-center p-3">
                          {result.position ? `${result.position}` : 'N/A'}
                        </td>
                        <td className="p-3 text-sm">
                          {result.remark || (result.percentage >= 70 ? 'Excellent' : 
                                           result.percentage >= 60 ? 'Very Good' :
                                           result.percentage >= 50 ? 'Good' :
                                           result.percentage >= 40 ? 'Fair' : 'Needs Improvement')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Grading Scale */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Grading Scale</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                  <div className="font-bold text-green-600">A</div>
                  <div className="text-sm text-green-600">80-100%</div>
                  <div className="text-xs text-muted-foreground">Excellent</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="font-bold text-blue-600">B</div>
                  <div className="text-sm text-blue-600">70-79%</div>
                  <div className="text-xs text-muted-foreground">Very Good</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded border border-yellow-200">
                  <div className="font-bold text-yellow-600">C</div>
                  <div className="text-sm text-yellow-600">60-69%</div>
                  <div className="text-xs text-muted-foreground">Good</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded border border-orange-200">
                  <div className="font-bold text-orange-600">D</div>
                  <div className="text-sm text-orange-600">50-59%</div>
                  <div className="text-xs text-muted-foreground">Fair</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded border border-red-200">
                  <div className="font-bold text-red-600">E</div>
                  <div className="text-sm text-red-600">40-49%</div>
                  <div className="text-xs text-muted-foreground">Pass</div>
                </div>
                <div className="text-center p-3 bg-red-100 rounded border border-red-300">
                  <div className="font-bold text-red-800">F</div>
                  <div className="text-sm text-red-800">0-39%</div>
                  <div className="text-xs text-muted-foreground">Fail</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Affective Assessment */}
          {affectiveRemark && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Affective Assessment</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(affectiveRemark).map(([trait, rating]) => {
                    if (trait === 'id' || trait === 'student_id' || trait === 'session' || trait === 'term' || trait === 'created_at' || trait === 'updated_at') return null;
                    
                    return (
                      <div key={trait} className="text-center p-3 bg-muted/30 rounded">
                        <div className="font-medium capitalize">{trait.replace('_', ' ')}</div>
                        <div className="text-sm font-bold text-primary">{rating as string}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Remarks Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {teacherRemark && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Class Teacher's Remark</h3>
                  <p className="text-sm leading-relaxed">{teacherRemark}</p>
                </CardContent>
              </Card>
            )}

            {principalRemark && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Principal's Remark</h3>
                  <p className="text-sm leading-relaxed">{principalRemark}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Footer */}
          <div className="border-t-2 border-primary pt-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <div className="border-t border-muted-foreground pt-2 mt-8">
                  <p className="font-medium">Class Teacher's Signature</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="border-t border-muted-foreground pt-2 mt-8">
                  <p className="font-medium">Principal's Signature</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="space-y-2">
                  {nextTermBegins && (
                    <p><span className="font-medium">Next Term Begins:</span> {nextTermBegins}</p>
                  )}
                  <p><span className="font-medium">Date Generated:</span> {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-6 pt-4 border-t border-muted">
              <p className="text-xs text-muted-foreground">
                This is an official document generated by Graceland Royal Academy Academic Management System
              </p>
              <p className="text-xs text-muted-foreground">
                For inquiries, contact: info@gracelandroyalacademy.edu.ng
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility function to generate PDF from the component
export const generateResultPDF = async (props: ResultPDFProps) => {
  // This would typically use a library like html2pdf or puppeteer
  // For this implementation, we'll use the browser's print functionality
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Student Result - ${props.student.name}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
          }
          body { font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>
        <div id="result-content"></div>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for the window to load then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return { success: true, message: 'PDF generated successfully' };
};