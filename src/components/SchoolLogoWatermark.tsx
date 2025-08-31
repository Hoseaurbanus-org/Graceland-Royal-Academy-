import React from 'react';
import schoolLogoImage from 'figma:asset/f9f8e5655457e1be50e841e78cb4827059d96895.png';

interface SchoolLogoWatermarkProps {
  size?: 'small' | 'medium' | 'large';
  opacity?: number;
  className?: string;
}

export function SchoolLogoWatermark({ 
  size = 'large', 
  opacity = 0.05,
  className = '' 
}: SchoolLogoWatermarkProps) {
  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64'
  };

  return (
    <div 
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${sizeClasses[size]} pointer-events-none z-0 ${className}`}
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