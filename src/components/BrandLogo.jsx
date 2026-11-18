import React from 'react';

export function BrandIcon({ size = 32, className = '' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0, display: 'inline-block' }}
    >
      {/* Dark rounded badge */}
      <rect width="64" height="64" rx="18" fill="#111827"/>
      <rect x="1.5" y="1.5" width="61" height="61" rx="16.5" stroke="#2a3241" strokeWidth="3"/>
      
      {/* 3D Beamed Music Notes (Two friends linked by live music) */}
      <path d="M22 22 L46 16 V23 L22 29 Z" fill="#46A302"/>
      <path d="M22 20 L46 14 V20 L22 26 Z" fill="#58CC02"/>
      
      {/* Left Note Stem & Head */}
      <rect x="22" y="24" width="4.5" height="22" rx="2" fill="#58CC02"/>
      <ellipse cx="19" cy="45" rx="7" ry="5.5" transform="rotate(-20 19 45)" fill="#58CC02"/>
      <circle cx="17.5" cy="43.5" r="1.8" fill="#ffffff" opacity="0.85"/>

      {/* Right Note Stem & Head */}
      <rect x="42" y="18" width="4.5" height="22" rx="2" fill="#58CC02"/>
      <ellipse cx="39" cy="39" rx="7" ry="5.5" transform="rotate(-20 39 39)" fill="#58CC02"/>
      <circle cx="37.5" cy="37.5" r="1.8" fill="#ffffff" opacity="0.85"/>
      
      {/* Concert Energy Spark */}
      <circle cx="48" cy="11" r="3" fill="#58CC02"/>
    </svg>
  );
}

export default function BrandLogo({ size = 30, fontSize = '1.2rem', onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '9px',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        flexShrink: 0
      }}
      title="friends at concert"
    >
      <BrandIcon size={size} />
      <span style={{ 
        fontSize: fontSize, 
        fontWeight: 900, 
        letterSpacing: '-0.5px', 
        color: '#111827',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        whiteSpace: 'nowrap'
      }}>
        friends at concert
        <span style={{ 
          display: 'inline-block', 
          width: '7px', 
          height: '7px', 
          borderRadius: '50%', 
          backgroundColor: '#58CC02',
          flexShrink: 0
        }} />
      </span>
    </div>
  );
}
