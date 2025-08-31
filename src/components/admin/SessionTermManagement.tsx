import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Switch } from '../ui/switch';
import { motion } from 'motion/react';
import { 
  Plus, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Play, 
  Pause,
  Settings,
  AlertCircle,
  X,
  Save,
  Zap
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNotifications } from '../NotificationContext';
import { toast } from 'sonner@2.0.3';

export function SessionTermManagement() {
  const { 
    user,
    sessionTerms,
    currentSession,
    currentTerm,
    setActiveSessionTerm,
    createSessionTerm
  } = useAuth();
  
  const { addNotification } = useNotifications();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    session: '',
    term: '',
    start_date: '',
    end_date: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.session?.trim()) {
      errors.session = 'Session is required';
    }

    if (!formData.term) {
      errors.term = 'Term is required';
    }

    if (!formData.start_date) {
      errors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      errors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date && formData.start_date >= formData.end_date) {
      errors.end_date = 'End date must be after start date';
    }

    // Check for duplicate session/term combination
    const existingSessionTerm = sessionTerms.find(st => 
      st.session === formData.session && st.term === formData.term
    );
    if (existingSessionTerm) {
      errors.session = 'Session/term combination already exists';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSessionTerm = async () => {
    if (!validateForm()) return;

    try {
      const result = await createSessionTerm({
        session: formData.session,
        term: formData.term,
        start_date: formData.start_date,
        end_date: formData.end_date
      });

      if (result.success) {
        toast.success('Session/term created successfully');
        addNotification({
          type: 'success',
          title: 'Session/Term Created',
          message: `${formData.session} - ${formData.term} has been created and is ready for activation`,
          autoHide: true
        });
        resetForm();
        setIsDialogOpen(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating session/term:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create session/term');
    }
  };

  const handleActivateSessionTerm = async (session: string, term: string) => {
    try {
      const result = await setActiveSessionTerm(session, term);
      if (result.success) {
        toast.success(`${session} - ${term} is now active`);
        addNotification({
          type: 'success',
          title: 'Session/Term Activated',
          message: `${session} - ${term} is now the active session/term across all dashboards`,
          autoHide: true
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error activating session/term:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to activate session/term');
    }
  };

  const resetForm = () => {
    setFormData({
      session: '',
      term: '',
      start_date: '',
      end_date: ''
    });
    setFormErrors({});
  };

  const generateSessionOptions = () => {
    const currentYear = new Date().getFullYear();
    const sessions = [];
    for (let i = -2; i <= 2; i++) {
      const startYear = currentYear + i;
      const endYear = startYear + 1;
      sessions.push(`${startYear}/${endYear}`);
    }
    return sessions;
  };

  const getSessionTermStatus = (sessionTerm: any) => {
    const now = new Date();
    const startDate = new Date(sessionTerm.start_date);
    const endDate = new Date(sessionTerm.end_date);

    if (sessionTerm.is_active) {
      if (now < startDate) return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' };
      if (now > endDate) return { status: 'completed', color: 'bg-gray-100 text-gray-800' };
      return { status: 'active', color: 'bg-green-100 text-green-800' };
    } else {
      if (now < startDate) return { status: 'pending', color: 'bg-yellow-100 text-yellow-800' };
      if (now > endDate) return { status: 'expired', color: 'bg-red-100 text-red-800' };
      return { status: 'inactive', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
        <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  const activeSessionTerm = sessionTerms.find(st => st.is_active);

  return (
    <div className="space-y-6">
      {/* Current Active Session/Term Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Currently Active Session/Term
              </CardTitle>
              <CardDescription>
                This session/term is active across all dashboards and result recording
              </CardDescription>
            </div>
            {activeSessionTerm && (
              <Badge className="bg-primary text-primary-foreground">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {activeSessionTerm ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border">
                  <h4 className="font-medium text-primary">Session</h4>
                  <p className="text-2xl font-bold">{activeSessionTerm.session}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <h4 className="font-medium text-primary">Term</h4>
                  <p className="text-2xl font-bold">{activeSessionTerm.term}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <h4 className="font-medium text-primary">Duration</h4>
                  <p className="text-sm">
                    {new Date(activeSessionTerm.start_date).toLocaleDateString()} - {new Date(activeSessionTerm.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All supervisors, students, and parents see results and activities for <strong>{activeSessionTerm.session} - {activeSessionTerm.term}</strong>
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No active session/term found. Please activate a session/term to enable full system functionality.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Session/Term Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Session & Term Management
              </CardTitle>
              <CardDescription>
                Create, manage, and activate academic sessions and terms
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Session/Term
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Session/Term</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="session">Academic Session *</Label>
                    <Select value={formData.session} onValueChange={(value) => setFormData({ ...formData, session: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateSessionOptions().map(session => (
                          <SelectItem key={session} value={session}>
                            {session}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.session && (
                      <p className="text-xs text-destructive mt-1">{formErrors.session}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="term">Term *</Label>
                    <Select value={formData.term} onValueChange={(value) => setFormData({ ...formData, term: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="First Term">First Term</SelectItem>
                        <SelectItem value="Second Term">Second Term</SelectItem>
                        <SelectItem value="Third Term">Third Term</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.term && (
                      <p className="text-xs text-destructive mt-1">{formErrors.term}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="mt-1"
                      />
                      {formErrors.start_date && (
                        <p className="text-xs text-destructive mt-1">{formErrors.start_date}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="end_date">End Date *</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="mt-1"
                      />
                      {formErrors.end_date && (
                        <p className="text-xs text-destructive mt-1">{formErrors.end_date}</p>
                      )}
                    </div>
                  </div>

                  {formData.session && formData.term && formData.start_date && formData.end_date && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Preview:</strong> {formData.session} - {formData.term} ({new Date(formData.start_date).toLocaleDateString()} to {new Date(formData.end_date).toLocaleDateString()})
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleCreateSessionTerm}>
                      <Save className="h-4 w-4 mr-2" />
                      Create Session/Term
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Sessions</p>
                      <p className="text-2xl font-bold text-primary">
                        {[...new Set(sessionTerms.map(st => st.session))].length}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Terms</p>
                      <p className="text-2xl font-bold text-primary">{sessionTerms.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Terms</p>
                      <p className="text-2xl font-bold text-primary">
                        {sessionTerms.filter(st => st.is_active).length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Session</p>
                      <p className="text-lg font-bold text-primary">
                        {currentSession}
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Session/Term Table */}
          {sessionTerms.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No sessions/terms created yet</p>
              <p className="text-sm text-muted-foreground">Create your first academic session/term to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionTerms
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((sessionTerm, index) => {
                      const statusInfo = getSessionTermStatus(sessionTerm);
                      return (
                        <motion.tr
                          key={sessionTerm.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="hover:bg-muted/50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{sessionTerm.session}</span>
                              {sessionTerm.is_active && (
                                <Zap className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{sessionTerm.term}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{new Date(sessionTerm.start_date).toLocaleDateString()}</div>
                              <div className="text-muted-foreground">to {new Date(sessionTerm.end_date).toLocaleDateString()}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusInfo.color}>
                              {statusInfo.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {!sessionTerm.is_active ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleActivateSessionTerm(sessionTerm.session, sessionTerm.term)}
                                  className="text-primary hover:bg-primary/10"
                                >
                                  <Play className="h-4 w-4 mr-1" />
                                  Activate
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled
                                  className="text-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Active
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}