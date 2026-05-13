'use client';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  useEffect(() => {
    if (user?.branding?.primaryColor) {
      document.documentElement.style.setProperty('--primary', user.branding.primaryColor);
    }
  }, [user?.branding?.primaryColor]);
  return <>{children}</>;
}
