import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { isSupabaseConnected, getEnvironmentInfo } from '../lib/supabase';
import { Wifi, WifiOff, Database, AlertCircle } from 'lucide-react';

export function ConnectionStatusIndicator() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [envInfo, setEnvInfo] = useState<any>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await isSupabaseConnected();
        const environmentInfo = getEnvironmentInfo();
        
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
        setEnvInfo(environmentInfo);
      } catch (error) {
        setConnectionStatus('disconnected');
      }
    };

    checkConnection();
    
    // Check connection status every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Don't show anything if we're checking or if it's configured properly and connected
  if (connectionStatus === 'checking') {
    return null;
  }

  // Only show the indicator if there's a connection issue or if we're in demo mode
  const showIndicator = connectionStatus === 'disconnected' || !envInfo?.isSupabaseConfigured;

  if (!showIndicator) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-2">
        {connectionStatus === 'disconnected' && envInfo?.isSupabaseConfigured && (
          <Badge variant="destructive" className="flex items-center gap-2 px-3 py-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-xs font-mono">Connection Failed</span>
          </Badge>
        )}
        
        {!envInfo?.isSupabaseConfigured && (
          <Badge variant="secondary" className="flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-800 border-amber-300">
            <Database className="w-4 h-4" />
            <span className="text-xs font-mono">Demo Mode</span>
          </Badge>
        )}
      </div>
    </div>
  );
}