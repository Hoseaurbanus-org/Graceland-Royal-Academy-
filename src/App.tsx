import React from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { NotificationProvider } from './components/NotificationContext';
import { Layout } from './components/Layout';
import { CalendarProvider } from './components/CalendarContext';
import { LoginPage } from './components/LoginPage';
import { WelcomeParent } from './components/WelcomeParent';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingScreen } from './components/LoadingScreen';
import { DashboardRenderer } from './components/DashboardRenderer';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { user, completeOnboarding, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginPage />;
  }

  if (user.isNewUser && user.role === 'parent') {
    return <WelcomeParent onComplete={completeOnboarding} />;
  }

  return (
    <Layout>
      <DashboardRenderer user={user} />
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <CalendarProvider>
            <div className="min-h-screen">
              <AppContent />
              <Toaster 
                position="bottom-right"
                richColors
                closeButton
              />
            </div>
          </CalendarProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;