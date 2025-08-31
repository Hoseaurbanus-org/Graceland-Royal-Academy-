import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigation } from '../Layout';
import { useAuth } from '../AuthContext';
import { ComprehensiveAdminDashboard } from './ComprehensiveAdminDashboard';
import { BroadsheetAnalytics } from './BroadsheetAnalytics';
import { RemarksSystem } from './RemarksSystem';
import { AutomationSystem } from './AutomationSystem';

// Re-export the comprehensive dashboard with enhanced features
export function EnhancedAdminDashboard() {
  const { currentView } = useNavigation();
  const { user } = useAuth();

  // Route to appropriate component based on current view
  const renderEnhancedContent = () => {
    switch (currentView) {
      case 'broadsheet':
        return <BroadsheetAnalytics />;
      case 'remarks':
        return <RemarksSystem />;
      case 'automation':
        return <AutomationSystem />;
      default:
        return <ComprehensiveAdminDashboard />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      {renderEnhancedContent()}
    </motion.div>
  );
}