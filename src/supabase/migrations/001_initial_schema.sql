-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'subject_supervisor', 'class_supervisor', 'parent', 'accountant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  profile_data JSONB DEFAULT '{}'
);

-- Create staff table
CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('subject_supervisor', 'class_supervisor', 'accountant')),
  employee_id TEXT UNIQUE NOT NULL,
  primary_subject TEXT DEFAULT 'none',
  join_date DATE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  allocated_subjects JSONB DEFAULT '[]',
  allocated_classes JSONB DEFAULT '[]'
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  class TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  guardian_name TEXT,
  guardian_phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  registration_date DATE DEFAULT CURRENT_DATE,
  academic_session TEXT DEFAULT '2024/2025',
  current_term TEXT DEFAULT 'First Term',
  can_view_result BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parents table
CREATE TABLE IF NOT EXISTS parents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  children TEXT[] DEFAULT '{}',
  password_hash TEXT,
  is_registered BOOLEAN DEFAULT FALSE,
  notification_sent BOOLEAN DEFAULT FALSE,
  registration_date TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  can_view_results BOOLEAN DEFAULT TRUE,
  result_view_type TEXT DEFAULT 'individual' CHECK (result_view_type IN ('individual', 'class', 'none')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('primary', 'secondary')),
  capacity INTEGER NOT NULL DEFAULT 30,
  current_students INTEGER DEFAULT 0,
  supervisor UUID REFERENCES staff(id),
  supervisor_name TEXT,
  academic_session TEXT NOT NULL DEFAULT '2024/2025',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  max_scores JSONB NOT NULL DEFAULT '{"test1": 20, "test2": 20, "exam": 60}',
  assigned_staff TEXT[] DEFAULT '{}',
  assigned_classes TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create school_accounts table
CREATE TABLE IF NOT EXISTS school_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  sort_code TEXT,
  routing_number TEXT,
  swift_code TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_primary BOOLEAN DEFAULT FALSE,
  updated_by TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fee_structures table
CREATE TABLE IF NOT EXISTS fee_structures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session TEXT NOT NULL,
  term TEXT NOT NULL,
  class_name TEXT NOT NULL,
  fees JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  updated_by TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session, term, class_name)
);

-- Create result_records table
CREATE TABLE IF NOT EXISTS result_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  subject_id UUID REFERENCES subjects(id),
  subject_name TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  class_id UUID REFERENCES classes(id),
  class_name TEXT NOT NULL,
  session TEXT NOT NULL,
  term TEXT NOT NULL,
  scores JSONB NOT NULL,
  total DECIMAL(5,2) NOT NULL,
  grade TEXT NOT NULL,
  position INTEGER,
  submitted_by UUID REFERENCES staff(id),
  submitted_by_name TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES staff(id),
  approved_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parent_settings table
CREATE TABLE IF NOT EXISTS parent_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_email TEXT NOT NULL REFERENCES parents(email),
  can_view_results BOOLEAN DEFAULT TRUE,
  result_view_type TEXT DEFAULT 'individual' CHECK (result_view_type IN ('individual', 'class', 'none')),
  allowed_classes TEXT[] DEFAULT '{}',
  allowed_students TEXT[] DEFAULT '{}',
  updated_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create password_change_logs table
CREATE TABLE IF NOT EXISTS password_change_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES staff(id),
  staff_email TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'reset')),
  old_password_hash TEXT,
  new_password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_employee_id ON staff(employee_id);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
CREATE INDEX IF NOT EXISTS idx_students_parent_email ON students(parent_email);
CREATE INDEX IF NOT EXISTS idx_parents_email ON parents(email);
CREATE INDEX IF NOT EXISTS idx_result_records_student_id ON result_records(student_id);
CREATE INDEX IF NOT EXISTS idx_result_records_class_name ON result_records(class_name);
CREATE INDEX IF NOT EXISTS idx_result_records_session_term ON result_records(session, term);
CREATE INDEX IF NOT EXISTS idx_fee_structures_class_session_term ON fee_structures(class_name, session, term);
CREATE INDEX IF NOT EXISTS idx_school_accounts_is_primary ON school_accounts(is_primary) WHERE is_primary = TRUE;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_school_accounts_updated_at BEFORE UPDATE ON school_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fee_structures_updated_at BEFORE UPDATE ON fee_structures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_result_records_updated_at BEFORE UPDATE ON result_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parent_settings_updated_at BEFORE UPDATE ON parent_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_change_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON staff FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON students FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON parents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON classes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON subjects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON school_accounts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON fee_structures FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON result_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON parent_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON password_change_logs FOR ALL USING (auth.role() = 'authenticated');

-- Insert default data
INSERT INTO classes (id, name, level, capacity, academic_session) VALUES
  (gen_random_uuid(), 'Primary 1', 'primary', 30, '2024/2025'),
  (gen_random_uuid(), 'Primary 2', 'primary', 30, '2024/2025'),
  (gen_random_uuid(), 'Primary 3', 'primary', 30, '2024/2025'),
  (gen_random_uuid(), 'Primary 4', 'primary', 30, '2024/2025'),
  (gen_random_uuid(), 'Primary 5', 'primary', 30, '2024/2025'),
  (gen_random_uuid(), 'Primary 6', 'primary', 30, '2024/2025'),
  (gen_random_uuid(), 'JSS 1', 'secondary', 25, '2024/2025'),
  (gen_random_uuid(), 'JSS 2', 'secondary', 25, '2024/2025'),
  (gen_random_uuid(), 'JSS 3', 'secondary', 25, '2024/2025'),
  (gen_random_uuid(), 'SSS 1', 'secondary', 25, '2024/2025'),
  (gen_random_uuid(), 'SSS 2', 'secondary', 25, '2024/2025'),
  (gen_random_uuid(), 'SSS 3', 'secondary', 25, '2024/2025')
ON CONFLICT (name) DO NOTHING;

INSERT INTO subjects (id, name, code, max_scores) VALUES
  (gen_random_uuid(), 'English Language', 'ENG', '{"test1": 20, "test2": 20, "exam": 60}'),
  (gen_random_uuid(), 'Mathematics', 'MATH', '{"test1": 20, "test2": 20, "exam": 60}'),
  (gen_random_uuid(), 'Basic Science', 'BSC', '{"test1": 20, "test2": 20, "exam": 60}'),
  (gen_random_uuid(), 'Social Studies', 'SOC', '{"test1": 20, "test2": 20, "exam": 60}'),
  (gen_random_uuid(), 'Christian Religious Education', 'CRE', '{"test1": 20, "test2": 20, "exam": 60}'),
  (gen_random_uuid(), 'Physical & Health Education', 'PHE', '{"test1": 20, "test2": 20, "exam": 60}'),
  (gen_random_uuid(), 'Physics', 'PHY', '{"test1": 20, "test2": 20, "exam": 60}'),
  (gen_random_uuid(), 'Chemistry', 'CHEM', '{"test1": 20, "test2": 20, "exam": 60}'),
  (gen_random_uuid(), 'Biology', 'BIO', '{"test1": 20, "test2": 20, "exam": 60}'),
  (gen_random_uuid(), 'Geography', 'GEO', '{"test1": 20, "test2": 20, "exam": 60}'),
  (gen_random_uuid(), 'History', 'HIST', '{"test1": 20, "test2": 20, "exam": 60}'),
  (gen_random_uuid(), 'Economics', 'ECON', '{"test1": 20, "test2": 20, "exam": 60}'),
  (gen_random_uuid(), 'Accounting', 'ACC', '{"test1": 20, "test2": 20, "exam": 60}'),
  (gen_random_uuid(), 'Literature in English', 'LIT', '{"test1": 20, "test2": 20, "exam": 60}');

INSERT INTO school_accounts (id, bank_name, account_name, account_number, sort_code, is_active, is_primary, updated_by, description) VALUES
  (gen_random_uuid(), 'First Bank Nigeria', 'Graceland Royal Academy', '2023456789', '011-152-003', TRUE, TRUE, 'system', 'Primary school account for fee payments');