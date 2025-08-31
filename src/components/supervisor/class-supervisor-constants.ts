export const TAB_CONFIG = {
  OVERVIEW: 'overview',
  STUDENT_MANAGEMENT: 'student-management', 
  RESULT_APPROVAL: 'result-approval'
} as const;

export const APPROVAL_STATUS = {
  APPROVED: 'approved',
  PENDING: 'pending',
  ALL: 'all'
} as const;

export const GRADE_COLORS = {
  A: 'bg-green-100 text-green-800',
  B: 'bg-blue-100 text-blue-800', 
  C: 'bg-yellow-100 text-yellow-800',
  D: 'bg-orange-100 text-orange-800',
  F: 'bg-red-100 text-red-800'
} as const;

export const RESULT_STATUS_COLORS = {
  approved: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
} as const;

export const STATS_ICONS = {
  STUDENTS: 'Users',
  RESULTS: 'FileText', 
  APPROVED: 'CheckCircle2',
  PENDING: 'Clock',
  COMPLETION: 'BarChart3'
} as const;

export const SEARCH_PLACEHOLDERS = {
  STUDENTS: 'Search students...',
  RESULTS: 'Search by student or subject...'
} as const;

export const MESSAGES = {
  NO_CLASSES: 'No classes allocated yet',
  NO_STUDENTS: 'No students found in this class',
  NO_RESULTS: 'No results submitted yet',
  NO_SELECTION: 'Please select results to approve',
  APPROVAL_SUCCESS: 'Results approved successfully',
  APPROVAL_ERROR: 'Failed to approve results'
} as const;

export const PERMISSIONS = {
  CAN_APPROVE_RESULTS: true,
  CAN_VIEW_STUDENTS: true,
  CAN_PRINT_RESULTS: false, // Only admins can print
  CAN_MANAGE_STUDENTS: false
} as const;