import React from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Trophy, TrendingUp, TrendingDown, Target, Award, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';

// Grading scale for Graceland Royal Academy
export const GRADING_SCALE = {
  A: { min: 80, max: 100, point: 5, description: 'Excellent', color: 'text-green-700 bg-green-50 border-green-300' },
  B: { min: 70, max: 79, point: 4, description: 'Very Good', color: 'text-blue-700 bg-blue-50 border-blue-300' },
  C: { min: 60, max: 69, point: 3, description: 'Good', color: 'text-yellow-700 bg-yellow-50 border-yellow-300' },
  D: { min: 50, max: 59, point: 2, description: 'Satisfactory', color: 'text-orange-700 bg-orange-50 border-orange-300' },
  E: { min: 40, max: 49, point: 1, description: 'Poor', color: 'text-red-700 bg-red-50 border-red-300' },
  F: { min: 0, max: 39, point: 0, description: 'Fail', color: 'text-red-800 bg-red-100 border-red-400' }
};

// Performance recommendations based on grade
export const PERFORMANCE_RECOMMENDATIONS = {
  A: {
    message: "Outstanding performance! Keep up the excellent work.",
    suggestions: [
      "Continue maintaining this excellent standard",
      "Consider taking on leadership roles in class projects",
      "Explore advanced topics to further challenge yourself",
      "Mentor classmates who may need assistance"
    ],
    icon: Trophy,
    color: "text-green-600"
  },
  B: {
    message: "Very good work! You're performing well above average.",
    suggestions: [
      "Review areas where you lost marks to reach excellence",
      "Increase practice time for challenging topics",
      "Participate more actively in class discussions",
      "Set specific goals to reach grade A in the next assessment"
    ],
    icon: Award,
    color: "text-blue-600"
  },
  C: {
    message: "Good performance with room for improvement.",
    suggestions: [
      "Identify and focus on your weaker subject areas",
      "Create a structured study schedule",
      "Seek additional help from teachers for difficult concepts",
      "Form study groups with classmates"
    ],
    icon: Target,
    color: "text-yellow-600"
  },
  D: {
    message: "Satisfactory but needs significant improvement.",
    suggestions: [
      "Schedule extra tutoring sessions with subject teachers",
      "Break down study materials into smaller, manageable sections",
      "Practice past questions regularly",
      "Attend all classes and participate actively"
    ],
    icon: TrendingUp,
    color: "text-orange-600"
  },
  E: {
    message: "Poor performance requiring immediate attention.",
    suggestions: [
      "Meet with class supervisor to discuss academic challenges",
      "Attend all available extra classes and tutorials",
      "Consider changing study methods and techniques",
      "Seek help from parents for additional home support"
    ],
    icon: TrendingDown,
    color: "text-red-600"
  },
  F: {
    message: "Failing grade - urgent intervention required.",
    suggestions: [
      "Immediate meeting with parents and class supervisor required",
      "Enroll in intensive remedial classes",
      "Complete diagnostic assessment to identify learning gaps",
      "Consider repeating the academic term if necessary"
    ],
    icon: AlertTriangle,
    color: "text-red-700"
  }
};

export function calculateGrade(totalScore: number): { grade: string; description: string; point: number; color: string } {
  for (const [grade, details] of Object.entries(GRADING_SCALE)) {
    if (totalScore >= details.min && totalScore <= details.max) {
      return {
        grade,
        description: details.description,
        point: details.point,
        color: details.color
      };
    }
  }
  return GRADING_SCALE.F;
}

export function calculateGPA(results: Array<{ totalScore: number; creditUnit?: number }>): number {
  if (!results.length) return 0;
  
  const totalPoints = results.reduce((sum, result) => {
    const grade = calculateGrade(result.totalScore);
    const creditUnit = result.creditUnit || 1;
    return sum + (grade.point * creditUnit);
  }, 0);
  
  const totalCredits = results.reduce((sum, result) => sum + (result.creditUnit || 1), 0);
  
  return totalPoints / totalCredits;
}

export function getPerformanceLevel(gpa: number): { level: string; color: string; description: string } {
  if (gpa >= 4.5) return { level: 'Excellent', color: 'text-green-700', description: 'Outstanding academic performance' };
  if (gpa >= 3.5) return { level: 'Very Good', color: 'text-blue-700', description: 'Above average performance' };
  if (gpa >= 2.5) return { level: 'Good', color: 'text-yellow-700', description: 'Satisfactory performance' };
  if (gpa >= 1.5) return { level: 'Fair', color: 'text-orange-700', description: 'Below average performance' };
  return { level: 'Poor', color: 'text-red-700', description: 'Requires significant improvement' };
}

interface GradeDisplayProps {
  totalScore: number;
  showRecommendations?: boolean;
  className?: string;
}

export function GradeDisplay({ totalScore, showRecommendations = false, className = '' }: GradeDisplayProps) {
  const gradeInfo = calculateGrade(totalScore);
  const recommendation = PERFORMANCE_RECOMMENDATIONS[gradeInfo.grade as keyof typeof PERFORMANCE_RECOMMENDATIONS];
  const IconComponent = recommendation.icon;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Grade Badge */}
      <div className="flex items-center gap-3">
        <Badge className={`px-4 py-2 text-lg font-bold ${gradeInfo.color}`}>
          {gradeInfo.grade}
        </Badge>
        <div>
          <p className="font-semibold text-gray-900">{gradeInfo.description}</p>
          <p className="text-sm text-gray-600">{totalScore}% - {gradeInfo.point} points</p>
        </div>
      </div>

      {/* Score Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Score Progress</span>
          <span className="text-sm text-gray-600">{totalScore}/100</span>
        </div>
        <Progress 
          value={totalScore} 
          className="h-3"
          // @ts-ignore - Custom styling
          style={{
            '--progress-background': gradeInfo.grade === 'A' ? '#10b981' : 
                                   gradeInfo.grade === 'B' ? '#3b82f6' :
                                   gradeInfo.grade === 'C' ? '#f59e0b' :
                                   gradeInfo.grade === 'D' ? '#f97316' : '#ef4444'
          }}
        />
      </div>

      {/* Recommendations */}
      {showRecommendations && (
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className={`flex items-center gap-2 text-base ${recommendation.color}`}>
              <IconComponent className="w-5 h-5" />
              Performance Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Alert className={gradeInfo.color}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="font-medium">
                {recommendation.message}
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Suggested Actions:
              </h4>
              <ul className="space-y-2">
                {recommendation.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-navy rounded-full mt-2 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface GradingSummaryProps {
  results: Array<{
    subject: string;
    totalScore: number;
    creditUnit?: number;
  }>;
  className?: string;
}

export function GradingSummary({ results, className = '' }: GradingSummaryProps) {
  const gpa = calculateGPA(results);
  const performanceLevel = getPerformanceLevel(gpa);
  
  // Calculate grade distribution
  const gradeDistribution = results.reduce((acc, result) => {
    const grade = calculateGrade(result.totalScore).grade;
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* GPA Summary */}
      <Card className="border-navy/20">
        <CardHeader className="bg-gradient-to-r from-navy to-blue-700 text-white">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Academic Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Overall GPA</p>
              <p className="text-3xl font-bold text-navy">{gpa.toFixed(2)}</p>
              <p className="text-sm text-gray-600">out of 5.0</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Performance Level</p>
              <p className={`text-xl font-bold ${performanceLevel.color}`}>
                {performanceLevel.level}
              </p>
              <p className="text-sm text-gray-600">{performanceLevel.description}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Subjects Taken</p>
              <p className="text-3xl font-bold text-navy">{results.length}</p>
              <p className="text-sm text-gray-600">this term</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade Distribution */}
      <Card className="border-gold/30">
        <CardHeader className="bg-gradient-to-r from-gold to-amber-500 text-navy">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Grade Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(GRADING_SCALE).map(([grade, details]) => {
              const count = gradeDistribution[grade] || 0;
              const percentage = results.length > 0 ? (count / results.length) * 100 : 0;
              
              return (
                <div key={grade} className="text-center p-3 bg-gray-50 rounded-lg">
                  <Badge className={`mb-2 ${details.color}`}>
                    Grade {grade}
                  </Badge>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-600">{percentage.toFixed(0)}%</p>
                  <div className="mt-2 bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-navy h-1 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy">
            <BookOpen className="w-5 h-5" />
            Subject-wise Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {results.map((result, index) => {
              const gradeInfo = calculateGrade(result.totalScore);
              const recommendation = PERFORMANCE_RECOMMENDATIONS[gradeInfo.grade as keyof typeof PERFORMANCE_RECOMMENDATIONS];
              const IconComponent = recommendation.icon;
              
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-5 h-5 ${recommendation.color}`} />
                    <div>
                      <p className="font-semibold text-gray-900">{result.subject}</p>
                      <p className="text-sm text-gray-600">
                        {result.creditUnit ? `${result.creditUnit} credit units` : 'Standard credit'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{result.totalScore}%</p>
                      <p className="text-sm text-gray-600">{gradeInfo.description}</p>
                    </div>
                    <Badge className={gradeInfo.color}>
                      {gradeInfo.grade}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default {
  GradeDisplay,
  GradingSummary,
  calculateGrade,
  calculateGPA,
  getPerformanceLevel,
  GRADING_SCALE,
  PERFORMANCE_RECOMMENDATIONS
};