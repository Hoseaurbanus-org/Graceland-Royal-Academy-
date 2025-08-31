export const RECEIPT_STYLES = `
  body { 
    font-family: Arial, sans-serif; 
    max-width: 600px; 
    margin: 0 auto; 
    padding: 20px;
    background: white;
    line-height: 1.6;
  }
  .header { 
    text-align: center; 
    border-bottom: 3px solid #2563eb; 
    padding-bottom: 20px; 
    margin-bottom: 30px;
  }
  .school-logo {
    width: 60px;
    height: 60px;
    margin: 0 auto 10px;
    background: #2563eb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 24px;
  }
  .school-name { 
    font-size: 26px; 
    font-weight: bold; 
    color: #1e40af; 
    margin-bottom: 5px;
    text-transform: uppercase;
  }
  .school-motto { 
    font-style: italic; 
    color: #6366f1; 
    margin-bottom: 10px;
    font-size: 14px;
  }
  .contact-info {
    font-size: 12px;
    color: #64748b;
    line-height: 1.4;
  }
  .receipt-title {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: white;
    padding: 15px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    margin: 25px 0;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  .receipt-details { 
    background: #f8fafc;
    padding: 20px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
  }
  .detail-row { 
    display: flex; 
    justify-content: space-between; 
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #e2e8f0;
  }
  .detail-row:last-child {
    border-bottom: none;
  }
  .detail-label { 
    font-weight: 600;
    color: #374151;
    flex: 1;
  }
  .detail-value {
    font-weight: 500;
    color: #1f2937;
    text-align: right;
    flex: 1;
  }
  .amount-section {
    margin: 25px 0;
    text-align: center;
  }
  .amount { 
    font-size: 28px; 
    font-weight: bold; 
    color: #059669;
    padding: 20px;
    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
    border: 2px solid #059669;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .signature-section {
    display: flex;
    justify-content: space-between;
    margin-top: 40px;
    gap: 40px;
  }
  .signature-box {
    flex: 1;
    text-align: center;
    padding-top: 40px;
    border-top: 2px solid #374151;
    font-weight: 600;
    color: #374151;
  }
  .footer { 
    margin-top: 40px; 
    padding-top: 20px; 
    border-top: 2px solid #e5e7eb; 
    text-align: center;
    background: #f9fafb;
    border-radius: 8px;
    padding: 20px;
  }
  .footer-note {
    font-size: 11px;
    color: #6b7280;
    margin-bottom: 10px;
    font-weight: 500;
  }
  .timestamp {
    font-size: 10px;
    color: #9ca3af;
  }
  @media print {
    body { margin: 0; padding: 15px; }
    .receipt-title { break-inside: avoid; }
    .signature-section { break-inside: avoid; }
  }
`;

export const RESULT_CARD_STYLES = `
  body { 
    font-family: Arial, sans-serif; 
    max-width: 900px; 
    margin: 0 auto; 
    padding: 20px;
    background: white;
    line-height: 1.5;
  }
  .header { 
    text-align: center; 
    border-bottom: 3px solid #1e40af; 
    padding-bottom: 20px; 
    margin-bottom: 30px;
  }
  .school-logo {
    width: 70px;
    height: 70px;
    margin: 0 auto 15px;
    background: #1e40af;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 28px;
  }
  .school-name { 
    font-size: 32px; 
    font-weight: bold; 
    color: #1e40af; 
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .school-motto { 
    font-style: italic; 
    color: #6366f1; 
    margin-bottom: 12px;
    font-size: 16px;
  }
  .contact-info {
    font-size: 12px;
    color: #64748b;
  }
  .result-title {
    background: linear-gradient(135deg, #1e40af, #3730a3);
    color: white;
    padding: 18px;
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    margin: 25px 0;
    border-radius: 10px;
    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .student-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-bottom: 30px;
    padding: 25px;
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }
  .info-column {
    space-y: 12px;
  }
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #cbd5e1;
  }
  .info-label {
    font-weight: 600;
    color: #374151;
  }
  .info-value {
    font-weight: 500;
    color: #1f2937;
  }
  .results-table {
    width: 100%;
    border-collapse: collapse;
    margin: 25px 0;
    background: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0,0,0,0.07);
  }
  .results-table th {
    background: linear-gradient(135deg, #374151, #4b5563);
    color: white;
    padding: 15px 10px;
    text-align: center;
    font-weight: 600;
    font-size: 14px;
    border: 1px solid #6b7280;
  }
  .results-table td {
    padding: 12px 10px;
    text-align: center;
    border: 1px solid #d1d5db;
    font-size: 13px;
  }
  .results-table tbody tr:nth-child(even) {
    background: #f9fafb;
  }
  .results-table tbody tr:hover {
    background: #f3f4f6;
  }
  .subject-name {
    text-align: left !important;
    font-weight: 600;
    color: #374151;
  }
  .score-cell {
    font-weight: 500;
  }
  .total-cell {
    font-weight: 700;
    color: #059669;
    font-size: 14px;
  }
  .grade-cell {
    font-weight: 700;
    font-size: 14px;
  }
  .summary {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    margin: 30px 0;
  }
  .summary-card {
    padding: 20px;
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    border-radius: 12px;
    text-align: center;
    border: 1px solid #93c5fd;
  }
  .summary-title {
    font-weight: 600;
    margin-bottom: 8px;
    color: #1e40af;
    font-size: 14px;
  }
  .summary-value {
    font-size: 24px;
    font-weight: bold;
    color: #1e3a8a;
  }
  .grade-display {
    font-size: 28px;
    font-weight: bold;
    color: #dc2626;
  }
  .comments {
    margin-top: 35px;
    padding: 25px;
    background: #f9fafb;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  }
  .comment-section {
    margin-bottom: 20px;
  }
  .comment-title {
    font-weight: 600;
    margin-bottom: 10px;
    color: #374151;
    font-size: 14px;
  }
  .comment-box {
    min-height: 50px;
    border: 2px solid #d1d5db;
    padding: 12px;
    background: white;
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.5;
  }
  .next-term {
    text-align: center;
    margin-top: 30px;
    padding: 18px;
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    border-radius: 10px;
    border: 2px solid #f59e0b;
    font-weight: 600;
    color: #92400e;
    font-size: 16px;
  }
  .footer { 
    margin-top: 40px; 
    padding-top: 20px; 
    border-top: 2px solid #e5e7eb; 
    text-align: center;
    font-size: 11px;
    color: #6b7280;
    background: #f9fafb;
    border-radius: 8px;
    padding: 20px;
  }
  @media print {
    body { margin: 0; padding: 15px; font-size: 12px; }
    .results-table { break-inside: avoid; }
    .summary { break-inside: avoid; }
    .comments { break-inside: avoid; }
  }
`;

export const STUDENT_RECORD_STYLES = `
  body { 
    font-family: Arial, sans-serif; 
    max-width: 900px; 
    margin: 0 auto; 
    padding: 20px;
    background: white;
    line-height: 1.5;
  }
  .header { 
    text-align: center; 
    border-bottom: 3px solid #1e40af; 
    padding-bottom: 20px; 
    margin-bottom: 30px;
  }
  .school-logo {
    width: 60px;
    height: 60px;
    margin: 0 auto 15px;
    background: #1e40af;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 24px;
  }
  .school-name { 
    font-size: 28px; 
    font-weight: bold; 
    color: #1e40af; 
    margin-bottom: 8px;
    text-transform: uppercase;
  }
  .template-title {
    background: linear-gradient(135deg, #059669, #047857);
    color: white;
    padding: 18px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    margin: 25px 0;
    border-radius: 10px;
    text-transform: uppercase;
  }
  .class-info {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
  }
  .info-item {
    text-align: center;
  }
  .info-label {
    font-weight: 600;
    color: #374151;
    font-size: 12px;
    text-transform: uppercase;
    margin-bottom: 5px;
  }
  .info-value {
    font-weight: 700;
    color: #1f2937;
    font-size: 16px;
  }
  .score-info {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-bottom: 25px;
    padding: 15px;
    background: #fef3c7;
    border-radius: 8px;
    border: 1px solid #f59e0b;
  }
  .score-item {
    text-align: center;
    font-size: 14px;
  }
  .score-label {
    font-weight: 600;
    color: #92400e;
  }
  .score-value {
    font-weight: 700;
    color: #b45309;
    font-size: 16px;
  }
  .records-table {
    width: 100%;
    border-collapse: collapse;
    margin: 25px 0;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0,0,0,0.07);
  }
  .records-table th {
    background: linear-gradient(135deg, #374151, #4b5563);
    color: white;
    padding: 15px 12px;
    text-align: center;
    font-weight: 600;
    font-size: 14px;
    border: 1px solid #6b7280;
  }
  .records-table td {
    padding: 12px;
    text-align: center;
    border: 1px solid #d1d5db;
    font-size: 13px;
    min-height: 40px;
  }
  .records-table tbody tr:nth-child(even) {
    background: #f9fafb;
  }
  .student-name {
    text-align: left !important;
    font-weight: 600;
    color: #374151;
    width: 40%;
  }
  .score-input {
    width: 20%;
    background: white;
    border: 1px solid #d1d5db;
  }
  .row-number {
    width: 8%;
    background: #f3f4f6;
    font-weight: 600;
    color: #6b7280;
  }
  .supervisor-section {
    margin-top: 40px;
    padding: 25px;
    background: #f9fafb;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
  }
  .supervisor-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  .supervisor-details {
    font-size: 14px;
  }
  .supervisor-label {
    font-weight: 600;
    color: #374151;
  }
  .supervisor-name {
    font-weight: 700;
    color: #1f2937;
    font-size: 16px;
  }
  .date-section {
    font-size: 14px;
  }
  .date-line {
    border-bottom: 1px solid #374151;
    display: inline-block;
    min-width: 150px;
  }
  .signature-area {
    text-align: center;
  }
  .signature-line {
    width: 250px;
    height: 1px;
    background: #374151;
    margin: 0 auto 10px;
  }
  .signature-label {
    font-weight: 600;
    color: #374151;
    font-size: 14px;
  }
  .footer { 
    margin-top: 40px; 
    padding-top: 20px; 
    border-top: 2px solid #e5e7eb; 
    text-align: center;
    font-size: 11px;
    color: #6b7280;
    background: #f9fafb;
    border-radius: 8px;
    padding: 20px;
  }
  @media print {
    body { margin: 0; padding: 15px; font-size: 12px; }
    .records-table { break-inside: avoid; }
    .supervisor-section { break-inside: avoid; }
  }
`;