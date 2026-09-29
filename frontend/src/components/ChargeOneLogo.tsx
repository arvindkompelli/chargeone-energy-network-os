import React from 'react';

interface ChargeOneLogoProps {
  className?: string;
  size?: number;
}

export const ChargeOneLogo: React.FC<ChargeOneLogoProps> = ({
  className = 'h-8 w-auto',
  size = 32,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ChargeOne Energy Network OS"
    >
      <defs>
        <linearGradient id="chargeone-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00A86B" />
          <stop offset="50%" stopColor="#006948" />
          <stop offset="100%" stopColor="#004D34" />
        </linearGradient>
        <linearGradient id="chargeone-bolt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#85F8C4" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
        <filter id="chargeone-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Outer rounded hexagon background */}
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="10"
        fill="url(#chargeone-grad)"
        stroke="#85F8C4"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />
      
      {/* Inner subtle grid lines */}
      <circle cx="20" cy="20" r="14" stroke="#85F8C4" strokeOpacity="0.15" strokeDasharray="2 3" />
      
      {/* High-voltage Lightning Bolt */}
      <path
        d="M22.5 7L13 19.5H19.5L17.5 33L27 20.5H20.5L22.5 7Z"
        fill="url(#chargeone-bolt)"
        filter="url(#chargeone-glow)"
      />
    </svg>
  );
};
