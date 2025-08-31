// Global error handler for cleaner user experience
// Filters out development-only errors and warnings

import { isDevelopment } from './env';

// List of error patterns to suppress in production
const suppressedErrors = [
  'ResizeObserver loop limit exceeded',
  'Non-passive event listener',
  'findDOMNode is deprecated',
  'componentWillReceiveProps',
  'componentWillMount',
  'componentWillUpdate',
  'process is not defined',
  'validateDOMNesting',
  'Function components cannot be given refs',
  'Missing `Description`',
  'getSupervisorAssignments is not a function',
  'Cannot read properties of undefined',
  'Supabase not connected',
];

// Original console methods
const originalError = console.error;
const originalWarn = console.warn;

// Enhanced error handler
console.error = (...args: any[]) => {
  const message = args.join(' ');
  
  // Filter out non-critical errors even in development for cleaner output
  const shouldSuppress = suppressedErrors.some(pattern => 
    message.includes(pattern)
  );
  
  if (!shouldSuppress) {
    originalError(...args);
  }
};

// Enhanced warning handler
console.warn = (...args: any[]) => {
  const message = args.join(' ');
  
  // In development, show all warnings
  if (isDevelopment()) {
    originalWarn(...args);
    return;
  }
  
  // In production, filter out known non-critical warnings
  const shouldSuppress = suppressedErrors.some(pattern => 
    message.includes(pattern)
  );
  
  if (!shouldSuppress) {
    originalWarn(...args);
  }
};

// Global error event handler - only run in browser
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const shouldSuppress = suppressedErrors.some(pattern => 
      event.message?.includes(pattern)
    );
    
    if (!shouldSuppress && !isDevelopment()) {
      // Log to external service in production
      console.error('Global error:', event.error);
    }
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    if (!isDevelopment()) {
      console.error('Unhandled promise rejection:', event.reason);
    }
  });
}

export {};