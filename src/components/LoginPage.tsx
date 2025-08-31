import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Eye, 
  EyeOff, 
  LogIn,
  Mail,
  Lock,
  Shield,
  GraduationCap,
  CreditCard,
  Users,
  UserPlus,
  Phone,
  MapPin
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { SchoolLogo } from './SchoolLogo';
import { toast } from 'sonner@2.0.3';

type UserRole = 'admin' | 'supervisor' | 'accountant' | 'parent';

export function LoginPage() {
  const { signIn, registerParent, students, classes } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [parentData, setParentData] = useState({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    parentAddress: '',
    childName: '',
    childClass: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showParentPassword, setShowParentPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [parentRegistrationOpen, setParentRegistrationOpen] = useState(false);

  const roleOptions = [
    { value: 'admin', label: 'Administrator', icon: Shield, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { value: 'supervisor', label: 'Supervisor', icon: GraduationCap, color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'accountant', label: 'Accountant', icon: CreditCard, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { value: 'parent', label: 'Parent', icon: Users, color: 'text-orange-600', bgColor: 'bg-orange-50' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn(formData.email, formData.password);
      
      if (!result.success) {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleParentRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!parentData.parentName || !parentData.parentEmail || !parentData.childName || !parentData.childClass || !parentData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parentData.password !== parentData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (parentData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Find matching student
      const matchingStudent = students.find(s => 
        s.name.toLowerCase().trim() === parentData.childName.toLowerCase().trim() &&
        s.is_active
      );

      if (!matchingStudent) {
        toast.error('No student found with the provided name. Please contact the school administrator.');
        setIsLoading(false);
        return;
      }

      // Find matching class
      const matchingClass = classes.find(c => 
        c.name.toLowerCase().trim() === parentData.childClass.toLowerCase().trim() &&
        c.is_active
      );

      if (!matchingClass || matchingStudent.class_id !== matchingClass.id) {
        toast.error('Student class does not match. Please verify the class name.');
        setIsLoading(false);
        return;
      }

      // Check if student already has a parent
      if (matchingStudent.parent_id) {
        toast.error('This student already has a parent account registered.');
        setIsLoading(false);
        return;
      }

      const result = await registerParent({
        parentName: parentData.parentName,
        parentEmail: parentData.parentEmail,
        parentPhone: parentData.parentPhone,
        parentAddress: parentData.parentAddress,
        studentId: matchingStudent.id,
        password: parentData.password
      });

      if (result.success) {
        toast.success('Parent registration successful! You can now login with your credentials.');
        setParentRegistrationOpen(false);
        setParentData({
          parentName: '',
          parentEmail: '',
          parentPhone: '',
          parentAddress: '',
          childName: '',
          childClass: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        toast.error(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleParentInputChange = (field: string, value: string) => {
    setParentData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-6">
            {/* School Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center"
            >
              <SchoolLogo size="lg" showText={false} />
            </motion.div>
            
            {/* School Name */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <CardTitle className="text-2xl font-bold text-primary">
                Graceland Royal Academy
              </CardTitle>
              
              {/* School Motto */}
              <CardDescription className="text-academic-gold font-medium mt-2">
                Wisdom & Illumination
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Role Selection */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="space-y-3"
            >
              <Label className="text-sm font-medium">Select Your Role</Label>
              <div className="grid grid-cols-2 gap-2">
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  return (
                    <Button
                      key={role.value}
                      type="button"
                      variant={selectedRole === role.value ? "default" : "outline"}
                      className={`h-16 flex flex-col items-center gap-1 ${
                        selectedRole === role.value 
                          ? '' 
                          : `hover:${role.bgColor} hover:${role.color}`
                      }`}
                      onClick={() => setSelectedRole(role.value as UserRole)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">{role.label}</span>
                    </Button>
                  );
                })}
              </div>
            </motion.div>

            {/* Login Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </motion.form>

            {/* Parent Registration */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="pt-4 border-t border-border"
            >
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-3">New Parent?</p>
                <Dialog open={parentRegistrationOpen} onOpenChange={setParentRegistrationOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Register as Parent
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Parent Registration</DialogTitle>
                      <DialogDescription>
                        Register after your child has been enrolled by the school
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleParentRegistration} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="parentName">Parent Name *</Label>
                        <Input
                          id="parentName"
                          value={parentData.parentName}
                          onChange={(e) => handleParentInputChange('parentName', e.target.value)}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parentEmail">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="parentEmail"
                            type="email"
                            value={parentData.parentEmail}
                            onChange={(e) => handleParentInputChange('parentEmail', e.target.value)}
                            placeholder="Enter your email"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parentPhone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="parentPhone"
                            type="tel"
                            value={parentData.parentPhone}
                            onChange={(e) => handleParentInputChange('parentPhone', e.target.value)}
                            placeholder="Enter your phone number"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parentAddress">Address</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="parentAddress"
                            value={parentData.parentAddress}
                            onChange={(e) => handleParentInputChange('parentAddress', e.target.value)}
                            placeholder="Enter your address"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border">
                        <p className="text-sm font-medium text-muted-foreground mb-3">Child Information</p>
                        
                        <div className="space-y-2">
                          <Label htmlFor="childName">Child's Full Name *</Label>
                          <Input
                            id="childName"
                            value={parentData.childName}
                            onChange={(e) => handleParentInputChange('childName', e.target.value)}
                            placeholder="Enter your child's full name"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="childClass">Child's Class *</Label>
                          <Select value={parentData.childClass} onValueChange={(value) => handleParentInputChange('childClass', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your child's class" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.filter(c => c.is_active).map(classItem => (
                                <SelectItem key={classItem.id} value={classItem.name}>
                                  {classItem.name} - {classItem.level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border">
                        <p className="text-sm font-medium text-muted-foreground mb-3">Account Security</p>
                        
                        <div className="space-y-2">
                          <Label htmlFor="parentPassword">Password *</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="parentPassword"
                              type={showParentPassword ? 'text' : 'password'}
                              value={parentData.password}
                              onChange={(e) => handleParentInputChange('password', e.target.value)}
                              placeholder="Create a password"
                              className="pl-10 pr-10"
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowParentPassword(!showParentPassword)}
                            >
                              {showParentPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password *</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={parentData.confirmPassword}
                            onChange={(e) => handleParentInputChange('confirmPassword', e.target.value)}
                            placeholder="Confirm your password"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setParentRegistrationOpen(false)}
                          className="flex-1"
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
                            />
                          ) : (
                            <UserPlus className="w-4 h-4 mr-2" />
                          )}
                          {isLoading ? 'Registering...' : 'Register'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-xs text-muted-foreground">
            Enhanced Academic Management System
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            © 2024 Graceland Royal Academy
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}