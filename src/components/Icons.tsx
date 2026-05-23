import React from 'react';

type Props = {
  size?: number;
  className?: string;
};

export function CalcIcon({ size = 20, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="2" width="18" height="20" rx="3" />
      <line x1="7" y1="6" x2="17" y2="6" />
      <text x="8" y="18" fontSize="8" fontWeight="900" fill="currentColor" stroke="none">+</text>
      <text x="14" y="18" fontSize="8" fontWeight="900" fill="currentColor" stroke="none">-</text>
    </svg>
  );
}

export function TallerIcon({ size = 20, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M4 22V6a2 2 0 0 1 2-2h8l6 6v12" />
      <path d="M8 12h2" />
      <path d="M8 16h6" />
      <path d="M16 12h2" />
    </svg>
  );
}

export function SwordIcon({ size = 20, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 9.5L18 6" />
      <path d="M6 18l3.5-3.5" />
      <path d="M4 20l4-4 8-8 4-4" />
      <path d="M14.5 9.5l4 4" />
      <path d="M9.5 14.5l4 4" />
    </svg>
  );
}

export function HelmetIcon({ size = 20, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2a9 9 0 0 1 9 9v3" />
      <path d="M3 14v-3a9 9 0 0 1 9-9" />
      <path d="M3 14h18v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" />
      <circle cx="12" cy="14" r="2" />
    </svg>
  );
}

export function ChestIcon({ size = 20, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 6h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M4 10h16" />
      <path d="M8 14h2" />
      <path d="M14 14h2" />
      <path d="M12 6v2" />
    </svg>
  );
}

export function BootIcon({ size = 20, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 20h16l-1-6H5z" />
      <path d="M5 14L3 8h5l2 6" />
      <path d="M19 14l2-6h-5l-2 6" />
      <path d="M12 8v6" />
      <circle cx="12" cy="20" r="1.5" />
    </svg>
  );
}

export function ShieldIcon({ size = 20, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2L3 7v5c0 5.5 4.5 10 9 10s9-4.5 9-10V7z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function BagIcon({ size = 20, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 8h12l1.5 12H4.5z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      <circle cx="9" cy="14" r="1" />
      <circle cx="15" cy="14" r="1" />
    </svg>
  );
}

export function DatabaseIcon({ size = 20, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v4c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
      <path d="M4 12v4c0 1.7 3.6 3 8 3s8-1.3 8-3v-4" />
    </svg>
  );
}

export function SettingsIcon({ size = 20, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2" />
      <path d="M12 21v2" />
      <path d="M4.22 4.22l1.42 1.42" />
      <path d="M18.36 18.36l1.42 1.42" />
      <path d="M1 12h2" />
      <path d="M21 12h2" />
      <path d="M4.22 19.78l1.42-1.42" />
      <path d="M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

export function FlameIcon({ size = 22, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-3-8-7-13z" />
      <path d="M12 22c-2 0-4-1-4-3 0-2 4-5 4-5s4 3 4 5c0 2-2 3-4 3z" />
    </svg>
  );
}

export function SparkleIcon({ size = 22, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2l1.5 5.5L17 3l-2 6.5 6-1.5-5.5 3L18 14l-6-1-1 6-1-6-6 1 4.5-3.5L3 8l6 1.5L7 3l3.5 4.5z" />
    </svg>
  );
}

export function ChefIcon({ size = 22, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 13.5A3.5 3.5 0 0 1 8 7a4 4 0 0 1 8 0 3.5 3.5 0 0 1 2 6.5" />
      <path d="M6 17h12" />
      <path d="M8 17v4" />
      <path d="M16 17v4" />
    </svg>
  );
}

export function SearchIcon({ size = 15, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </svg>
  );
}

export function CloseIcon({ size = 13, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function ChevronIcon({ size = 16, className, dir = 'down' }: Props & { dir?: 'up' | 'down' | 'left' | 'right' }) {
  const rotate = dir === 'up' ? '180' : dir === 'left' ? '90' : dir === 'right' ? '-90' : '0';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}
         style={{ transform: `rotate(${rotate}deg)` }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function PanelIcon({ size = 18, className, side = 'left' }: Props & { side?: 'left' | 'right' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      {side === 'left' ? (
        <line x1="9" y1="3" x2="9" y2="21" />
      ) : (
        <line x1="15" y1="3" x2="15" y2="21" />
      )}
      <line x1={side === 'left' ? '12' : '18'} y1="9" x2={side === 'left' ? '12' : '18'} y2="15" strokeWidth="3" />
    </svg>
  );
}

export function LangIcon({ size = 14, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function ShirtIcon({ size = 22, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 4h4l2 3 2-3h4l-1 8H7z" />
      <path d="M7 12l-3 8h16l-3-8" />
    </svg>
  );
}

export function BookIcon({ size = 20, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}
