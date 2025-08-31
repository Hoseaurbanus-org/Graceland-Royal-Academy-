-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and role management
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'supervisor', 'accountant', 'parent')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- School configuration
CREATE TABLE IF NOT EXISTS school_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_name VARCHAR(255) NOT NULL DEFAULT 'Graceland Royal Academy',
  school_motto VARCHAR(255) NOT NULL DEFAULT 'WISDOM & ILLUMINATION',
  current_session VARCHAR(50) NOT NULL,
  current_term VARCHAR(20) NOT NULL CHECK (current_term IN ('First Term', 'Second Term', 'Third Term')),
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default school config
INSERT INTO school_config (school_name, school_motto, current_session, current_term) 
VALUES ('Graceland Royal Academy', 'WISDOM & ILLUMINATION', '2024/2025', 'First Term')
ON CONFLICT DO NOTHING;

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  level INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admission_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
  class_id UUID NOT NULL REFERENCES classes(id),
  passport_photo_url TEXT,
  parent_email VARCHAR(255),
  parent_phone VARCHAR(20),
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link students to parent users
CREATE TABLE IF NOT EXISTS student_parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship VARCHAR(50) NOT NULL DEFAULT 'Parent/Guardian',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, parent_id)
);

-- Supervisor assignments (simplified - one supervisor role for multiple classes/subjects)
CREATE TABLE IF NOT EXISTS supervisor_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supervisor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(supervisor_id, class_id, subject_id)
);

-- Student results/scores
CREATE TABLE IF NOT EXISTS student_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  session VARCHAR(50) NOT NULL,
  term VARCHAR(20) NOT NULL CHECK (term IN ('First Term', 'Second Term', 'Third Term')),
  test1_score DECIMAL(5,2) DEFAULT 0 CHECK (test1_score >= 0 AND test1_score <= 20),
  test2_score DECIMAL(5,2) DEFAULT 0 CHECK (test2_score >= 0 AND test2_score <= 20),
  exam_score DECIMAL(5,2) DEFAULT 0 CHECK (exam_score >= 0 AND exam_score <= 60),
  total_score DECIMAL(5,2) GENERATED ALWAYS AS (test1_score + test2_score + exam_score) STORED,
  grade VARCHAR(2),
  remark TEXT,
  submitted_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  is_approved BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, subject_id, session, term)
);

-- Fee structure
CREATE TABLE IF NOT EXISTS fee_structure (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  session VARCHAR(50) NOT NULL,
  term VARCHAR(20) NOT NULL CHECK (term IN ('First Term', 'Second Term', 'Third Term')),
  tuition_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  other_fees DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_fee DECIMAL(10,2) GENERATED ALWAYS AS (tuition_fee + other_fees) STORED,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, session, term)
);

-- Fee payments
CREATE TABLE IF NOT EXISTS fee_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  session VARCHAR(50) NOT NULL,
  term VARCHAR(20) NOT NULL CHECK (term IN ('First Term', 'Second Term', 'Third Term')),
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  receipt_number VARCHAR(100) UNIQUE NOT NULL,
  bank_name VARCHAR(100),
  teller_number VARCHAR(100),
  verified_by UUID REFERENCES users(id),
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- School calendar events
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Result approval workflow
CREATE TABLE IF NOT EXISTS result_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id),
  session VARCHAR(50) NOT NULL,
  term VARCHAR(20) NOT NULL CHECK (term IN ('First Term', 'Second Term', 'Third Term')),
  approved_by UUID NOT NULL REFERENCES users(id),
  approval_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, session, term)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_admission_number ON students(admission_number);
CREATE INDEX IF NOT EXISTS idx_student_scores_student_id ON student_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_student_scores_session_term ON student_scores(session, term);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student_id ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_assignments_supervisor ON supervisor_assignments(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Functions for automatic grade calculation
CREATE OR REPLACE FUNCTION calculate_grade(total_score DECIMAL)
RETURNS VARCHAR(2) AS $$
BEGIN
  CASE 
    WHEN total_score >= 70 THEN RETURN 'A';
    WHEN total_score >= 60 THEN RETURN 'B';
    WHEN total_score >= 50 THEN RETURN 'C';
    WHEN total_score >= 45 THEN RETURN 'D';
    WHEN total_score >= 40 THEN RETURN 'E';
    ELSE RETURN 'F';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate grade
CREATE OR REPLACE FUNCTION update_grade()
RETURNS TRIGGER AS $$
BEGIN
  NEW.grade := calculate_grade(NEW.total_score);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_grade
  BEFORE INSERT OR UPDATE ON student_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_grade();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_scores_updated_at BEFORE UPDATE ON student_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fee_structure_updated_at BEFORE UPDATE ON fee_structure FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fee_payments_updated_at BEFORE UPDATE ON fee_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_school_config_updated_at BEFORE UPDATE ON school_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO classes (name, level) VALUES
('JSS 1A', 7), ('JSS 1B', 7), ('JSS 2A', 8), ('JSS 2B', 8), ('JSS 3A', 9), ('JSS 3B', 9),
('SS 1A', 10), ('SS 1B', 10), ('SS 2A', 11), ('SS 2B', 11), ('SS 3A', 12), ('SS 3B', 12)
ON CONFLICT DO NOTHING;

INSERT INTO subjects (name, code) VALUES
('Mathematics', 'MATH'), ('English Language', 'ENG'), ('Physics', 'PHY'), ('Chemistry', 'CHEM'),
('Biology', 'BIO'), ('Geography', 'GEO'), ('History', 'HIST'), ('Economics', 'ECON'),
('Government', 'GOVT'), ('Literature', 'LIT'), ('Further Mathematics', 'FMATH'),
('Agricultural Science', 'AGRIC'), ('Computer Science', 'COMP'), ('Fine Arts', 'ART')
ON CONFLICT DO NOTHING;

-- Create default admin user (password should be hashed in real implementation)
INSERT INTO users (email, password_hash, role) VALUES
('admin@gracelandroyal.edu.ng', '$2b$10$rDHwFkpMjGIoIFYzpKY0TO7SMLQyHjqUKjqH8CgOEm0T9qGRuBHGK', 'admin')
ON CONFLICT DO NOTHING;