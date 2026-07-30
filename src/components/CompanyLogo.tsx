import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import logoImg from '../logo.png'; // <-- ADDED THIS LINE

interface CompanyLogoProps {
  className?: string;
  imgClassName?: string;
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  className = '',
  imgClassName = '',
  fallbackText = 'TDQS',
  size = 'md',
}) => {
  const [imgError, setImgError] = useState(false);

  // Responsive size presets
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const currentSizeClass = sizeClasses[size];

  if (!imgError) {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src={logoImg} // <-- CHANGED THIS LINE
          alt="Thulir Design & QS Services FZE Logo"
          onError={() => setImgError(true)}
          className={`object-contain ${currentSizeClass} ${imgClassName}`}
        />
      </div>
    );
  }

  // Fallback branded logo with Forest Green styling
  return (
    <div
      className={`${currentSizeClass} bg-gradient-to-br from-emerald-700 to-emerald-900 border border-emerald-500/40 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-950/40 shrink-0 ${className}`}
    >
      <div className="flex flex-col items-center justify-center text-center leading-none">
        <Building2 className="w-4 h-4 text-emerald-300 mb-0.5" />
        <span className="font-extrabold tracking-wider text-[11px] text-white">
          {fallbackText}
        </span>
      </div>
    </div>
  );
};
