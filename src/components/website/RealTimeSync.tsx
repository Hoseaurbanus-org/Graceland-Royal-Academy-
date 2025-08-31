import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Activity, 
  Database, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner@2.0.3';

// Types for sync operations
interface SyncOperation {
  id: string;
  type: 'students' | 'results' | 'payments' | 'staff' | 'analytics';
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  lastSync: string;
  progress: number;
  recordsCount: number;
}

interface SyncMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  lastFullSync: string;
  nextScheduledSync: string;
  averageSyncTime: string;
}

// Real-time Sync Engine
class RealTimeSyncEngine {
  static async performSync(operation: SyncOperation): Promise<boolean> {
    try {
      // Simulate API call with progress updates
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        // In real implementation, this would trigger progress callbacks
      }
      
      return Math.random() > 0.1; // 90% success rate simulation
    } catch (error) {
      console.error('Sync operation failed:', error);
      return false;
    }
  }

  static generateSyncOperations(students: any[], results: any[], staff: any[]): SyncOperation[] {
    return [
      {
        id: 'students-sync',
        type: 'students',
        status: 'completed',
        lastSync: new Date(Date.now() - 300000).toLocaleTimeString(), // 5 min ago
        progress: 100,
        recordsCount: students.length
      },
      {
        id: 'results-sync',
        type: 'results',
        status: 'completed',
        lastSync: new Date(Date.now() - 180000).toLocaleTimeString(), // 3 min ago
        progress: 100,
        recordsCount: results.length
      },
      {
        id: 'analytics-sync',
        type: 'analytics',
        status: 'syncing',
        lastSync: new Date().toLocaleTimeString(),
        progress: 65,
        recordsCount: 0
      },
      {
        id: 'staff-sync',
        type: 'staff',
        status: 'pending',
        lastSync: new Date(Date.now() - 900000).toLocaleTimeString(), // 15 min ago
        progress: 0,
        recordsCount: staff.length || 12
      }
    ];
  }
}

// Sync Status Indicator Component
function SyncStatusIndicator({ status }: { status: SyncOperation['status'] }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' };
      case 'syncing':
        return { icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'failed':
        return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' };
      default:
        return { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${config.bg} ${config.border} border`}>
      <IconComponent className={`h-4 w-4 ${config.color} ${status === 'syncing' ? 'animate-spin' : ''}`} />
      <span className={`text-sm font-medium capitalize ${config.color}`}>{status}</span>
    </div>
  );
}

// Main Real-time Sync Component
export function RealTimeSync() {
  const { students, results, staff, user, isConnected } = useAuth();
  const [syncOperations, setSyncOperations] = useState<SyncOperation[]>([]);
  const [syncMetrics, setSyncMetrics] = useState<SyncMetrics>({
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    lastFullSync: new Date().toLocaleTimeString(),
    nextScheduledSync: new Date(Date.now() + 1800000).toLocaleTimeString(), // 30 min from now
    averageSyncTime: '2.3s'
  });
  const [autoSync, setAutoSync] = useState(true);
  const [isPerformingFullSync, setIsPerformingFullSync] = useState(false);

  // Initialize sync operations
  useEffect(() => {
    const operations = RealTimeSyncEngine.generateSyncOperations(students, results, staff);
    setSyncOperations(operations);
    
    setSyncMetrics(prev => ({
      ...prev,
      totalOperations: operations.length,
      successfulOperations: operations.filter(op => op.status === 'completed').length,
      failedOperations: operations.filter(op => op.status === 'failed').length
    }));
  }, [students, results, staff]);

  // Auto-sync every 5 minutes
  useEffect(() => {
    if (!autoSync || !isConnected) return;

    const interval = setInterval(async () => {
      await performIncrementalSync();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoSync, isConnected]);

  // Perform incremental sync
  const performIncrementalSync = async () => {
    const pendingOps = syncOperations.filter(op => op.status === 'pending');
    
    for (const operation of pendingOps) {
      setSyncOperations(prev => 
        prev.map(op => 
          op.id === operation.id 
            ? { ...op, status: 'syncing', progress: 0 }
            : op
        )
      );

      // Simulate progress updates
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setSyncOperations(prev => 
          prev.map(op => 
            op.id === operation.id 
              ? { ...op, progress }
              : op
          )
        );
      }

      const success = await RealTimeSyncEngine.performSync(operation);
      
      setSyncOperations(prev => 
        prev.map(op => 
          op.id === operation.id 
            ? { 
                ...op, 
                status: success ? 'completed' : 'failed',
                lastSync: new Date().toLocaleTimeString(),
                progress: success ? 100 : 0
              }
            : op
        )
      );

      if (success) {
        toast.success(`${operation.type} synchronized successfully`);
      } else {
        toast.error(`Failed to sync ${operation.type}`);
      }
    }
  };

  // Perform full system sync
  const performFullSync = async () => {
    setIsPerformingFullSync(true);
    
    try {
      // Reset all operations to pending
      setSyncOperations(prev => 
        prev.map(op => ({ ...op, status: 'pending' as const, progress: 0 }))
      );

      await performIncrementalSync();
      
      setSyncMetrics(prev => ({
        ...prev,
        lastFullSync: new Date().toLocaleTimeString(),
        nextScheduledSync: new Date(Date.now() + 1800000).toLocaleTimeString()
      }));

      toast.success('Full system synchronization completed');
    } catch (error) {
      toast.error('Full sync failed');
    } finally {
      setIsPerformingFullSync(false);
    }
  };

  // Force sync specific operation
  const forceSyncOperation = async (operationId: string) => {
    const operation = syncOperations.find(op => op.id === operationId);
    if (!operation) return;

    setSyncOperations(prev => 
      prev.map(op => 
        op.id === operationId 
          ? { ...op, status: 'syncing', progress: 0 }
          : op
      )
    );

    const success = await RealTimeSyncEngine.performSync(operation);
    
    setSyncOperations(prev => 
      prev.map(op => 
        op.id === operationId 
          ? { 
              ...op, 
              status: success ? 'completed' : 'failed',
              lastSync: new Date().toLocaleTimeString(),
              progress: success ? 100 : 0
            }
          : op
      )
    );

    if (success) {
      toast.success(`${operation.type} synchronized`);
    } else {
      toast.error(`Sync failed for ${operation.type}`);
    }
  };

  const getOperationIcon = (type: SyncOperation['type']) => {
    switch (type) {
      case 'students': return Users;
      case 'results': return BookOpen;
      case 'staff': return GraduationCap;
      case 'analytics': return BarChart3;
      default: return Database;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Alert className={isConnected ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={isConnected ? 'text-green-800' : 'text-red-800'}>
            {isConnected 
              ? 'Real-time synchronization active' 
              : 'Offline mode - Changes will sync when connection returns'
            }
          </AlertDescription>
        </div>
      </Alert>

      {/* Sync Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className={`h-5 w-5 ${isPerformingFullSync ? 'animate-spin' : ''}`} />
            Synchronization Control
          </CardTitle>
          <CardDescription>
            Manage real-time data synchronization between website and dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto Sync</h4>
              <p className="text-sm text-muted-foreground">
                Automatically sync data every 5 minutes
              </p>
            </div>
            <Button
              variant={autoSync ? "default" : "outline"}
              onClick={() => setAutoSync(!autoSync)}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              {autoSync ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={performFullSync}
              disabled={isPerformingFullSync || !isConnected}
              className="gap-2"
            >
              {isPerformingFullSync ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Full Sync
            </Button>
            
            <Button 
              variant="outline"
              onClick={performIncrementalSync}
              disabled={!isConnected}
              className="gap-2"
            >
              <Activity className="h-4 w-4" />
              Incremental Sync
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Operations</CardTitle>
          <CardDescription>
            Individual synchronization status for each data type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {syncOperations.map((operation) => {
              const IconComponent = getOperationIcon(operation.type);
              
              return (
                <motion.div
                  key={operation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium capitalize">{operation.type}</h4>
                      <p className="text-sm text-muted-foreground">
                        {operation.recordsCount} records • Last sync: {operation.lastSync}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {operation.status === 'syncing' && (
                      <div className="w-32">
                        <Progress value={operation.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {operation.progress}% complete
                        </p>
                      </div>
                    )}
                    
                    <SyncStatusIndicator status={operation.status} />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => forceSyncOperation(operation.id)}
                      disabled={operation.status === 'syncing' || !isConnected}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sync Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Metrics</CardTitle>
          <CardDescription>
            Performance statistics and sync health monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {syncMetrics.successfulOperations}
              </div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </div>
            
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {syncMetrics.failedOperations}
              </div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-sm font-medium">Last Full Sync</div>
              <div className="text-sm text-muted-foreground">{syncMetrics.lastFullSync}</div>
            </div>
            
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-sm font-medium">Next Scheduled</div>
              <div className="text-sm text-muted-foreground">{syncMetrics.nextScheduledSync}</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="font-medium">System Health</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Average sync time: {syncMetrics.averageSyncTime} • 
              Success rate: {((syncMetrics.successfulOperations / Math.max(syncMetrics.totalOperations, 1)) * 100).toFixed(1)}% • 
              Auto-sync: {autoSync ? 'Active' : 'Inactive'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RealTimeSync;