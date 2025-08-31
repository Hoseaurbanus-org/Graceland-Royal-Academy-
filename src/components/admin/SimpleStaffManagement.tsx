import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  Copy,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../AuthContext';

interface Staff {
  id: string;
  full_name: string;
  email: string;
  role: 'subject_supervisor' | 'class_supervisor' | 'accountant';
  employee_id: string;
  join_date: string;
  is_active: boolean;
  password?: string;
  created_at: string;
  updated_at: string;
}

export const SimpleStaffManagement: React.FC = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showCredentials, setShowCredentials] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'subject_supervisor' as 'subject_supervisor' | 'class_supervisor' | 'accountant',
    employee_id: '',
    join_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = () => {
    try {
      const localStaff = localStorage.getItem('graceland_staff');
      if (localStaff) {
        setStaff(JSON.parse(localStaff));
      }
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const saveToLocalStorage = (data: Staff[]) => {
    try {
      localStorage.setItem('graceland_staff', JSON.stringify(data));
      
      // Also save to users for login functionality
      const users = data.map(s => ({
        id: s.id,
        email: s.email,
        password: s.password || generateTemporaryPassword(),
        role: s.role,
        full_name: s.full_name,
        is_active: s.is_active,
        password_change_required: true,
        created_at: s.created_at
      }));
      
      const existingUsers = JSON.parse(localStorage.getItem('graceland_users') || '[]');
      const updatedUsers = existingUsers.filter((u: any) => !users.find(nu => nu.id === u.id));
      updatedUsers.push(...users);
      
      localStorage.setItem('graceland_users', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const generateEmployeeId = (): string => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `GRA${year}${randomNum}`;
  };

  const generateTemporaryPassword = (): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const validateForm = (): boolean => {
    if (!formData.full_name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      toast.error('Invalid email format');
      return false;
    }
    if (!formData.role) {
      toast.error('Role is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const temporaryPassword = generateTemporaryPassword();
      
      const staffData: Staff = {
        id: editingStaff?.id || Date.now().toString(),
        ...formData,
        employee_id: formData.employee_id || generateEmployeeId(),
        is_active: true,
        password: temporaryPassword,
        created_at: editingStaff?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let updatedStaff;
      if (editingStaff) {
        updatedStaff = staff.map(s => s.id === editingStaff.id ? { ...staffData, password: editingStaff.password } : s);
        toast.success('Staff member updated successfully');
      } else {
        updatedStaff = [staffData, ...staff];
        
        // Show login credentials to admin
        setTimeout(() => {
          alert(`Staff member registered successfully!

Login Credentials:
Email: ${formData.email}
Temporary Password: ${temporaryPassword}

Please provide these credentials to the staff member. They will be required to change their password on first login.`);
        }, 500);
        
        toast.success('Staff member registered with login credentials');
      }
      
      setStaff(updatedStaff);
      saveToLocalStorage(updatedStaff);

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving staff:', error);
      toast.error('Failed to save staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      full_name: staffMember.full_name,
      email: staffMember.email,
      role: staffMember.role,
      employee_id: staffMember.employee_id,
      join_date: staffMember.join_date,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    const updatedStaff = staff.filter(s => s.id !== staffId);
    setStaff(updatedStaff);
    saveToLocalStorage(updatedStaff);
    toast.success('Staff member deleted successfully');
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      role: 'subject_supervisor',
      employee_id: '',
      join_date: new Date().toISOString().split('T')[0],
    });
    setEditingStaff(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'subject_supervisor': return 'bg-blue-100 text-blue-800';
      case 'class_supervisor': return 'bg-green-100 text-green-800';
      case 'accountant': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'subject_supervisor': return 'Subject Supervisor';
      case 'class_supervisor': return 'Class Supervisor';
      case 'accountant': return 'Accountant';
      default: return role;
    }
  };

  const copyCredentials = (email: string, password: string) => {
    const credentials = `Email: ${email}\nPassword: ${password}`;
    navigator.clipboard.writeText(credentials);
    toast.success('Credentials copied to clipboard');
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Staff Management</h2>
          <p className="text-muted-foreground">Manage staff members and their login credentials</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subject_supervisor">Subject Supervisor</SelectItem>
                      <SelectItem value="class_supervisor">Class Supervisor</SelectItem>
                      <SelectItem value="accountant">Accountant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <Input
                    id="employee_id"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="join_date">Join Date *</Label>
                <Input
                  id="join_date"
                  type="date"
                  value={formData.join_date}
                  onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {loading ? 'Saving...' : editingStaff ? 'Update Staff' : 'Add Staff'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading staff...</p>
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No staff members registered yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="border border-border px-4 py-2 text-left">Name</th>
                    <th className="border border-border px-4 py-2 text-left">Email</th>
                    <th className="border border-border px-4 py-2 text-left">Role</th>
                    <th className="border border-border px-4 py-2 text-left">Employee ID</th>
                    <th className="border border-border px-4 py-2 text-left">Join Date</th>
                    <th className="border border-border px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((staffMember) => (
                    <tr key={staffMember.id} className="hover:bg-muted">
                      <td className="border border-border px-4 py-2 font-medium">
                        {staffMember.full_name}
                      </td>
                      <td className="border border-border px-4 py-2">
                        {staffMember.email}
                      </td>
                      <td className="border border-border px-4 py-2">
                        <Badge className={getRoleColor(staffMember.role)}>
                          {getRoleLabel(staffMember.role)}
                        </Badge>
                      </td>
                      <td className="border border-border px-4 py-2 font-mono text-sm">
                        {staffMember.employee_id}
                      </td>
                      <td className="border border-border px-4 py-2">
                        {new Date(staffMember.join_date).toLocaleDateString()}
                      </td>
                      <td className="border border-border px-4 py-2">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(staffMember)}
                            className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowCredentials(showCredentials === staffMember.id ? null : staffMember.id)}
                            className="text-chart-1 border-chart-1 hover:bg-chart-1 hover:text-white"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(staffMember.id)}
                            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        {/* Credentials Display */}
                        {showCredentials === staffMember.id && (
                          <div className="mt-2 p-3 bg-muted rounded border">
                            <p className="text-sm font-medium text-foreground mb-2">Login Credentials:</p>
                            <div className="text-xs space-y-1">
                              <div><strong>Email:</strong> {staffMember.email}</div>
                              <div><strong>Password:</strong> {staffMember.password || 'Not available'}</div>
                            </div>
                            {staffMember.password && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyCredentials(staffMember.email, staffMember.password!)}
                                className="text-xs mt-2 h-6"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleStaffManagement;