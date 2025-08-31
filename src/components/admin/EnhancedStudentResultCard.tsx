import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { SchoolLogoWatermark } from '../SchoolLogoWatermark';
import { 
  User, 
  Calendar, 
  Award, 
  TrendingUp, 
  Star,
  GraduationCap,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { motion } from 'motion/react';

interface Subject {
  name: string;
  test1: number;
  test2: number;
  exam: number;
  total: number;
  grade: string;
  position: number;
}

interface StudentResult {
  student_id: string;
  full_name: string;
  class_name: string;
  passport_photo?: string;
  term: string;
  session: string;
  subjects: Subject[];
  overall_average: number;
  overall_grade: string;
  class_position: number;
  total_students: number;
  attendance: {
    present: number;
    total: number;
    percentage: number;
  };
  conduct: {
    punctuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    attitude: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    leadership: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  };
  teacher_comment: string;
  next_term_begins: string;
}

interface EnhancedStudentResultCardProps {
  result: StudentResult;
}

export const EnhancedStudentResultCard: React.FC<EnhancedStudentResultCardProps> = ({ result }) => {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'E': return 'text-red-500 bg-red-100';
      case 'F': return 'text-red-700 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConductColor = (conduct: string) => {
    switch (conduct) {
      case 'Excellent': return 'text-green-600';
      case 'Good': return 'text-blue-600';
      case 'Fair': return 'text-yellow-600';
      case 'Poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatPosition = (position: number) => {
    const suffix = ['th', 'st', 'nd', 'rd'][position % 100 > 10 && position % 100 < 14 ? 0 : position % 10 < 4 ? position % 10 : 0];
    return `${position}${suffix}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white relative overflow-hidden">
      <SchoolLogoWatermark />
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-navy to-blue-700 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">GRACELAND ROYAL ACADEMY</h1>
            <p className="text-blue-100 text-sm">WISDOM & ILLUMINATION</p>
            <p className="text-blue-200 text-xs mt-1">Academic Excellence • Character Development • Leadership</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">STUDENT REPORT CARD</h2>
            <p className="text-blue-100 text-sm">{result.term} • {result.session}</p>
          </div>
        </div>
      </div>

      {/* Student Information */}
      <div className="bg-gradient-to-r from-gold/10 to-yellow-50 p-6 border-b">
        <div className="flex items-center space-x-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={result.passport_photo} alt={result.full_name} />
                <AvatarFallback className="bg-navy text-white text-2xl">
                  {result.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-gold text-navy rounded-full p-2">
                <Star className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-navy mb-2">{result.full_name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-navy" />
                <span className="text-gray-600">Student ID:</span>
                <span className="font-medium">{result.student_id}</span>
              </div>
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-navy" />
                <span className="text-gray-600">Class:</span>
                <span className="font-medium">{result.class_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-navy" />
                <span className="text-gray-600">Term:</span>
                <span className="font-medium">{result.term}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-navy" />
                <span className="text-gray-600">Position:</span>
                <span className="font-medium">
                  {formatPosition(result.class_position)} out of {result.total_students}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-navy">
              <p className="text-sm text-gray-600 mb-1">Overall Average</p>
              <p className="text-3xl font-bold text-navy">{result.overall_average.toFixed(1)}%</p>
              <Badge className={`mt-2 ${getGradeColor(result.overall_grade)} border-0`}>
                Grade {result.overall_grade}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Performance */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-navy mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Academic Performance
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-navy text-white">
                <th className="border border-gray-300 px-4 py-3 text-left">Subject</th>
                <th className="border border-gray-300 px-3 py-3 text-center">Test 1<br/><span className="text-xs">(20%)</span></th>
                <th className="border border-gray-300 px-3 py-3 text-center">Test 2<br/><span className="text-xs">(20%)</span></th>
                <th className="border border-gray-300 px-3 py-3 text-center">Exam<br/><span className="text-xs">(60%)</span></th>
                <th className="border border-gray-300 px-3 py-3 text-center">Total<br/><span className="text-xs">(100%)</span></th>
                <th className="border border-gray-300 px-3 py-3 text-center">Grade</th>
                <th className="border border-gray-300 px-3 py-3 text-center">Position</th>
              </tr>
            </thead>
            <tbody>
              {result.subjects.map((subject, index) => (
                <motion.tr 
                  key={subject.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="border border-gray-300 px-4 py-3 font-medium">{subject.name}</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">{subject.test1}</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">{subject.test2}</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">{subject.exam}</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-bold">{subject.total}</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">
                    <Badge className={`${getGradeColor(subject.grade)} border-0`}>
                      {subject.grade}
                    </Badge>
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center">{formatPosition(subject.position)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50">
        {/* Attendance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-navy text-lg flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Attendance Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">
                {result.attendance.present} out of {result.attendance.total} days
              </span>
              <span className="font-bold text-navy">{result.attendance.percentage}%</span>
            </div>
            <Progress value={result.attendance.percentage} className="h-3" />
            <p className="text-xs text-gray-500 mt-2">
              {result.attendance.percentage >= 90 ? 'Excellent' : 
               result.attendance.percentage >= 80 ? 'Good' : 
               result.attendance.percentage >= 70 ? 'Fair' : 'Poor'} attendance record
            </p>
          </CardContent>
        </Card>

        {/* Conduct */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-navy text-lg flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Conduct Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Punctuality:</span>
                <span className={`font-medium ${getConductColor(result.conduct.punctuality)}`}>
                  {result.conduct.punctuality}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Attitude:</span>
                <span className={`font-medium ${getConductColor(result.conduct.attitude)}`}>
                  {result.conduct.attitude}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Leadership:</span>
                <span className={`font-medium ${getConductColor(result.conduct.leadership)}`}>
                  {result.conduct.leadership}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teacher's Comment */}
      <div className="p-6 border-t">
        <h3 className="text-lg font-bold text-navy mb-3">Class Teacher's Comment</h3>
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-navy">
          <p className="text-gray-700 italic">{result.teacher_comment}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-navy to-blue-700 text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm">Next Term Begins: <span className="font-bold">{result.next_term_begins}</span></p>
            <p className="text-xs text-blue-200 mt-1">Printed on: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Principal's Signature</p>
            <div className="w-32 h-12 border-b border-white/30 mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStudentResultCard;