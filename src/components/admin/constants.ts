// Import the new school logo
import schoolLogo from 'figma:asset/f9f8e5655457e1be50e841e78cb4827059d96895.png';

// For fallback, we'll keep a data URL for the logo in case the import doesn't work
const schoolLogoDataUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ4IiBmaWxsPSIjMDMwMjEzIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iNCIvPgo8dGV4dCB4PSI1MCIgeT0iNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5HUkE8L3RleHQ+Cjx0ZXh0IHg9IjUwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RWR1Y2F0aW9uPC90ZXh0Pgo8L3N2Zz4K";

export const SCHOOL_INFO = {
  name: 'Graceland Royal Academy',
  motto: 'Wisdom & Illumination',
  address: 'God\'s Glorious Tabernacle of witness, Opposite NNPC Depot, After NEWMAP, Tumfure, Gombe',
  phone: '+234 806 123 4567',
  email: 'info@gracelandroyal.edu.ng',
  website: 'www.gracelandroyal.edu.ng',
  logo: schoolLogo || schoolLogoDataUrl, // Use the imported logo or fallback
  logoDataUrl: schoolLogo || schoolLogoDataUrl // For PDF generation
};

// Student ID generation format
export const STUDENT_ID_CONFIG = {
  currentYear: '25', // 2025
  primaryPrefix: 'gra25/pry',
  secondaryPrefix: 'gra25/sec',
  counterDigits: 3 // 001, 002, etc.
};

// Default user credentials for initial setup
export const DEFAULT_ADMIN = {
  email: 'admin@gracelandroyal.edu.ng',
  password: 'admin123',
  name: 'System Administrator',
  role: 'admin' as const
};

// Subject categories
export const SUBJECT_CATEGORIES = {
  primary: [
    'Mathematics',
    'English Language', 
    'Basic Science',
    'Social Studies',
    'Religious Studies',
    'Creative Arts',
    'Physical Education',
    'Computer Studies'
  ],
  secondary: [
    'Mathematics',
    'English Language',
    'Biology',
    'Chemistry', 
    'Physics',
    'Geography',
    'History',
    'Economics',
    'Government',
    'Literature',
    'Computer Science',
    'Further Mathematics'
  ]
};

// Class levels and their configurations
export const CLASS_LEVELS = {
  primary: {
    'Primary 1': { prefix: 'pry', subjects: SUBJECT_CATEGORIES.primary },
    'Primary 2': { prefix: 'pry', subjects: SUBJECT_CATEGORIES.primary },
    'Primary 3': { prefix: 'pry', subjects: SUBJECT_CATEGORIES.primary },
    'Primary 4': { prefix: 'pry', subjects: SUBJECT_CATEGORIES.primary },
    'Primary 5': { prefix: 'pry', subjects: SUBJECT_CATEGORIES.primary },
    'Primary 6': { prefix: 'pry', subjects: SUBJECT_CATEGORIES.primary }
  },
  secondary: {
    'JSS 1': { prefix: 'sec', subjects: SUBJECT_CATEGORIES.secondary },
    'JSS 2': { prefix: 'sec', subjects: SUBJECT_CATEGORIES.secondary },
    'JSS 3': { prefix: 'sec', subjects: SUBJECT_CATEGORIES.secondary },
    'SS 1': { prefix: 'sec', subjects: SUBJECT_CATEGORIES.secondary },
    'SS 2': { prefix: 'sec', subjects: SUBJECT_CATEGORIES.secondary },
    'SS 3': { prefix: 'sec', subjects: SUBJECT_CATEGORIES.secondary }
  }
};

// Payment fee structure
export const FEE_STRUCTURE = {
  primary: {
    tuition: 15000,
    development: 5000,
    sports: 2000,
    library: 1000,
    pta: 1000,
    total: 24000
  },
  secondary: {
    tuition: 20000,
    development: 7000,
    laboratory: 3000,
    sports: 2000,
    library: 1500,
    pta: 1500,
    total: 35000
  }
};

// Initial sample data
export const INITIAL_SUBJECTS = [
  { id: '1', name: 'Mathematics', code: 'MATH', category: 'Core', level: 'All', assignedStaff: [] },
  { id: '2', name: 'English Language', code: 'ENG', category: 'Core', level: 'All', assignedStaff: [] },
  { id: '3', name: 'Basic Science', code: 'SCI', category: 'Core', level: 'Primary', assignedStaff: [] },
  { id: '4', name: 'Biology', code: 'BIO', category: 'Science', level: 'Secondary', assignedStaff: [] },
  { id: '5', name: 'Chemistry', code: 'CHE', category: 'Science', level: 'Secondary', assignedStaff: [] },
  { id: '6', name: 'Physics', code: 'PHY', category: 'Science', level: 'Secondary', assignedStaff: [] }
];

export const INITIAL_CLASSES = [
  {
    id: 'class_001',
    name: 'Primary 1A',
    level: 'Primary 1',
    capacity: 30,
    currentStudents: 0,
    supervisor: 'Mrs. Sarah Johnson',
    academicSession: '2024/2025'
  },
  {
    id: 'class_002', 
    name: 'Primary 2A',
    level: 'Primary 2',
    capacity: 30,
    currentStudents: 0,
    supervisor: 'Mr. David Wilson',
    academicSession: '2024/2025'
  },
  {
    id: 'class_003',
    name: 'JSS 1A',
    level: 'JSS 1',
    capacity: 35,
    currentStudents: 0,
    supervisor: 'Mrs. Grace Adamu',
    academicSession: '2024/2025'
  },
  {
    id: 'class_004',
    name: 'SS 1A',
    level: 'SS 1', 
    capacity: 35,
    currentStudents: 0,
    supervisor: 'Mr. Emmanuel Bello',
    academicSession: '2024/2025'
  }
];

export const INITIAL_STAFF = [
  {
    id: 'staff_001',
    name: 'Mrs. Sarah Johnson',
    email: 'sarah.johnson@gracelandroyal.edu.ng',
    phone: '+234 801 234 5678',
    role: 'teacher' as const,
    subjects: ['Mathematics', 'English Language'],
    classes: ['Primary 1A'],
    employeeId: 'GRA/STF/001',
    dateJoined: '2023-09-01',
    qualification: 'B.Ed Mathematics',
    status: 'active' as const,
    password: 'teacher123' // Default password for new staff
  },
  {
    id: 'staff_002',
    name: 'Mr. David Wilson', 
    email: 'david.wilson@gracelandroyal.edu.ng',
    phone: '+234 802 345 6789',
    role: 'teacher' as const,
    subjects: ['Basic Science', 'Mathematics'],
    classes: ['Primary 2A'],
    employeeId: 'GRA/STF/002',
    dateJoined: '2023-09-01',
    qualification: 'B.Sc. Education',
    status: 'active' as const,
    password: 'teacher123'
  },
  {
    id: 'staff_003',
    name: 'Mrs. Grace Adamu',
    email: 'grace.adamu@gracelandroyal.edu.ng', 
    phone: '+234 803 456 7890',
    role: 'teacher' as const,
    subjects: ['English Language', 'Literature'],
    classes: ['JSS 1A'],
    employeeId: 'GRA/STF/003',
    dateJoined: '2023-09-01',
    qualification: 'B.A. English',
    status: 'active' as const,
    password: 'teacher123'
  },
  {
    id: 'staff_004',
    name: 'Mr. Emmanuel Bello',
    email: 'emmanuel.bello@gracelandroyal.edu.ng',
    phone: '+234 804 567 8901',
    role: 'teacher' as const,
    subjects: ['Mathematics', 'Physics'],
    classes: ['SS 1A'],
    employeeId: 'GRA/STF/004',
    dateJoined: '2023-09-01',
    qualification: 'B.Sc. Physics',
    status: 'active' as const,
    password: 'teacher123'
  }
];

export const INITIAL_STUDENTS = [
  {
    id: 'gra25/pry/001',
    name: 'Aisha Mohammed',
    class: 'Primary 1A',
    rollNumber: '001',
    guardianName: 'Mr. Mohammed Ibrahim',
    guardianPhone: '+234 805 123 4567',
    guardianEmail: 'mohammed.ibrahim@email.com',
    dateOfBirth: '2018-03-15',
    address: 'No. 12 Nasarawo Street, Gombe',
    registrationSession: '2024/2025',
    status: 'active' as const
  },
  {
    id: 'gra25/pry/002',
    name: 'John Yakubu',
    class: 'Primary 1A',
    rollNumber: '002', 
    guardianName: 'Mrs. Rebecca Yakubu',
    guardianPhone: '+234 806 234 5678',
    guardianEmail: 'rebecca.yakubu@email.com',
    dateOfBirth: '2018-05-20',
    address: 'No. 45 Pantami Layout, Gombe',
    registrationSession: '2024/2025',
    status: 'active' as const
  },
  {
    id: 'gra25/pry/003',
    name: 'Blessing Daniel',
    class: 'Primary 2A',
    rollNumber: '001',
    guardianName: 'Mr. Daniel Musa',
    guardianPhone: '+234 807 345 6789',
    guardianEmail: 'daniel.musa@email.com',
    dateOfBirth: '2017-08-10',
    address: 'No. 78 Federal Low Cost, Gombe',
    registrationSession: '2024/2025',
    status: 'active' as const
  },
  {
    id: 'gra25/sec/001',
    name: 'Ibrahim Aliyu',
    class: 'JSS 1A',
    rollNumber: '001',
    guardianName: 'Alhaji Aliyu Garba',
    guardianPhone: '+234 808 456 7890',
    guardianEmail: 'aliyu.garba@email.com',
    dateOfBirth: '2011-12-05',
    address: 'No. 23 Jekadafari, Gombe',
    registrationSession: '2024/2025',
    status: 'active' as const
  },
  {
    id: 'gra25/sec/002',
    name: 'Mary Joseph',
    class: 'SS 1A',
    rollNumber: '001',
    guardianName: 'Mr. Joseph Markus',
    guardianPhone: '+234 809 567 8901',
    guardianEmail: 'joseph.markus@email.com', 
    dateOfBirth: '2009-04-18',
    address: 'No. 156 Tudun Hatsi, Gombe',
    registrationSession: '2024/2025',
    status: 'active' as const
  }
];