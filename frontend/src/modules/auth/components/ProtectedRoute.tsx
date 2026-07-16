'use client';

import * as React from 'react';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import { AppLoader } from '@/components/feedback/AppLoader';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'idle') {
    return <AppLoader fullScreen />;
  }

  if (status === 'unauthenticated') {
    return null; // Next router will handle redirect
  }

  return <>{children}</>;
}
