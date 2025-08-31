// Environment configuration utility
// Provides safe access to environment variables across browser and server environments

interface EnvironmentConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  NODE_ENV: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isClient: boolean;
  isServer: boolean;
}

// Safe environment variable getter
export function getEnvVar(name: string, defaultValue: string = ''): string {
  // Browser environment - check for various ways env vars might be exposed
  if (typeof window !== 'undefined') {
    try {
      // Check window.__ENV__ if set by bundler
      const windowEnv = (window as any).__ENV__;
      if (windowEnv && windowEnv[name]) {
        return windowEnv[name];
      }
      
      // Check if process is available in window (some bundlers expose it)
      if ((window as any).process?.env) {
        return (window as any).process.env[name] || defaultValue;
      }
    } catch (e) {
      // Ignore errors and continue
    }
    
    return defaultValue;
  }
  
  // Server/Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name] || defaultValue;
  }
  
  return defaultValue;
}

// Environment detection utilities
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function isServer(): boolean {
  return typeof window === 'undefined';
}

export function isDevelopment(): boolean {
  const nodeEnv = getEnvVar('NODE_ENV', 'development').toLowerCase();
  
  // Primary check - NODE_ENV
  if (nodeEnv === 'development') {
    return true;
  }
  
  // Secondary checks for browser environment
  if (isClient()) {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' ||
           hostname.includes('figma.com');
  }
  
  // Default to false in server environments
  return false;
}

export function isProduction(): boolean {
  return !isDevelopment();
}

// Main environment configuration
export const env: EnvironmentConfig = {
  SUPABASE_URL: getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co'),
  SUPABASE_ANON_KEY: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder-key'),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  isDevelopment: isDevelopment(),
  isProduction: isProduction(),
  isClient: isClient(),
  isServer: isServer(),
};

// Validation helpers
export function isSupabaseConfigured(): boolean {
  return Boolean(
    env.SUPABASE_URL && 
    env.SUPABASE_ANON_KEY && 
    env.SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    env.SUPABASE_ANON_KEY !== 'placeholder-key' &&
    env.SUPABASE_URL.includes('supabase.co')
  );
}

export function getEnvironmentInfo() {
  return {
    ...env,
    isSupabaseConfigured: isSupabaseConfigured(),
    hasValidSupabaseUrl: env.SUPABASE_URL !== 'https://placeholder.supabase.co',
    hasValidSupabaseKey: env.SUPABASE_ANON_KEY !== 'placeholder-key',
  };
}

// Development helpers
export function logEnvironmentInfo() {
  if (isDevelopment()) {
    console.log('🔧 Environment Configuration:', getEnvironmentInfo());
  }
}

export default env;