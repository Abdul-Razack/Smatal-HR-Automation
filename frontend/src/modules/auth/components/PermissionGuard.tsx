'use client';

import * as React from 'react';
import { usePermissions } from '../hooks/useAuth';
import { AppLoader } from '@/components/feedback/AppLoader';
import { UnauthorizedPage } from '@/components/feedback/UnauthorizedPage';

interface PermissionGuardProps {
  permissions: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ permissions, children, fallback = <UnauthorizedPage /> }: PermissionGuardProps) {
  const userPermissions = usePermissions();
  
  const hasPermission = React.useMemo(() => {
    if (!userPermissions || userPermissions.length === 0) return false;
    if (userPermissions.includes('*') || userPermissions.includes('ALL')) return true;
    return permissions.every((p) => {
      if (userPermissions.includes(p)) return true;
      const normalized = p.replace(':view', ':read');
      return userPermissions.includes(normalized);
    });
  }, [permissions, userPermissions]);

  if (!userPermissions) {
    return <AppLoader fullScreen />;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
