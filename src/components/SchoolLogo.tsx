import React from 'react';
import { motion } from 'motion/react';
import schoolLogoImage from 'figma:asset/f9f8e5655457e1be50e841e78cb4827059d96895.png';

interface SchoolLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  animate?: boolean;
}

export function SchoolLogo({ 
  size = 'md', 
  showText = true, 
  className = '',
  animate = false 
}: SchoolLogoProps) {
  
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const LogoContent = () => (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
        <img 
          src={schoolLogoImage} 
          alt="Graceland Royal Academy Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-primary leading-tight ${textSizeClasses[size]}`}>
            Graceland Royal Academy
          </span>
          {size !== 'xs' && size !== 'sm' && (
            <span className={`text-academic-gold text-xs leading-tight ${size === 'xl' ? 'text-sm' : 'text-xs'}`}>
              Wisdom & Illumination
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <LogoContent />
      </motion.div>
    );
  }

  return <LogoContent />;
}

// Compact version for headers and small spaces
export function CompactSchoolLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={schoolLogoImage} 
        alt="GRA Logo" 
        className="w-8 h-8 object-contain flex-shrink-0"
      />
      <div className="flex flex-col">
        <span className="font-bold text-primary text-sm leading-tight">GRA</span>
        <span className="text-academic-gold text-xs leading-tight">Portal</span>
      </div>
    </div>
  );
}

// Logo for watermarks
export function LogoWatermark({ opacity = 0.05, size = 'large' }: { opacity?: number; size?: 'large' | 'medium' | 'small' }) {
  const sizeClass = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64'
  };

  return (
    <div 
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${sizeClass[size]} pointer-events-none z-0`}
      style={{ opacity }}
    >
      <img 
        src={schoolLogoImage} 
        alt="GRA Watermark" 
        className="w-full h-full object-contain"
      />
    </div>
  );
}