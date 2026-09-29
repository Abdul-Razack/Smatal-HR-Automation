'use client';

import * as React from 'react';
import { Bell, Search, Sun, Moon, LogOut, ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { NotificationBell } from '@/modules/notification/components/NotificationBell';
import { GlobalSearchDropdown } from '@/modules/search/components/GlobalSearchDropdown';
import { useAuthStore } from '@/store';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const getBreadcrumbs = (path: string): BreadcrumbItem[] => {
  const crumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

  if (path === '/') {
    return crumbs;
  }

  // Templates routes
  if (path.startsWith('/documents/templates')) {
    const isRoot = path === '/documents/templates';
    crumbs.push({
      label: 'Templates',
      href: isRoot ? undefined : '/documents/templates',
    });

    if (path === '/documents/templates/create') {
      crumbs.push({ label: 'Create Template' });
    } else if (path.includes('/edit')) {
      const id = path.split('/')[3];
      crumbs.push({
        label: 'Template Details',
        href: `/documents/templates/${id}`,
      });
      crumbs.push({ label: 'Edit Content' });
    } else if (path !== '/documents/templates') {
      crumbs.push({ label: 'Template Details' });
    }
    return crumbs;
  }

  // Employees routes
  if (path.startsWith('/hr/employees')) {
    const isRoot = path === '/hr/employees';
    crumbs.push({
      label: 'Employees',
      href: isRoot ? undefined : '/hr/employees',
    });
    if (path.includes('/create')) {
      crumbs.push({ label: 'Add Employee' });
    } else if (path !== '/hr/employees') {
      crumbs.push({ label: 'Employee Profile' });
    }
    return crumbs;
  }

  // Generated Documents routes
  if (path.startsWith('/hr/documents') || path.startsWith('/documents/generated')) {
    const isRoot = path === '/hr/documents';
    crumbs.push({
      label: 'Documents',
      href: isRoot ? undefined : '/hr/documents',
    });
    if (path !== '/hr/documents') {
      crumbs.push({ label: 'Document Details' });
    }
    return crumbs;
  }

  // Exit & Resignation routes
  if (path.startsWith('/hr/exit')) {
    crumbs.push({ label: 'Exit & Resignation' });
    return crumbs;
  }

  // Company Settings routes
  if (path.startsWith('/master')) {
    crumbs.push({ label: 'Company Settings' });
    return crumbs;
  }

  // Audit Logs routes
  if (path.startsWith('/hr/audit')) {
    crumbs.push({ label: 'Audit Logs' });
    return crumbs;
  }

  // Settings routes
  if (path.startsWith('/settings')) {
    crumbs.push({ label: 'Settings' });
    return crumbs;
  }

  return crumbs;
};

export function Header() {
  const { theme, setTheme } = useTheme();
  const { logout, isLoggingOut } = useAuth();
  const user = useAuthStore((state) => state.currentUser);
  const pathname = usePathname();

  const breadcrumbs = React.useMemo(() => getBreadcrumbs(pathname), [pathname]);

  // Derive initials
  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'JD';

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        {/* Dynamic Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" />
                )}
                {isLast || !crumb.href ? (
                  <span className={cn('truncate', isLast ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground hover:underline transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <GlobalSearchDropdown />

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </button>

        <NotificationBell />

        {/* Profile Placeholder (Functional Logout) */}
        <div className="relative group">
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background">
            <span className="text-sm font-medium">{initials}</span>
          </button>
          <div className="absolute right-0 mt-2 w-48 rounded-md border bg-popover shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <div className="p-2">
              <div className="px-2 py-1.5 text-sm font-medium truncate">{user?.name || 'John Doe'}</div>
              <div className="px-2 py-1 text-xs text-muted-foreground truncate">{user?.email || 'john@example.com'}</div>
              <div className="my-1 h-px bg-border" />
              <Link href="/settings/profile" className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground">Profile</Link>
              <Link href="/settings/preferences" className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground">Settings</Link>
              <div className="my-1 h-px bg-border" />
              <button
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
