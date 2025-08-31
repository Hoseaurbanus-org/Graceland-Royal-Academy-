import React from 'react';
import schoolLogo from 'figma:asset/f9f8e5655457e1be50e841e78cb4827059d96895.png';

interface SchoolWatermarkProps {
  opacity?: number;
  size?: 'small' | 'medium' | 'large';
  position?: 'center' | 'top-right' | 'bottom-center' | 'background';
  showText?: boolean;
  className?: string;
}

export function SchoolWatermark({ 
  opacity = 0.1, 
  size = 'medium', 
  position = 'center',
  showText = true,
  className = '' 
}: SchoolWatermarkProps) {
  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-48 h-48', 
    large: 'w-72 h-72'
  };

  const positionClasses = {
    center: 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'top-right': 'absolute top-4 right-4',
    'bottom-center': 'absolute bottom-4 left-1/2 transform -translate-x-1/2',
    background: 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-lg'
  };

  return (
    <div 
      className={`${positionClasses[position]} pointer-events-none select-none ${className}`}
      style={{ opacity }}
    >
      <div className="flex flex-col items-center space-y-2">
        {/* School Logo */}
        <div className={`${sizeClasses[size]} relative`}>
          <img 
            src={schoolLogo} 
            alt="Graceland Royal Academy"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>
        
        {/* School Text - Only show if requested */}
        {showText && (
          <div className="text-center space-y-1">
            <div className={`font-bold text-navy ${textSizeClasses[size]} tracking-wide`}>
              GRACELAND ROYAL ACADEMY
            </div>
            <div className={`font-semibold text-gold ${size === 'large' ? 'text-base' : size === 'medium' ? 'text-sm' : 'text-xs'} tracking-widest`}>
              WISDOM & ILLUMINATION
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Specialized watermark for receipts and results
export function DocumentWatermark({ className = '' }: { className?: string }) {
  return (
    <SchoolWatermark 
      opacity={0.08}
      size="large"
      position="center"
      showText={true}
      className={className}
    />
  );
}

// Background watermark for dashboards
export function BackgroundWatermark() {
  return (
    <SchoolWatermark 
      opacity={0.03}
      size="large"
      position="background"
      showText={false}
    />
  );
}

// Header logo component
export function HeaderLogo({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const logoSizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className={`${logoSizes[size]} flex-shrink-0`}>
      <img 
        src={schoolLogo} 
        alt="Graceland Royal Academy"
        className="w-full h-full object-contain"
      />
    </div>
  );
}