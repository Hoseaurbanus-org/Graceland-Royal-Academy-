import React from 'react';

export function DevStatusIndicator() {
  // Check if we're in development mode safely
  const isDevelopment = React.useMemo(() => {
    try {
      // Try different ways to detect development mode
      if (typeof window !== 'undefined') {
        // Browser environment checks
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('figma.com')) {
          return true;
        }
      }
      
      // Check for import.meta.env if available
      try {
        // @ts-ignore - We're safely checking if import.meta exists
        if (import.meta && import.meta.env) {
          // @ts-ignore
          return import.meta.env.DEV || import.meta.env.MODE === 'development';
        }
      } catch (e) {
        // import.meta not available, continue
      }
      
      // Default to showing in development-like environments
      return true;
    } catch (error) {
      // If we can't determine, assume development
      return true;
    }
  }, []);

  if (!isDevelopment) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-card border border-border px-3 py-2 rounded-full text-xs font-mono shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-foreground">🏫 Demo Mode (localStorage)</span>
        </div>
      </div>
    </div>
  );
}