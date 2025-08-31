import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Award, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Star,
  ChevronRight,
  Download,
  ExternalLink,
  Play,
  Heart,
  Target,
  TrendingUp,
  Globe,
  School,
  Library,
  Microscope,
  Palette,
  Music,
  Calculator,
  Languages,
  Activity,
  Shield,
  Lightbulb,
  ArrowRight,
  Check,
  FileText,
  CreditCard,
  LogIn,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { SchoolLogo } from '../SchoolLogo';
import { toast } from 'sonner@2.0.3';

// Types
interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image?: string;
  featured: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: 'academic' | 'sports' | 'cultural' | 'general';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  image?: string;
}

interface FacultyMember {
  id: string;
  name: string;
  position: string;
  department: string;
  qualifications: string[];
  image?: string;
  bio: string;
}

// Website Header Component
function WebsiteHeader({ onNavigate, activeSection }: { onNavigate: (section: string) => void; activeSection: string }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'academics', label: 'Academics' },
    { id: 'admissions', label: 'Admissions' },
    { id: 'news', label: 'News & Events' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and School Name */}
          <div className="flex items-center gap-3">
            <SchoolLogo size="md" showText={false} />
            <div>
              <h1 className="font-bold text-lg text-primary">Graceland Royal Academy</h1>
              <p className="text-xs text-muted-foreground">Wisdom & Illumination</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onNavigate(item.id)}
                className="transition-all"
              >
                {item.label}
              </Button>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="hidden sm:flex">
                  {user.role}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('dashboard')}
                >
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => onNavigate('login')}
                size="sm"
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 border-t pt-4"
            >
              <div className="flex flex-col gap-2">
                {navigationItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

// Hero Section Component
function HeroSection() {
  const stats = [
    { label: 'Students Enrolled', value: '1,200+', icon: Users },
    { label: 'Expert Teachers', value: '85+', icon: GraduationCap },
    { label: 'Years of Excellence', value: '25+', icon: Award },
    { label: 'Graduation Rate', value: '98%', icon: TrendingUp }
  ];

  return (
    <section className="relative py-20 bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="mb-4">Established 1999</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Nurturing Excellence in
              <span className="text-primary block">Education</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              At Graceland Royal Academy, we believe in the transformative power of education. 
              Our motto "Wisdom & Illumination" guides our commitment to developing well-rounded, 
              confident, and capable individuals ready to make a positive impact on the world.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" className="gap-2">
                <FileText className="h-4 w-4" />
                Apply for Admission
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Play className="h-4 w-4" />
                Take Virtual Tour
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="font-bold text-xl">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Hero Image/Video */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <School className="h-20 w-20 mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Campus Virtual Tour</p>
                <Button variant="outline" className="mt-4 gap-2">
                  <Play className="h-4 w-4" />
                  Watch Video
                </Button>
              </div>
            </div>
            
            {/* Floating Achievement Cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-6 -right-6 bg-card border rounded-lg p-3 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <div className="text-sm">
                  <div className="font-medium">Best School 2024</div>
                  <div className="text-xs text-muted-foreground">State Award</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              className="absolute -bottom-6 -left-6 bg-card border rounded-lg p-3 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <div className="text-sm">
                  <div className="font-medium">98% Success Rate</div>
                  <div className="text-xs text-muted-foreground">WAEC Results</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// About Section Component
function AboutSection() {
  const values = [
    {
      icon: Lightbulb,
      title: 'Wisdom',
      description: 'We cultivate critical thinking and deep understanding in all our students'
    },
    {
      icon: Heart,
      title: 'Character',
      description: 'Building strong moral foundations and ethical leadership qualities'
    },
    {
      icon: Target,
      title: 'Excellence',
      description: 'Pursuing the highest standards in academic and personal achievement'
    },
    {
      icon: Shield,
      title: 'Integrity',
      description: 'Fostering honesty, responsibility, and respect in all interactions'
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4">About Us</Badge>
          <h2 className="text-3xl font-bold mb-4">Our Mission & Vision</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Graceland Royal Academy is committed to providing quality education that develops 
            intellectual capability, character, and leadership skills in a nurturing environment.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-6">Our Story</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded in 1999, Graceland Royal Academy began with a simple yet profound vision: 
                to create an educational institution that would nurture young minds and prepare them 
                for the challenges of tomorrow.
              </p>
              <p>
                Over the past 25 years, we have grown from a small community school to one of the 
                most respected educational institutions in the region, maintaining our core values 
                while embracing innovation and modern teaching methodologies.
              </p>
              <p>
                Today, we serve over 1,200 students from diverse backgrounds, providing them with 
                world-class education and preparing them to become responsible global citizens.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {values.map((value, index) => (
              <Card key={value.title} className="p-4">
                <CardContent className="p-0">
                  <value.icon className="h-8 w-8 text-primary mb-3" />
                  <h4 className="font-semibold mb-2">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>

        {/* Leadership Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-center mb-8">Leadership Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Dr. Sarah Johnson',
                position: 'Principal',
                qualifications: 'Ph.D. Education Administration',
                bio: '20+ years in educational leadership'
              },
              {
                name: 'Prof. Michael Brown',
                position: 'Vice Principal (Academics)',
                qualifications: 'M.Ed. Curriculum Development',
                bio: '15+ years in curriculum design'
              },
              {
                name: 'Mrs. Grace Williams',
                position: 'Vice Principal (Student Affairs)',
                qualifications: 'M.A. Psychology',
                bio: '18+ years in student development'
              }
            ].map((leader, index) => (
              <Card key={leader.name}>
                <CardContent className="p-6 text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarFallback className="text-lg">
                      {leader.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-semibold">{leader.name}</h4>
                  <p className="text-sm text-primary mb-1">{leader.position}</p>
                  <p className="text-sm text-muted-foreground mb-2">{leader.qualifications}</p>
                  <p className="text-xs text-muted-foreground">{leader.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Academics Section Component
function AcademicsSection() {
  const departments = [
    {
      name: 'Mathematics',
      icon: Calculator,
      description: 'Pure & Applied Mathematics, Statistics, Further Mathematics',
      teachers: 8,
      programs: ['WAEC', 'NECO', 'JAMB']
    },
    {
      name: 'Sciences',
      icon: Microscope,
      description: 'Physics, Chemistry, Biology, Computer Science',
      teachers: 12,
      programs: ['WAEC', 'NECO', 'JAMB']
    },
    {
      name: 'Languages',
      icon: Languages,
      description: 'English, Literature, French, Igbo, Hausa',
      teachers: 10,
      programs: ['WAEC', 'NECO', 'JAMB']
    },
    {
      name: 'Arts',
      icon: Palette,
      description: 'Fine Arts, Music, Cultural Studies, Creative Writing',
      teachers: 6,
      programs: ['WAEC', 'NECO']
    },
    {
      name: 'Social Sciences',
      icon: BookOpen,
      description: 'Government, Economics, Geography, History',
      teachers: 9,
      programs: ['WAEC', 'NECO', 'JAMB']
    },
    {
      name: 'Technical',
      icon: Activity,
      description: 'Technical Drawing, Basic Technology, ICT',
      teachers: 5,
      programs: ['WAEC', 'NECO']
    }
  ];

  const facilities = [
    {
      name: 'Science Laboratories',
      description: 'State-of-the-art Physics, Chemistry, and Biology labs',
      icon: Microscope
    },
    {
      name: 'Computer Center',
      description: '50-seat computer lab with high-speed internet',
      icon: Globe
    },
    {
      name: 'Library',
      description: '10,000+ books and digital resources',
      icon: Library
    },
    {
      name: 'Multipurpose Hall',
      description: 'Events, assemblies, and cultural activities',
      icon: School
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4">Academics</Badge>
          <h2 className="text-3xl font-bold mb-4">Academic Excellence</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive curriculum prepares students for success in WAEC, NECO, JAMB, 
            and beyond, with experienced teachers and modern facilities.
          </p>
        </motion.div>

        {/* Departments */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Academic Departments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, index) => (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <dept.icon className="h-8 w-8 text-primary mb-4" />
                    <h4 className="font-semibold mb-2">{dept.name}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{dept.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Teachers:</span>
                        <Badge variant="outline">{dept.teachers}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">Programs:</span>
                        <div className="flex gap-1">
                          {dept.programs.map(program => (
                            <Badge key={program} variant="secondary" className="text-xs">
                              {program}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Facilities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-center mb-8">World-Class Facilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((facility, index) => (
              <Card key={facility.name} className="text-center">
                <CardContent className="p-6">
                  <facility.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">{facility.name}</h4>
                  <p className="text-sm text-muted-foreground">{facility.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Academic Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Academic Calendar 2024/2025
              </CardTitle>
              <CardDescription>
                Important dates and events for the current academic session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'first-term-begins', event: 'First Term Begins', date: 'September 16, 2024' },
                  { id: 'first-mid-term-break', event: 'Mid-Term Break', date: 'October 28 - November 1' },
                  { id: 'first-term-ends', event: 'First Term Ends', date: 'December 15, 2024' },
                  { id: 'second-term-begins', event: 'Second Term Begins', date: 'January 8, 2025' },
                  { id: 'second-mid-term-break', event: 'Mid-Term Break', date: 'February 17 - 21' },
                  { id: 'second-term-ends', event: 'Second Term Ends', date: 'April 4, 2025' }
                ].map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Clock className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{item.event}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

// Admissions Section Component
function AdmissionsSection() {
  const [applicationStep, setApplicationStep] = useState(1);
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    email: '',
    phone: '',
    class: '',
    previousSchool: ''
  });

  const admissionSteps = [
    {
      step: 1,
      title: 'Application Form',
      description: 'Complete the online application form with required documents'
    },
    {
      step: 2,
      title: 'Entrance Examination',
      description: 'Take our comprehensive entrance examination'
    },
    {
      step: 3,
      title: 'Interview',
      description: 'Parent and student interview with our admission team'
    },
    {
      step: 4,
      title: 'Admission Decision',
      description: 'Receive admission decision and enrollment information'
    }
  ];

  const requirements = [
    'Birth Certificate or Age Declaration',
    'Previous School Report Card',
    'Transfer Certificate (if applicable)',
    'Passport Photographs (4 copies)',
    'Medical Certificate',
    'Parent/Guardian ID Copy'
  ];

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Submitting application...',
        success: 'Application submitted successfully! We will contact you soon.',
        error: 'Failed to submit application. Please try again.'
      }
    );
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4">Admissions</Badge>
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We welcome students who are eager to learn, grow, and contribute to our vibrant 
            academic community. Start your journey with us today.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Admission Process */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Admission Process</CardTitle>
                <CardDescription>
                  Follow these simple steps to join Graceland Royal Academy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {admissionSteps.map((step, index) => (
                    <div key={step.step} className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.step <= applicationStep 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {step.step}
                      </div>
                      <div>
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-3">Required Documents</h4>
                  <div className="space-y-2">
                    {requirements.map((req, index) => (
                      <div key={req} className="flex items-center gap-2 text-sm">
                        <Check className="h-3 w-3 text-green-500" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Application Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Apply Now</CardTitle>
                <CardDescription>
                  Start your application process today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Student Name</label>
                      <input
                        type="text"
                        required
                        className="w-full p-2 border rounded-lg bg-input-background"
                        value={formData.studentName}
                        onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Parent/Guardian Name</label>
                      <input
                        type="text"
                        required
                        className="w-full p-2 border rounded-lg bg-input-background"
                        value={formData.parentName}
                        onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        className="w-full p-2 border rounded-lg bg-input-background"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        className="w-full p-2 border rounded-lg bg-input-background"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Intended Class</label>
                      <select
                        required
                        className="w-full p-2 border rounded-lg bg-input-background"
                        value={formData.class}
                        onChange={(e) => setFormData({...formData, class: e.target.value})}
                      >
                        <option value="">Select Class</option>
                        <option value="JSS1">JSS 1</option>
                        <option value="JSS2">JSS 2</option>
                        <option value="JSS3">JSS 3</option>
                        <option value="SS1">SS 1</option>
                        <option value="SS2">SS 2</option>
                        <option value="SS3">SS 3</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Previous School</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg bg-input-background"
                        value={formData.previousSchool}
                        onChange={(e) => setFormData({...formData, previousSchool: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full gap-2">
                    <FileText className="h-4 w-4" />
                    Submit Application
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Application Fee
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Application fee: ₦5,000 (Non-refundable)
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// News and Events Section Component
function NewsEventsSection() {
  const [activeTab, setActiveTab] = useState('news');
  
  const newsArticles: NewsArticle[] = [
    {
      id: '1',
      title: 'GRA Students Excel in WAEC Results',
      summary: '98% pass rate achieved in the latest WAEC examinations',
      content: 'Our students have once again proven their academic excellence...',
      author: 'Academic Office',
      date: '2024-01-15',
      category: 'Academic',
      featured: true
    },
    {
      id: '2',
      title: 'New Science Laboratory Commissioned',
      summary: 'State-of-the-art chemistry lab officially opened',
      content: 'The new laboratory will enhance practical learning...',
      author: 'School Management',
      date: '2024-01-10',
      category: 'Infrastructure',
      featured: false
    },
    {
      id: '3',
      title: 'Annual Sports Festival Announces',
      summary: 'Inter-house sports competition scheduled for March',
      content: 'Students and parents are invited to participate...',
      author: 'Sports Department',
      date: '2024-01-08',
      category: 'Sports',
      featured: false
    }
  ];

  const upcomingEvents: Event[] = [
    {
      id: '1',
      title: 'Parent-Teacher Conference',
      description: 'Discuss student progress with teachers',
      date: '2024-02-15',
      time: '10:00 AM',
      location: 'School Auditorium',
      category: 'academic'
    },
    {
      id: '2',
      title: 'Science Fair',
      description: 'Student science projects exhibition',
      date: '2024-02-20',
      time: '9:00 AM',
      location: 'Science Building',
      category: 'academic'
    },
    {
      id: '3',
      title: 'Cultural Day Celebration',
      description: 'Showcase of Nigerian cultures',
      date: '2024-02-25',
      time: '11:00 AM',
      location: 'School Field',
      category: 'cultural'
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4">News & Events</Badge>
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Keep up with the latest news, events, and achievements at Graceland Royal Academy
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="news">Latest News</TabsTrigger>
            <TabsTrigger value="events">Upcoming Events</TabsTrigger>
          </TabsList>

          <TabsContent value="news">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Featured Article */}
              {newsArticles.filter(article => article.featured).map((article) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="lg:col-span-2"
                >
                  <Card className="h-full">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg" />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="default">Featured</Badge>
                        <Badge variant="outline">{article.category}</Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{article.title}</h3>
                      <p className="text-muted-foreground mb-4">{article.summary}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          <span>{article.author}</span> • <span>{new Date(article.date).toLocaleDateString()}</span>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                          Read More <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Other Articles */}
              <div className="space-y-6">
                {newsArticles.filter(article => !article.featured).map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{article.category}</Badge>
                        </div>
                        <h4 className="font-semibold mb-2">{article.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{article.summary}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{new Date(article.date).toLocaleDateString()}</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-4 w-4 text-primary" />
                        <Badge variant="outline" className="capitalize">{event.category}</Badge>
                      </div>
                      <h3 className="font-semibold mb-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full mt-4 gap-2">
                        <Calendar className="h-3 w-3" />
                        Add to Calendar
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

// Contact Section Component
function ContactSection() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Sending message...',
        success: 'Message sent successfully! We will get back to you soon.',
        error: 'Failed to send message. Please try again.'
      }
    );

    // Reset form
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4">Contact Us</Badge>
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Have questions about admissions, academics, or want to visit our campus? 
            We're here to help you every step of the way.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Reach out to us through any of these channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Address</h4>
                    <p className="text-sm text-muted-foreground">
                      123 Education Avenue<br />
                      Wisdom Gardens, Lagos State<br />
                      Nigeria
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Phone Numbers</h4>
                    <p className="text-sm text-muted-foreground">
                      Main Office: +234 801 234 5678<br />
                      Admissions: +234 802 345 6789<br />
                      Emergency: +234 803 456 7890
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Email Addresses</h4>
                    <p className="text-sm text-muted-foreground">
                      General: info@gracelandroyal.edu.ng<br />
                      Admissions: admissions@gracelandroyal.edu.ng<br />
                      Principal: principal@gracelandroyal.edu.ng
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Office Hours</h4>
                    <p className="text-sm text-muted-foreground">
                      Monday - Friday: 7:00 AM - 5:00 PM<br />
                      Saturday: 8:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  We'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        className="w-full p-2 border rounded-lg bg-input-background"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        className="w-full p-2 border rounded-lg bg-input-background"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Subject</label>
                    <select
                      required
                      className="w-full p-2 border rounded-lg bg-input-background"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    >
                      <option value="">Select Subject</option>
                      <option value="admissions">Admissions Inquiry</option>
                      <option value="academics">Academic Information</option>
                      <option value="facilities">Facilities Tour</option>
                      <option value="general">General Inquiry</option>
                      <option value="complaint">Complaint/Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Message</label>
                    <textarea
                      required
                      rows={5}
                      className="w-full p-2 border rounded-lg bg-input-background resize-none"
                      placeholder="Tell us how we can help you..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    />
                  </div>

                  <Button type="submit" className="w-full gap-2">
                    <Mail className="h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Map Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Find Us on Map</h3>
                  <p className="text-sm text-muted-foreground">Interactive map coming soon</p>
                  <Button variant="outline" className="mt-4 gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Open in Google Maps
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

// Footer Component
function WebsiteFooter() {
  return (
    <footer className="bg-card border-t">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* School Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <SchoolLogo size="sm" showText={false} />
              <div>
                <h3 className="font-bold text-primary">Graceland Royal Academy</h3>
                <p className="text-xs text-muted-foreground">Wisdom & Illumination</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Nurturing young minds for over 25 years with excellence in education 
              and character development.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Facebook</Button>
              <Button variant="outline" size="sm">Twitter</Button>
              <Button variant="outline" size="sm">Instagram</Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-primary">About Us</a>
              <a href="#" className="block text-muted-foreground hover:text-primary">Academics</a>
              <a href="#" className="block text-muted-foreground hover:text-primary">Admissions</a>
              <a href="#" className="block text-muted-foreground hover:text-primary">Faculty</a>
              <a href="#" className="block text-muted-foreground hover:text-primary">News & Events</a>
            </div>
          </div>

          {/* Academic Programs */}
          <div>
            <h4 className="font-semibold mb-4">Programs</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-primary">Junior Secondary</a>
              <a href="#" className="block text-muted-foreground hover:text-primary">Senior Secondary</a>
              <a href="#" className="block text-muted-foreground hover:text-primary">Science Track</a>
              <a href="#" className="block text-muted-foreground hover:text-primary">Arts Track</a>
              <a href="#" className="block text-muted-foreground hover:text-primary">Commercial Track</a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span>123 Education Avenue, Lagos</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <span>+234 801 234 5678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span>info@gracelandroyal.edu.ng</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Graceland Royal Academy. All rights reserved.</p>
          <p className="mt-1">Powered by Enhanced Academic Management System</p>
        </div>
      </div>
    </footer>
  );
}

// Main School Website Component
export function SchoolWebsite({ onNavigate }: { onNavigate?: (section: string) => void }) {
  const [activeSection, setActiveSection] = useState('home');
  const { user } = useAuth();

  const handleNavigation = (section: string) => {
    setActiveSection(section);
    if (onNavigate) {
      onNavigate(section);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return (
          <>
            <HeroSection />
            <AboutSection />
            <AcademicsSection />
            <NewsEventsSection />
            <ContactSection />
          </>
        );
      case 'about':
        return <AboutSection />;
      case 'academics':
        return <AcademicsSection />;
      case 'admissions':
        return <AdmissionsSection />;
      case 'news':
        return <NewsEventsSection />;
      case 'contact':
        return <ContactSection />;
      default:
        return (
          <>
            <HeroSection />
            <AboutSection />
            <AcademicsSection />
            <NewsEventsSection />
            <ContactSection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <WebsiteHeader onNavigate={handleNavigation} activeSection={activeSection} />
      
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>

      <WebsiteFooter />

      {/* Floating Action Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 flex flex-col gap-3"
      >
        {!user && (
          <Button
            size="lg"
            className="rounded-full shadow-lg gap-2"
            onClick={() => handleNavigation('login')}
          >
            <LogIn className="h-4 w-4" />
            Login
          </Button>
        )}
        
        <Button
          variant="outline"
          size="lg"
          className="rounded-full shadow-lg gap-2"
          onClick={() => handleNavigation('admissions')}
        >
          <FileText className="h-4 w-4" />
          Apply Now
        </Button>
      </motion.div>
    </div>
  );
}

export default SchoolWebsite;