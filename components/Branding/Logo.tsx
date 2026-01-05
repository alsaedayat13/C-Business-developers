
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  hideText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-12", variant = 'dark', hideText = false }) => {
  const color = variant === 'light' ? '#FFFFFF' : '#0F172A';
  
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto shrink-0">
        <path d="M50 10V90" stroke={color} strokeWidth="8" strokeLinecap="square" />
        <path d="M20 50H80" stroke={color} strokeWidth="8" strokeLinecap="square" />
        <rect x="35" y="35" width="30" height="30" fill={color} />
      </svg>
      
      {!hideText && (
        <div className="flex flex-col justify-center border-r border-slate-200 pr-4">
          <span style={{ color }} className="text-xl font-bold tracking-tighter uppercase leading-none">Business Developers</span>
          <span style={{ color, opacity: 0.4 }} className="text-[8px] font-bold uppercase tracking-[0.4em] leading-none mt-1">Institutional Build</span>
        </div>
      )}
    </div>
  );
};
