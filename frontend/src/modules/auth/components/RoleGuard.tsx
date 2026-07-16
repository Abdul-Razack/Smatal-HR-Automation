'use client';

import * as React from 'react';
import { useAuthStore } from '@/store';
import { AppLoader } from '@/components/feedback/AppLoader';
import { UnauthorizedPage } from '@/components/feedback/UnauthorizedPage';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const roles = useAuthStore((state) => state.roles);
  
  const hasRole = React.useMemo(() => {
    return allowedRoles.some((r) => roles.includes(r));
  }, [allowedRoles, roles]);

  if (!hasRole) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
}
