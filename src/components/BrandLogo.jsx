import React from 'react';

export function BrandIcon({ size = 32, className = '' }) {
  return (
    <img
      src="/logo-icon.png"
      alt="friends at concert"
      width={size}
      height={size}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        flexShrink: 0,
        display: 'inline-block',
        userSelect: 'none'
      }}
    />
  );
}

export default function BrandLogo({ size = 38, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        flexShrink: 0
      }}
      title="friends at concert — Home"
    >
      <img
        src="/logo.png"
        alt="friends at concert"
        style={{
          height: `${size}px`,
          width: 'auto',
          objectFit: 'contain',
          display: 'block'
        }}
      />
    </div>
  );
}
