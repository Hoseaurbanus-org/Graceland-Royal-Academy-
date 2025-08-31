import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Code, Database, Settings, CheckCircle, Copy, ExternalLink, AlertTriangle, Crown } from 'lucide-react';
import { getEnvironmentInfo } from '../lib/supabase';

export function SetupGuide() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const envInfo = getEnvironmentInfo();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const sqlSchema = `-- Graceland Royal Academy Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (staff, parents, admins)
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'subject_supervisor', 'class_supervisor', 'parent', 'accountant')),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  password_changed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  passport_number VARCHAR(50),
  passport_expiry_date DATE,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
  class_id UUID,
  parent_id UUID,
  admission_date DATE,
  blood_group VARCHAR(10),
  allergies TEXT,
  emergency_contact VARCHAR(255),
  emergency_phone VARCHAR(50),
  medical_conditions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes table
CREATE TABLE classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  level VARCHAR(50) NOT NULL,
  section VARCHAR(10),
  capacity INTEGER DEFAULT 30,
  class_supervisor_id UUID,
  academic_year VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects table
CREATE TABLE subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Class-Subject assignments
CREATE TABLE class_subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES classes(id),
  subject_id UUID NOT NULL REFERENCES subjects(id),
  subject_supervisor_id UUID REFERENCES users(id),
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, subject_id)
);

-- Results table
CREATE TABLE results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id),
  subject_id UUID NOT NULL REFERENCES subjects(id),
  class_id UUID NOT NULL REFERENCES classes(id),
  term_id VARCHAR(50) NOT NULL,
  session_id VARCHAR(50) NOT NULL,
  test_1_score DECIMAL(5,2) DEFAULT 0,
  test_2_score DECIMAL(5,2) DEFAULT 0,
  exam_score DECIMAL(5,2) DEFAULT 0,
  total_score DECIMAL(5,2) GENERATED ALWAYS AS (test_1_score + test_2_score + exam_score) STORED,
  grade VARCHAR(5),
  remarks TEXT,
  subject_supervisor_id UUID REFERENCES users(id),
  submitted_by UUID REFERENCES users(id),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  target_role VARCHAR(50),
  target_user_id UUID REFERENCES users(id),
  is_global BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fee payments table
CREATE TABLE fee_payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_type VARCHAR(50) NOT NULL,
  term VARCHAR(50) NOT NULL,
  session VARCHAR(50) NOT NULL,
  payment_date DATE NOT NULL,
  receipt_number VARCHAR(100) UNIQUE NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_parent_id ON students(parent_id);
CREATE INDEX idx_results_student_id ON results(student_id);
CREATE INDEX idx_results_subject_id ON results(subject_id);
CREATE INDEX idx_results_class_id ON results(class_id);
CREATE INDEX idx_results_status ON results(status);
CREATE INDEX idx_notifications_target_role ON notifications(target_role);
CREATE INDEX idx_notifications_target_user_id ON notifications(target_user_id);
CREATE INDEX idx_fee_payments_student_id ON fee_payments(student_id);

-- Insert default admin user
INSERT INTO users (email, password_hash, role, full_name, is_active) 
VALUES ('admin@gra.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'System Administrator', true);

-- Insert sample subjects
INSERT INTO subjects (name, code, is_active) VALUES
('Mathematics', 'MATH', true),
('English Language', 'ENG', true),
('Physics', 'PHY', true),
('Chemistry', 'CHEM', true),
('Biology', 'BIO', true),
('Geography', 'GEO', true),
('History', 'HIST', true),
('Computer Science', 'CS', true);

-- Insert sample classes
INSERT INTO classes (name, level, academic_year, is_active) VALUES
('JSS 1A', 'Junior Secondary', '2024/2025', true),
('JSS 1B', 'Junior Secondary', '2024/2025', true),
('JSS 2A', 'Junior Secondary', '2024/2025', true),
('JSS 2B', 'Junior Secondary', '2024/2025', true),
('JSS 3A', 'Junior Secondary', '2024/2025', true),
('SS 1A', 'Senior Secondary', '2024/2025', true),
('SS 1B', 'Senior Secondary', '2024/2025', true),
('SS 2A', 'Senior Secondary', '2024/2025', true),
('SS 2B', 'Senior Secondary', '2024/2025', true),
('SS 3A', 'Senior Secondary', '2024/2025', true);`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-chart-1 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Graceland Royal Academy</h1>
              <p className="text-chart-2 font-semibold">WISDOM & ILLUMINATION</p>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Database Setup Guide</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Follow these steps to connect your Supabase database and make the system fully functional with real-time data synchronization.
          </p>
        </div>

        {/* Status Alert */}
        {!envInfo.isSupabaseConfigured && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Demo Mode Active:</strong> The system is currently running with local storage. 
              Complete the setup below to enable real-time database functionality.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="supabase" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="supabase">
              <Database className="w-4 h-4 mr-2" />
              Supabase Setup
            </TabsTrigger>
            <TabsTrigger value="database">
              <Code className="w-4 h-4 mr-2" />
              Database Schema
            </TabsTrigger>
            <TabsTrigger value="environment">
              <Settings className="w-4 h-4 mr-2" />
              Environment
            </TabsTrigger>
          </TabsList>

          {/* Supabase Setup */}
          <TabsContent value="supabase" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Step 1: Create Supabase Project
                </CardTitle>
                <CardDescription>
                  Set up your Supabase project to enable real-time database functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">1. Go to Supabase Dashboard</p>
                      <p className="text-sm text-gray-600">Create a new project or use an existing one</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open('https://app.supabase.com', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Supabase
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">2. Get Project Credentials</p>
                      <p className="text-sm text-gray-600">Copy your Project URL and Anonymous Key</p>
                    </div>
                    <Badge variant="outline">Project Settings → API</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">3. Run Database Schema</p>
                      <p className="text-sm text-gray-600">Execute the SQL schema in the Database tab</p>
                    </div>
                    <Badge variant="outline">SQL Editor</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Schema */}
          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Step 2: Database Schema
                </CardTitle>
                <CardDescription>
                  Copy and run this SQL in your Supabase SQL Editor to create all necessary tables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      This will create all tables, indexes, and sample data for the school management system
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(sqlSchema, 'schema')}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copiedText === 'schema' ? 'Copied!' : 'Copy SQL'}
                    </Button>
                  </div>
                  
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                    <pre className="text-xs font-mono">{sqlSchema}</pre>
                  </div>
                  
                  <Alert className="bg-blue-50 border-blue-200">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Note:</strong> This schema includes sample data with a default admin account 
                      (admin@gra.edu / admin123) and basic subjects and classes.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Environment Setup */}
          <TabsContent value="environment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Step 3: Environment Configuration
                </CardTitle>
                <CardDescription>
                  Configure your environment variables to connect to Supabase
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">Create Environment File</p>
                    <p className="text-sm text-gray-600 mb-3">
                      Create a <code className="bg-gray-100 px-1 rounded">.env.local</code> file in your project root with these variables:
                    </p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                      <pre className="text-xs font-mono">{`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here`}</pre>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => copyToClipboard(`VITE_SUPABASE_URL=https://your-project-id.supabase.co\nVITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here`, 'env')}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copiedText === 'env' ? 'Copied!' : 'Copy Template'}
                    </Button>
                  </div>

                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Security:</strong> The anonymous key is safe to expose in frontend applications. 
                      Row Level Security (RLS) policies control data access.
                    </AlertDescription>
                  </Alert>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Current Status:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${envInfo.isSupabaseConfigured ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm">
                          Supabase {envInfo.isSupabaseConfigured ? 'Configured' : 'Not Configured'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${envInfo.hasAnonKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm">
                          Anonymous Key {envInfo.hasAnonKey ? 'Present' : 'Missing'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary to-chart-1 text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Ready to Go Live?</h3>
            <p className="text-blue-100 mb-4">
              Once you've completed the setup, refresh the page to start using the real-time system
            </p>
            <Button 
              variant="secondary" 
              onClick={() => window.location.reload()}
              className="bg-chart-4 text-white hover:bg-chart-4/90"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Refresh & Connect
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}