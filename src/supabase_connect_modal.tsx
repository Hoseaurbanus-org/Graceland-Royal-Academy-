import React, { useState } from 'react';
import { supabase_connect } from './lib/supabase-tools';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';
import { Badge } from './components/ui/badge';
import { Database, Play, Crown, CheckCircle, AlertTriangle, Settings } from 'lucide-react';

export function SupabaseConnectModal() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await supabase_connect();
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDemoMode = () => {
    setShowDemo(true);
    // Refresh to continue in demo mode
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  if (showDemo) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Demo Mode Activated</h2>
            <p className="text-muted-foreground">
              Starting demo trial with sample data. You can set up the database later for production use.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-2xl w-full border shadow-xl">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-sky-50 to-blue-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Graceland Royal Academy</h1>
              <p className="text-sm text-chart-2 font-semibold">WISDOM & ILLUMINATION</p>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-foreground">Choose Your Experience</h2>
          <p className="text-muted-foreground">
            Connect to your database for full functionality or try the demo version
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Connection Option */}
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Connect to Database
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Recommended
                </Badge>
              </CardTitle>
              <CardDescription>
                Full-featured experience with real-time data synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Real-time data synchronization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Persistent data storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Multi-user collaboration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Automatic backups</span>
                </div>
              </div>
              
              <Alert className="bg-blue-50 border-blue-200">
                <Settings className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Setup Required:</strong> You need a Supabase project with environment variables configured.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full"
              >
                <Database className="w-4 h-4 mr-2" />
                {isConnecting ? 'Connecting...' : 'Connect to Database'}
              </Button>
            </CardContent>
          </Card>

          {/* Demo Option */}
          <Card className="border-amber-200 hover:border-amber-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-amber-600" />
                Try Demo Mode
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  No Setup Required
                </Badge>
              </CardTitle>
              <CardDescription>
                Explore the system with sample data (local storage only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Full system functionality</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Sample students and classes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Test all features</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Data stored locally only</span>
                </div>
              </div>

              <Alert className="bg-amber-50 border-amber-200">
                <Play className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Demo Mode:</strong> Perfect for testing and evaluation. You can set up the database later.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleDemoMode}
                variant="outline"
                className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Demo Trial
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-muted/30">
          <p className="text-sm text-muted-foreground text-center">
            You can switch to database mode at any time from the settings panel
          </p>
        </div>
      </div>
    </div>
  );
}