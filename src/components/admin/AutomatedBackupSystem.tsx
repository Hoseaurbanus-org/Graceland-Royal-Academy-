import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  Database, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Activity,
  Calendar,
  FileText,
  Zap,
  HardDrive,
  Cloud,
  Timer,
  Lock
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNotifications } from '../NotificationContext';
import { SchoolLogo } from '../SchoolLogo';
import { toast } from 'sonner@2.0.3';

interface BackupRecord {
  id: string;
  type: 'manual' | 'automated' | 'scheduled';
  timestamp: Date;
  size: string;
  status: 'completed' | 'failed' | 'in_progress';
  dataTypes: string[];
  location: 'local' | 'cloud';
  checksum: string;
}

interface RecoveryPoint {
  id: string;
  timestamp: Date;
  description: string;
  dataIntegrity: number;
  canRestore: boolean;
}

export function AutomatedBackupSystem() {
  const { students, staff, classes, subjects, results } = useAuth();
  const { addNotification } = useNotifications();
  
  const [isBackupEnabled, setIsBackupEnabled] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('6h');
  const [cloudBackupEnabled, setCloudBackupEnabled] = useState(true);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [currentBackupProgress, setCurrentBackupProgress] = useState(0);
  const [nextBackupTime, setNextBackupTime] = useState<Date>(new Date(Date.now() + 6 * 60 * 60 * 1000));
  
  // Mock backup history
  const [backupHistory, setBackupHistory] = useState<BackupRecord[]>([
    {
      id: '1',
      type: 'automated',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      size: '2.4 MB',
      status: 'completed',
      dataTypes: ['students', 'results', 'staff'],
      location: 'cloud',
      checksum: 'sha256:abc123...'
    },
    {
      id: '2',
      type: 'manual',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      size: '2.3 MB',
      status: 'completed',
      dataTypes: ['students', 'results', 'staff', 'classes'],
      location: 'local',
      checksum: 'sha256:def456...'
    },
    {
      id: '3',
      type: 'scheduled',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      size: '2.2 MB',
      status: 'completed',
      dataTypes: ['students', 'results', 'staff', 'classes', 'subjects'],
      location: 'cloud',
      checksum: 'sha256:ghi789...'
    }
  ]);

  // Recovery points
  const recoveryPoints: RecoveryPoint[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      description: 'Latest automated backup',
      dataIntegrity: 100,
      canRestore: true
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      description: 'Manual backup before maintenance',
      dataIntegrity: 100,
      canRestore: true
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      description: 'Daily scheduled backup',
      dataIntegrity: 98,
      canRestore: true
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      description: 'Weekly archive backup',
      dataIntegrity: 95,
      canRestore: true
    }
  ];

  // Calculate system stats
  const systemStats = {
    totalDataSize: '2.4 MB',
    backupCoverage: 100,
    retentionPeriod: '30 days',
    encryptionStatus: encryptionEnabled ? 'AES-256' : 'Disabled',
    lastBackupAge: Math.floor((Date.now() - backupHistory[0]?.timestamp.getTime()) / (1000 * 60 * 60)),
    totalBackups: backupHistory.length,
    successRate: Math.round((backupHistory.filter(b => b.status === 'completed').length / backupHistory.length) * 100)
  };

  // Auto backup scheduling
  useEffect(() => {
    if (!isBackupEnabled) return;

    const scheduleNextBackup = () => {
      const frequency = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '12h': 12 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000
      };
      
      setNextBackupTime(new Date(Date.now() + frequency[backupFrequency as keyof typeof frequency]));
    };

    const interval = setInterval(() => {
      if (Date.now() >= nextBackupTime.getTime()) {
        handleAutomatedBackup();
        scheduleNextBackup();
      }
    }, 60000); // Check every minute

    scheduleNextBackup();
    return () => clearInterval(interval);
  }, [isBackupEnabled, backupFrequency, nextBackupTime]);

  const handleManualBackup = async () => {
    setIsCreatingBackup(true);
    setCurrentBackupProgress(0);

    try {
      // Simulate backup process
      const steps = [
        'Preparing data for backup...',
        'Backing up student records...',
        'Backing up staff data...',
        'Backing up academic records...',
        'Backing up results...',
        'Encrypting backup...',
        'Uploading to secure storage...',
        'Verifying backup integrity...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setCurrentBackupProgress(((i + 1) / steps.length) * 100);
        toast.loading(steps[i], { id: 'backup-progress' });
      }

      // Create new backup record
      const newBackup: BackupRecord = {
        id: Date.now().toString(),
        type: 'manual',
        timestamp: new Date(),
        size: '2.5 MB',
        status: 'completed',
        dataTypes: ['students', 'staff', 'classes', 'subjects', 'results'],
        location: cloudBackupEnabled ? 'cloud' : 'local',
        checksum: `sha256:${Math.random().toString(36).substring(2)}`
      };

      setBackupHistory(prev => [newBackup, ...prev]);

      toast.success('Backup completed successfully!', { id: 'backup-progress' });
      addNotification({
        type: 'success',
        title: 'Manual Backup Completed',
        message: `${newBackup.size} backup created and stored securely`,
        autoHide: true
      });

    } catch (error) {
      toast.error('Backup failed', { id: 'backup-progress' });
    } finally {
      setIsCreatingBackup(false);
      setCurrentBackupProgress(0);
    }
  };

  const handleAutomatedBackup = async () => {
    if (!isBackupEnabled) return;

    // Simulate automated backup
    const newBackup: BackupRecord = {
      id: Date.now().toString(),
      type: 'automated',
      timestamp: new Date(),
      size: '2.4 MB',
      status: 'completed',
      dataTypes: ['students', 'results', 'staff'],
      location: cloudBackupEnabled ? 'cloud' : 'local',
      checksum: `sha256:${Math.random().toString(36).substring(2)}`
    };

    setBackupHistory(prev => [newBackup, ...prev.slice(0, 9)]); // Keep last 10 backups

    addNotification({
      type: 'success',
      title: 'Automated Backup',
      message: 'Scheduled backup completed successfully',
      autoHide: true
    });
  };

  const handleRestoreData = async (recoveryPointId: string) => {
    const recoveryPoint = recoveryPoints.find(rp => rp.id === recoveryPointId);
    if (!recoveryPoint) return;

    toast.loading('Preparing data restoration...', { id: 'restore' });

    try {
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast.success('Data restoration completed', { id: 'restore' });
      addNotification({
        type: 'success',
        title: 'Data Restored',
        message: `System restored to ${recoveryPoint.timestamp.toLocaleString()}`,
        autoHide: true
      });
    } catch (error) {
      toast.error('Restoration failed', { id: 'restore' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'in_progress': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLocationIcon = (location: string) => {
    return location === 'cloud' ? <Cloud className="h-4 w-4" /> : <HardDrive className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SchoolLogo size="md" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Automated Backup & Recovery</h1>
            <p className="text-muted-foreground">Comprehensive data protection and disaster recovery system</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isBackupEnabled ? "default" : "secondary"}>
            <Database className="h-3 w-3 mr-1" />
            {isBackupEnabled ? 'Active' : 'Disabled'}
          </Badge>
          <Badge variant={encryptionEnabled ? "default" : "outline"}>
            <Lock className="h-3 w-3 mr-1" />
            {encryptionEnabled ? 'Encrypted' : 'Unencrypted'}
          </Badge>
        </div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Data Protected</p>
                <p className="text-2xl font-bold text-green-800">{systemStats.totalDataSize}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={systemStats.backupCoverage} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-blue-800">{systemStats.successRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={systemStats.successRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Last Backup</p>
                <p className="text-2xl font-bold text-purple-800">{systemStats.lastBackupAge}h ago</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Total Backups</p>
                <p className="text-2xl font-bold text-orange-800">{systemStats.totalBackups}</p>
              </div>
              <Database className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Backup Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Backup Configuration
          </CardTitle>
          <CardDescription>
            Configure automated backup settings and schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="backup-toggle">Automated Backup</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="backup-toggle"
                  checked={isBackupEnabled}
                  onCheckedChange={setIsBackupEnabled}
                />
                <span className="text-sm text-muted-foreground">
                  {isBackupEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Backup Frequency</Label>
              <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Every Hour</SelectItem>
                  <SelectItem value="6h">Every 6 Hours</SelectItem>
                  <SelectItem value="12h">Every 12 Hours</SelectItem>
                  <SelectItem value="24h">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cloud-backup">Cloud Backup</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="cloud-backup"
                  checked={cloudBackupEnabled}
                  onCheckedChange={setCloudBackupEnabled}
                />
                <span className="text-sm text-muted-foreground">
                  {cloudBackupEnabled ? 'Enabled' : 'Local Only'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="encryption">Encryption</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="encryption"
                  checked={encryptionEnabled}
                  onCheckedChange={setEncryptionEnabled}
                />
                <span className="text-sm text-muted-foreground">
                  {encryptionEnabled ? 'AES-256' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button 
              onClick={handleManualBackup}
              disabled={isCreatingBackup}
              className="gap-2"
            >
              {isCreatingBackup ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Create Manual Backup
            </Button>

            {isBackupEnabled && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Timer className="h-4 w-4" />
                <span>Next backup: {nextBackupTime.toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          {isCreatingBackup && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Backup Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(currentBackupProgress)}%</span>
              </div>
              <Progress value={currentBackupProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Backup History
            </CardTitle>
            <CardDescription>Recent backup operations and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {backupHistory.slice(0, 5).map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(backup.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{backup.type}</span>
                        {getLocationIcon(backup.location)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {backup.timestamp.toLocaleString()} • {backup.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={backup.status === 'completed' ? 'default' : 'destructive'} className="text-xs">
                      {backup.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recovery Points */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Recovery Points
            </CardTitle>
            <CardDescription>Available restore points for data recovery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recoveryPoints.map((point) => (
                <div key={point.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{point.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {point.timestamp.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs">Integrity:</span>
                      <Progress value={point.dataIntegrity} className="h-1 flex-1 max-w-20" />
                      <span className="text-xs">{point.dataIntegrity}%</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestoreData(point.id)}
                    disabled={!point.canRestore}
                    className="gap-1"
                  >
                    <Upload className="h-3 w-3" />
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Alert */}
      {systemStats.lastBackupAge > 24 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Warning: Last backup was more than 24 hours ago. Consider creating a manual backup or enabling automated backups.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default AutomatedBackupSystem;