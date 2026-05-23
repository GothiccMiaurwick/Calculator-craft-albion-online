'use client';

import { useEffect } from 'react';
import { useApp } from '@/lib/AppContext';

export default function ThemeClient({ children }: { children: React.ReactNode }) {
  const { theme } = useApp();

  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  return <div className="app-layout">{children}</div>;
}
