import { Student, Subject } from './types';
import { SCHOOL_INFO } from './constants';

interface StudentResult {
  studentId: string;
  studentName: string;
  className: string;
  term: string;
  academicYear: string;
  subjects: {
    [subjectName: string]: {
      test1: number;
      test2: number;
      exam: number;
      total: number;
      grade: string;
      rank: number;
    };
  };
  overallAverage: number;
  overallGrade: string;
  overallRank: number;
  totalStudentsInClass: number;
}

export const generateStudentResultPDF = async (resultData: StudentResult): Promise<void> => {
  try {
    // Dynamically import jsPDF to avoid SSR issues
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Colors
    const primaryColor = [3, 2, 19]; // #030213
    const goldColor = [255, 215, 0]; // Gold for accent
    const secondaryColor = [113, 113, 130]; // #717182
    const accentColor = [41, 98, 255]; // #2962ff

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;

    // Add subtle background logo watermark
    try {
      const logoImg = new Image();
      logoImg.onload = () => {
        // Add large watermark logo in background
        doc.setGState(doc.GState({ opacity: 0.05 }));
        doc.addImage(logoImg, 'PNG', pageWidth/2 - 40, pageHeight/2 - 40, 80, 80);
        doc.setGState(doc.GState({ opacity: 1.0 }));
      };
      logoImg.src = SCHOOL_INFO.logo;
    } catch (error) {
      console.warn('Could not load logo for watermark:', error);
    }

    // Header Section with School Logo and Info
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 55, 'F');

    // Add decorative gold accent
    doc.setFillColor(...goldColor);
    doc.rect(0, 52, pageWidth, 3, 'F');

    // School Logo
    try {
      const logoImg = new Image();
      logoImg.onload = () => {
        doc.addImage(logoImg, 'PNG', 25, 10, 35, 35);
      };
      logoImg.src = SCHOOL_INFO.logo;
    } catch (error) {
      // Fallback: Create a simple logo placeholder
      doc.setFillColor(255, 255, 255);
      doc.circle(42.5, 27.5, 17.5, 'F');
      doc.setTextColor(...primaryColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('GRA', 42.5, 30, { align: 'center' });
    }

    // School Name and Info
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(SCHOOL_INFO.name.toUpperCase(), 70, 18);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(SCHOOL_INFO.motto, 70, 26);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(SCHOOL_INFO.address, 70, 33, { maxWidth: 120 });
    doc.text(`${SCHOOL_INFO.phone} | ${SCHOOL_INFO.email}`, 70, 42);
    doc.text(SCHOOL_INFO.website, 70, 47);

    // Document Title
    doc.setFillColor(240, 240, 245);
    doc.rect(0, 55, pageWidth, 15, 'F');
    doc.setTextColor(...primaryColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT ACADEMIC RESULT', pageWidth/2, 65, { align: 'center' });

    // Student Information Section
    let yPos = 85;
    doc.setFillColor(250, 250, 255);
    doc.rect(margin, yPos - 5, pageWidth - 2*margin, 40, 'F');
    
    // Add gold accent to info section
    doc.setFillColor(...goldColor);
    doc.rect(margin, yPos - 5, pageWidth - 2*margin, 2, 'F');
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT INFORMATION', margin + 5, yPos + 5);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Left column
    yPos += 12;
    doc.text(`Name: ${resultData.studentName}`, margin + 10, yPos);
    yPos += 6;
    doc.text(`Student ID: ${resultData.studentId}`, margin + 10, yPos);
    yPos += 6;
    doc.text(`Class: ${resultData.className}`, margin + 10, yPos);
    yPos += 6;
    doc.text(`Position: #${resultData.overallRank} of ${resultData.totalStudentsInClass}`, margin + 10, yPos);
    
    // Right column
    yPos -= 18;
    doc.text(`Academic Year: ${resultData.academicYear}`, margin + 100, yPos);
    yPos += 6;
    doc.text(`Term: ${resultData.term}`, margin + 100, yPos);
    yPos += 6;
    doc.text(`Overall Grade: ${resultData.overallGrade}`, margin + 100, yPos);
    yPos += 6;
    doc.text(`Overall Average: ${resultData.overallAverage.toFixed(1)}%`, margin + 100, yPos);

    // Academic Performance Section
    yPos += 18;
    doc.setFillColor(...primaryColor);
    doc.rect(margin, yPos, pageWidth - 2*margin, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ACADEMIC PERFORMANCE', margin + 5, yPos + 6);

    // Table Headers
    yPos += 15;
    doc.setFillColor(245, 245, 250);
    doc.rect(margin, yPos - 3, pageWidth - 2*margin, 10, 'F');
    doc.setTextColor(...primaryColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    const colWidths = [45, 18, 18, 22, 18, 15, 15, 18];
    const headers = ['SUBJECT', 'TEST 1', 'TEST 2', 'EXAM', 'TOTAL', 'GRADE', 'RANK', 'REMARK'];
    let xPos = margin + 5;
    
    headers.forEach((header, index) => {
      doc.text(header, xPos, yPos + 3);
      xPos += colWidths[index];
    });

    // Subject Results
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    Object.entries(resultData.subjects).forEach(([subject, scores], index) => {
      const rowColor = index % 2 === 0 ? [255, 255, 255] : [248, 249, 250];
      doc.setFillColor(...rowColor);
      doc.rect(margin, yPos - 2, pageWidth - 2*margin, 8, 'F');
      
      doc.setTextColor(...primaryColor);
      
      xPos = margin + 5;
      const remark = getRemark(scores.grade);
      const values = [
        subject,
        scores.test1.toString(),
        scores.test2.toString(), 
        scores.exam.toString(),
        scores.total.toString(),
        scores.grade,
        `#${scores.rank}`,
        remark
      ];
      
      values.forEach((value, colIndex) => {
        if (colIndex === 5) { // Grade column
          const gradeColor = getGradeColor(scores.grade);
          doc.setTextColor(...gradeColor);
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setTextColor(...primaryColor);
          doc.setFont('helvetica', 'normal');
        }
        doc.text(value, xPos, yPos + 3);
        xPos += colWidths[colIndex];
      });
      
      yPos += 8;
    });

    // Overall Performance Summary with gold accent
    yPos += 10;
    doc.setFillColor(255, 248, 220); // Light gold background
    doc.rect(margin, yPos - 5, pageWidth - 2*margin, 35, 'F');
    
    // Gold accent border
    doc.setFillColor(...goldColor);
    doc.rect(margin, yPos - 5, pageWidth - 2*margin, 2, 'F');
    doc.rect(margin, yPos + 27, pageWidth - 2*margin, 2, 'F');
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PERFORMANCE SUMMARY & RECOMMENDATIONS', margin + 5, yPos + 5);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos += 12;
    
    // Performance analysis
    const comment = generateDetailedComment(resultData.overallGrade, resultData.overallAverage, resultData.subjects);
    doc.text(comment, margin + 8, yPos, { maxWidth: pageWidth - 2*margin - 16 });

    // Footer with school colors
    yPos = pageHeight - 35;
    doc.setFillColor(...goldColor);
    doc.rect(0, yPos, pageWidth, 2, 'F');
    
    yPos += 8;
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPos);
    doc.text('This is an official computer-generated result slip.', pageWidth - margin, yPos, { align: 'right' });
    
    yPos += 5;
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`© ${new Date().getFullYear()} ${SCHOOL_INFO.name} - ${SCHOOL_INFO.motto}`, pageWidth/2, yPos, { align: 'center' });

    // Save the PDF
    const fileName = `${resultData.studentName.replace(/\s+/g, '_')}_${resultData.term.replace(/\s+/g, '_')}_Result.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Fallback: create a text-based result
    const resultText = createTextResult(resultData);
    const blob = new Blob([resultText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resultData.studentName}_${resultData.term}_Result.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
};

// Helper functions
const getGradeColor = (grade: string): [number, number, number] => {
  switch (grade) {
    case 'A': return [76, 175, 80]; // Green
    case 'B': return [41, 98, 255]; // Blue
    case 'C': return [255, 152, 0]; // Orange
    case 'D': return [255, 193, 7]; // Amber
    case 'F': return [244, 67, 54]; // Red
    default: return [113, 113, 130]; // Gray
  }
};

const getRemark = (grade: string): string => {
  switch (grade) {
    case 'A': return 'Excellent';
    case 'B': return 'Very Good';
    case 'C': return 'Good';
    case 'D': return 'Fair';
    case 'F': return 'Needs Work';
    default: return '';
  }
};

const generateDetailedComment = (grade: string, average: number, subjects: any): string => {
  const subjectCount = Object.keys(subjects).length;
  const excellentSubjects = Object.entries(subjects).filter(([_, scores]: any) => scores.grade === 'A').length;
  const failingSubjects = Object.entries(subjects).filter(([_, scores]: any) => scores.grade === 'F').length;
  
  let comment = `Performance Analysis: ${grade} grade with ${average.toFixed(1)}% average across ${subjectCount} subjects. `;
  
  if (grade === 'A') {
    comment += `Outstanding performance! ${excellentSubjects} excellent grades demonstrate exceptional academic ability. Continue this excellent work and consider leadership roles in academic activities.`;
  } else if (grade === 'B') {
    comment += `Very good performance with strong academic foundation. ${excellentSubjects} excellent subjects show great potential. Focus on weaker areas to achieve outstanding results.`;
  } else if (grade === 'C') {
    comment += `Good performance showing steady progress. Concentrate on improving study habits and seek additional support in challenging subjects. Regular practice will lead to better results.`;
  } else if (grade === 'D') {
    comment += `Fair performance requiring immediate attention. ${failingSubjects} subjects need significant improvement. Recommend extra classes, study groups, and close monitoring by teachers and parents.`;
  } else {
    comment += `Requires urgent academic intervention. Multiple subjects below standard. Immediate action needed including remedial classes, counseling, and intensive parent-teacher collaboration.`;
  }
  
  return comment;
};

const createTextResult = (resultData: StudentResult): string => {
  return `
${SCHOOL_INFO.name}
${SCHOOL_INFO.motto}
${SCHOOL_INFO.address}

STUDENT ACADEMIC RESULT

Student Name: ${resultData.studentName}
Student ID: ${resultData.studentId}
Class: ${resultData.className}
Term: ${resultData.term}
Academic Year: ${resultData.academicYear}

SUBJECT RESULTS:
${Object.entries(resultData.subjects).map(([subject, scores]) => 
  `${subject}: Test1=${scores.test1}, Test2=${scores.test2}, Exam=${scores.exam}, Total=${scores.total}, Grade=${scores.grade}, Rank=#${scores.rank}`
).join('\n')}

OVERALL PERFORMANCE:
Average: ${resultData.overallAverage.toFixed(1)}%
Overall Grade: ${resultData.overallGrade}
Class Position: #${resultData.overallRank} of ${resultData.totalStudentsInClass}

Generated on: ${new Date().toLocaleString()}
  `;
};

// Payment receipt generator
export const generatePaymentReceiptPDF = async (paymentData: any): Promise<void> => {
  try {
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;

    // Add background logo watermark
    try {
      const logoImg = new Image();
      logoImg.onload = () => {
        doc.setGState(doc.GState({ opacity: 0.05 }));
        doc.addImage(logoImg, 'PNG', pageWidth/2 - 50, pageHeight/2 - 50, 100, 100);
        doc.setGState(doc.GState({ opacity: 1.0 }));
      };
      logoImg.src = SCHOOL_INFO.logo;
    } catch (error) {
      console.warn('Could not load logo for receipt watermark:', error);
    }

    // Header with school branding
    doc.setFillColor(3, 2, 19);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setFillColor(255, 215, 0);
    doc.rect(0, 42, pageWidth, 3, 'F');

    // School logo and info
    try {
      const logoImg = new Image();
      logoImg.onload = () => {
        doc.addImage(logoImg, 'PNG', 25, 5, 30, 30);
      };
      logoImg.src = SCHOOL_INFO.logo;
    } catch (error) {
      // Fallback logo
      doc.setFillColor(255, 255, 255);
      doc.circle(40, 20, 15, 'F');
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(SCHOOL_INFO.name.toUpperCase(), 65, 15);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(SCHOOL_INFO.motto, 65, 22);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(SCHOOL_INFO.address, 65, 28, { maxWidth: 120 });
    doc.text(`${SCHOOL_INFO.phone} | ${SCHOOL_INFO.email}`, 65, 35);

    // Receipt title
    doc.setFillColor(240, 240, 245);
    doc.rect(0, 45, pageWidth, 12, 'F');
    doc.setTextColor(3, 2, 19);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL FEE PAYMENT RECEIPT', pageWidth/2, 53, { align: 'center' });

    // Receipt details
    let yPos = 75;
    doc.setFontSize(11);
    doc.text(`Receipt No: ${paymentData.receiptNumber}`, margin, yPos);
    doc.text(`Date: ${paymentData.paymentDate}`, pageWidth - margin - 40, yPos);
    
    yPos += 15;
    doc.setFontSize(10);
    doc.text(`Student Name: ${paymentData.studentName}`, margin, yPos);
    yPos += 6;
    doc.text(`Student ID: ${paymentData.studentId}`, margin, yPos);
    yPos += 6;
    doc.text(`Class: ${paymentData.className}`, margin, yPos);
    yPos += 6;
    doc.text(`Academic Session: ${paymentData.academicSession}`, margin, yPos);

    // Payment details table
    yPos += 20;
    doc.setFillColor(245, 245, 250);
    doc.rect(margin, yPos - 5, pageWidth - 2*margin, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT BREAKDOWN', margin + 5, yPos);

    yPos += 10;
    Object.entries(paymentData.breakdown).forEach(([item, amount]: any) => {
      doc.setFont('helvetica', 'normal');
      doc.text(item, margin + 10, yPos);
      doc.text(`₦${amount.toLocaleString()}`, pageWidth - margin - 30, yPos);
      yPos += 6;
    });

    // Total
    yPos += 5;
    doc.setFillColor(255, 215, 0);
    doc.rect(margin, yPos - 3, pageWidth - 2*margin, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL AMOUNT PAID:', margin + 10, yPos + 2);
    doc.text(`₦${paymentData.totalAmount.toLocaleString()}`, pageWidth - margin - 30, yPos + 2);

    // Footer
    yPos = pageHeight - 40;
    doc.setTextColor(113, 113, 130);
    doc.setFontSize(8);
    doc.text('This is an official computer-generated receipt.', pageWidth/2, yPos, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth/2, yPos + 8, { align: 'center' });

    const fileName = `Receipt_${paymentData.studentName.replace(/\s+/g, '_')}_${paymentData.receiptNumber}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    alert('Error generating receipt. Please try again.');
  }
};