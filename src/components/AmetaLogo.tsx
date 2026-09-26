import React from 'react';

interface AmetaLogoProps {
  variant?: 'stacked' | 'horizontal';
  className?: string;
}

export function AmetaLogo({
  variant = 'stacked',
  className = '',
}: AmetaLogoProps) {
  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        <svg
          viewBox="0 0 140 96"
          className="h-9 w-auto shrink-0"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Left Interlocking Navy Diamond */}
          <path
            d="M48 8 L10 46 L48 84 L65 67 L55 57 L48 64 L30 46 L48 28 L75 55 L92 55 L48 8 Z"
            fill="#191E5A"
          />
          {/* Center Small Teal Diamond */}
          <polygon points="56,31 66,41 56,51 46,41" fill="#498A8F" />
          {/* Right Interlocking Teal Diamond */}
          <path
            d="M92 12 L75 29 L85 39 L92 32 L110 50 L92 68 L65 41 L48 41 L92 88 L130 50 L92 12 Z"
            fill="#498A8F"
          />
        </svg>
        <div className="leading-tight">
          <div className="text-base font-bold tracking-tight text-[#191E5A]">
            Ameta Serviços
          </div>
          <div className="text-[11px] font-medium tracking-wide text-[#5E878C]">
            Telecomunicações
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex flex-col items-center text-center select-none ${className}`}
    >
      <svg
        viewBox="0 0 140 96"
        className="h-20 w-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Left Interlocking Navy Diamond */}
        <path
          d="M48 8 L10 46 L48 84 L65 67 L55 57 L48 64 L30 46 L48 28 L75 55 L92 55 L48 8 Z"
          fill="#191E5A"
        />
        {/* Center Small Teal Diamond */}
        <polygon points="56,31 66,41 56,51 46,41" fill="#498A8F" />
        {/* Right Interlocking Teal Diamond */}
        <path
          d="M92 12 L75 29 L85 39 L92 32 L110 50 L92 68 L65 41 L48 41 L92 88 L130 50 L92 12 Z"
          fill="#498A8F"
        />
      </svg>
      <div className="mt-2 text-2xl font-bold tracking-tight text-[#191E5A]">
        Ameta Serviços
      </div>
      <div className="text-sm font-normal tracking-wide text-[#5E878C] -mt-0.5">
        Telecomunicações
      </div>
    </div>
  );
}
