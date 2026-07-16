'use client';

import * as React from 'react';
import { usePermissions } from '../hooks/useAuth';
import { AppLoader } from '@/components/feedback/AppLoader';
import { UnauthorizedPage } from '@/components/feedback/UnauthorizedPage';

interface PermissionGuardProps {
  permissions: string[];
  children: React.ReactNode;
}

export function PermissionGuard({ permissions, children }: PermissionGuardProps) {
  const userPermissions = usePermissions();
  
  const hasPermission = React.useMemo(() => {
    return permissions.every((p) => userPermissions.includes(p));
  }, [permissions, userPermissions]);

  if (!userPermissions) {
    return <AppLoader fullScreen />;
  }

  if (!hasPermission) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
}
