export const SCHOOL_HEADER_TEMPLATE = `
  <div class="header">
    <div class="school-logo">GRA</div>
    <div class="school-name">Graceland Royal Academy</div>
    <div class="school-motto">Excellence in Education • Wisdom & Illumination</div>
    <div class="contact-info">
      No. 15 Education Street, Gombe State, Nigeria<br>
      Tel: +234-XXX-XXX-XXXX | Email: info@gracelandroyal.edu.ng
    </div>
  </div>
`;

export const RECEIPT_TEMPLATE = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Fee Payment Receipt - {receiptNumber}</title>
    <style>{styles}</style>
  </head>
  <body>
    ${SCHOOL_HEADER_TEMPLATE}

    <div class="receipt-title">OFFICIAL FEE PAYMENT RECEIPT</div>

    <div class="receipt-details">
      <div class="detail-row">
        <span class="detail-label">Receipt Number:</span>
        <span class="detail-value">{receiptNumber}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Payment Date:</span>
        <span class="detail-value">{paymentDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Student Name:</span>
        <span class="detail-value">{studentName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Student ID:</span>
        <span class="detail-value">{studentId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Class:</span>
        <span class="detail-value">{class}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Parent/Guardian:</span>
        <span class="detail-value">{parentName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Academic Session:</span>
        <span class="detail-value">{session}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Term:</span>
        <span class="detail-value">{term}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Payment For:</span>
        <span class="detail-value">{paymentType}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Payment Method:</span>
        <span class="detail-value">{paymentMethod}</span>
      </div>
    </div>

    <div class="amount-section">
      <div class="amount">
        Amount Paid: ₦{amount}
      </div>
    </div>

    <div class="signature-section">
      <div class="signature-box">
        Parent/Guardian Signature
      </div>
      <div class="signature-box">
        Accountant: {accountantName}
      </div>
    </div>

    <div class="footer">
      <div class="footer-note">
        <strong>Important Notice:</strong> This receipt is valid only when signed and officially stamped by the school accountant.
        Please retain this receipt for your records and future reference.
      </div>
      <div class="timestamp">
        Generated on {timestamp}
      </div>
    </div>
  </body>
  </html>
`;

export const RESULT_CARD_TEMPLATE = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Student Result Card - {studentName}</title>
    <style>{styles}</style>
  </head>
  <body>
    ${SCHOOL_HEADER_TEMPLATE}

    <div class="result-title">Student Academic Result Card</div>

    <div class="student-info">
      <div class="info-column">
        <div class="info-item">
          <span class="info-label">Student Name:</span>
          <span class="info-value">{studentName}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Student ID:</span>
          <span class="info-value">{studentId}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Class:</span>
          <span class="info-value">{class}</span>
        </div>
      </div>
      <div class="info-column">
        <div class="info-item">
          <span class="info-label">Academic Session:</span>
          <span class="info-value">{session}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Term:</span>
          <span class="info-value">{term}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Position in Class:</span>
          <span class="info-value">{overallPosition}</span>
        </div>
      </div>
    </div>

    <table class="results-table">
      <thead>
        <tr>
          <th style="width: 25%;">Subject</th>
          <th style="width: 15%;">Test 1<br><small>(20%)</small></th>
          <th style="width: 15%;">Test 2<br><small>(20%)</small></th>
          <th style="width: 15%;">Exam<br><small>(60%)</small></th>
          <th style="width: 15%;">Total<br><small>(100%)</small></th>
          <th style="width: 10%;">Grade</th>
          <th style="width: 10%;">Position</th>
        </tr>
      </thead>
      <tbody>
        {subjectRows}
      </tbody>
    </table>

    <div class="summary">
      <div class="summary-card">
        <div class="summary-title">Total Score</div>
        <div class="summary-value">{totalScore}</div>
      </div>
      <div class="summary-card">
        <div class="summary-title">Average Score</div>
        <div class="summary-value">{averageScore}%</div>
      </div>
      <div class="summary-card">
        <div class="summary-title">Overall Grade</div>
        <div class="grade-display">{grade}</div>
      </div>
    </div>

    <div class="comments">
      <div class="comment-section">
        <div class="comment-title">Class Teacher's Comment:</div>
        <div class="comment-box">
          {classTeacherComment}
        </div>
      </div>
      <div class="comment-section">
        <div class="comment-title">Principal's Comment:</div>
        <div class="comment-box">
          {principalComment}
        </div>
      </div>
    </div>

    {nextTermSection}

    <div class="footer">
      <p><strong>Note:</strong> This result is computer-generated and valid only when signed and stamped by the school authority.</p>
      <p>Generated on {timestamp}</p>
    </div>
  </body>
  </html>
`;

export const STUDENT_RECORD_TEMPLATE = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Student Record Template - {className} {subjectName}</title>
    <style>{styles}</style>
  </head>
  <body>
    ${SCHOOL_HEADER_TEMPLATE}

    <div class="template-title">Student Record Template</div>

    <div class="class-info">
      <div class="info-item">
        <div class="info-label">Class</div>
        <div class="info-value">{className}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Subject</div>
        <div class="info-value">{subjectName} ({subjectCode})</div>
      </div>
      <div class="info-item">
        <div class="info-label">Term & Session</div>
        <div class="info-value">{term} - {session}</div>
      </div>
    </div>

    <div class="score-info">
      <div class="score-item">
        <div class="score-label">Test 1</div>
        <div class="score-value">/{maxTest1}</div>
      </div>
      <div class="score-item">
        <div class="score-label">Test 2</div>
        <div class="score-value">/{maxTest2}</div>
      </div>
      <div class="score-item">
        <div class="score-label">Exam</div>
        <div class="score-value">/{maxExam}</div>
      </div>
    </div>

    <table class="records-table">
      <thead>
        <tr>
          <th class="row-number">S/N</th>
          <th class="student-name">Student Name</th>
          <th class="score-input">Test 1 (20%)</th>
          <th class="score-input">Test 2 (20%)</th>
          <th class="score-input">Exam (60%)</th>
        </tr>
      </thead>
      <tbody>
        {studentRows}
      </tbody>
    </table>

    <div class="supervisor-section">
      <div class="supervisor-info">
        <div class="supervisor-details">
          <span class="supervisor-label">Subject Supervisor:</span>
          <span class="supervisor-name">{supervisorName}</span>
        </div>
        <div class="date-section">
          <span class="supervisor-label">Date Submitted:</span>
          <span class="date-line">_________________</span>
        </div>
      </div>
      
      <div class="signature-area">
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-label">Supervisor Signature</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Generated on {timestamp}</p>
    </div>
  </body>
  </html>
`;