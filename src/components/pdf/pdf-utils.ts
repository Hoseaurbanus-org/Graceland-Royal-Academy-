export const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;
  if (j == 1 && k != 11) return "st";
  if (j == 2 && k != 12) return "nd";
  if (j == 3 && k != 13) return "rd";
  return "th";
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const formatDateTime = (date?: string | Date): string => {
  const dateObj = date ? (typeof date === 'string' ? new Date(date) : date) : new Date();
  return dateObj.toLocaleString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString();
};

export const replaceTemplateVars = (template: string, vars: Record<string, string>): string => {
  let result = template;
  Object.entries(vars).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value);
  });
  return result;
};

export const generateSubjectRows = (subjects: Array<{
  name: string;
  test1: number;
  test2: number;
  exam: number;
  total: number;
  grade: string;
  position?: number;
}>): string => {
  return subjects.map(subject => `
    <tr>
      <td class="subject-name">${subject.name}</td>
      <td class="score-cell">${subject.test1}</td>
      <td class="score-cell">${subject.test2}</td>
      <td class="score-cell">${subject.exam}</td>
      <td class="total-cell">${subject.total}</td>
      <td class="grade-cell">${subject.grade}</td>
      <td>${subject.position ? `${subject.position}${getOrdinalSuffix(subject.position)}` : '-'}</td>
    </tr>
  `).join('');
};

export const generateStudentRows = (students: Array<{
  name: string;
  test1?: number;
  test2?: number;
  exam?: number;
}>): string => {
  return students.map((student, index) => `
    <tr>
      <td class="row-number">${index + 1}</td>
      <td class="student-name">${student.name}</td>
      <td class="score-input">${student.test1 || ''}</td>
      <td class="score-input">${student.test2 || ''}</td>
      <td class="score-input">${student.exam || ''}</td>
    </tr>
  `).join('');
};

export const generateNextTermSection = (nextTermBegins?: string): string => {
  if (!nextTermBegins) return '';
  
  return `
    <div class="next-term">
      <strong>📅 Next Term Resumes: ${nextTermBegins}</strong>
    </div>
  `;
};

export const openPrintWindow = (htmlContent: string): void => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  }
};

export const handlePDFError = (error: Error, type: string): void => {
  console.error(`Error generating ${type}:`, error);
  alert(`Error generating ${type}. Please try again.`);
};

export const generateDownloadCSV = (results: any[], filename: string = 'results.csv'): void => {
  try {
    const headers = Object.keys(results[0] || {});
    const csvContent = [
      headers.join(','),
      ...results.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading CSV:', error);
    alert('Error downloading file. Please try again.');
  }
};