'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronLeft, Menu } from 'lucide-react';
import { navigationConfig } from '@/config/navigation';
import { useAuthStore } from '@/store';
import { usePermissions } from '@/modules/auth/hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const permissions = usePermissions();

  // Filter and sort navigation items based on permissions
  const authorizedNavigation = React.useMemo(() => {
    return navigationConfig
      .filter((item) => {
        if (!item.permission || permissions.length === 0) return true;
        return permissions.includes(item.permission);
      })
      .sort((a, b) => a.order - b.order);
  }, [permissions]);

  return (
    <div
      className={cn(
        'relative flex h-full flex-col border-r bg-card transition-all duration-300 ease-in-out',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {isOpen && (
          <span className="text-lg font-semibold tracking-tight">Smatal HR</span>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
        >
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {authorizedNavigation.map((item) => {
            const isActive = pathname === item.route;
            return (
              <Link
                key={item.id}
                href={item.route}
                className={cn(
                  'flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  !isOpen && 'justify-center'
                )}
                title={!isOpen ? item.title : undefined}
              >
                <item.icon
                  className={cn(
                    'flex-shrink-0',
                    isOpen ? 'mr-3 h-5 w-5' : 'h-6 w-6'
                  )}
                />
                {isOpen && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
