import React from 'react';
import { 
  RECEIPT_TEMPLATE, 
  RESULT_CARD_TEMPLATE, 
  STUDENT_RECORD_TEMPLATE 
} from './pdf/pdf-templates';
import { 
  RECEIPT_STYLES, 
  RESULT_CARD_STYLES, 
  STUDENT_RECORD_STYLES 
} from './pdf/pdf-styles';
import { 
  formatDate, 
  formatDateTime, 
  formatCurrency, 
  replaceTemplateVars, 
  generateSubjectRows, 
  generateStudentRows, 
  generateNextTermSection, 
  openPrintWindow, 
  handlePDFError, 
  generateDownloadCSV,
  getOrdinalSuffix
} from './pdf/pdf-utils';

export interface PaymentReceiptData {
  receiptNumber: string;
  studentId: string;
  studentName: string;
  class: string;
  parentName: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  term: string;
  session: string;
  accountantName: string;
}

export interface ResultCardData {
  studentId: string;
  studentName: string;
  class: string;
  term: string;
  session: string;
  subjects: Array<{
    name: string;
    test1: number;
    test2: number;
    exam: number;
    total: number;
    grade: string;
    position?: number;
  }>;
  overallPosition?: number;
  totalScore: number;
  averageScore: number;
  grade: string;
  nextTermBegins?: string;
  classTeacher?: string;
  principalComment?: string;
}

export interface StudentRecordTemplateData {
  className: string;
  subjectName: string;
  subjectCode: string;
  term: string;
  session: string;
  students: Array<{
    name: string;
    test1?: number;
    test2?: number;
    exam?: number;
  }>;
  supervisorName: string;
  maxScores: {
    test1: number;
    test2: number;
    exam: number;
  };
}

export class PDFGenerator {
  static generatePaymentReceipt(data: PaymentReceiptData): void {
    try {
      const templateVars = {
        styles: RECEIPT_STYLES,
        receiptNumber: data.receiptNumber,
        paymentDate: formatDate(data.paymentDate),
        studentName: data.studentName,
        studentId: data.studentId,
        class: data.class,
        parentName: data.parentName,
        session: data.session,
        term: data.term,
        paymentType: data.paymentType,
        paymentMethod: data.paymentMethod.toUpperCase(),
        amount: formatCurrency(data.amount),
        accountantName: data.accountantName,
        timestamp: formatDateTime()
      };

      const receiptHTML = replaceTemplateVars(RECEIPT_TEMPLATE, templateVars);
      openPrintWindow(receiptHTML);
    } catch (error) {
      handlePDFError(error as Error, 'payment receipt');
    }
  }

  static generateResultCard(data: ResultCardData): void {
    try {
      const subjectRows = generateSubjectRows(data.subjects);
      const nextTermSection = generateNextTermSection(data.nextTermBegins);
      const classTeacherComment = data.classTeacher ? 
        `Excellent performance this term. Keep up the good work! - ${data.classTeacher}` : 
        'Outstanding effort and dedication shown throughout the term.';
      const principalComment = data.principalComment || 
        'Well done! Continue to strive for excellence in all your endeavors. Your hard work and commitment are commendable.';

      const templateVars = {
        styles: RESULT_CARD_STYLES,
        studentName: data.studentName,
        studentId: data.studentId,
        class: data.class,
        session: data.session,
        term: data.term,
        overallPosition: data.overallPosition ? 
          `${data.overallPosition}${getOrdinalSuffix(data.overallPosition)}` : 'N/A',
        subjectRows,
        totalScore: data.totalScore.toString(),
        averageScore: data.averageScore.toFixed(1),
        grade: data.grade,
        classTeacherComment,
        principalComment,
        nextTermSection,
        timestamp: formatDateTime()
      };

      const resultHTML = replaceTemplateVars(RESULT_CARD_TEMPLATE, templateVars);
      openPrintWindow(resultHTML);
    } catch (error) {
      handlePDFError(error as Error, 'result card');
    }
  }

  static generateStudentRecordTemplate(data: StudentRecordTemplateData): void {
    try {
      const studentRows = generateStudentRows(data.students);

      const templateVars = {
        styles: STUDENT_RECORD_STYLES,
        className: data.className,
        subjectName: data.subjectName,
        subjectCode: data.subjectCode,
        term: data.term,
        session: data.session,
        maxTest1: data.maxScores.test1.toString(),
        maxTest2: data.maxScores.test2.toString(),
        maxExam: data.maxScores.exam.toString(),
        studentRows,
        supervisorName: data.supervisorName,
        timestamp: formatDateTime()
      };

      const templateHTML = replaceTemplateVars(STUDENT_RECORD_TEMPLATE, templateVars);
      openPrintWindow(templateHTML);
    } catch (error) {
      handlePDFError(error as Error, 'student record template');
    }
  }

  static generateBulkResultCards(students: ResultCardData[]): void {
    students.forEach((student, index) => {
      setTimeout(() => {
        this.generateResultCard(student);
      }, index * 1000); // Delay each print by 1 second
    });
  }

  static downloadResultsAsCSV(results: any[], filename: string = 'results.csv'): void {
    generateDownloadCSV(results, filename);
  }
}