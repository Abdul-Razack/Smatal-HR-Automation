'use client';

import * as React from 'react';
import { Bell, Search, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { NotificationBell } from '@/modules/notification/components/NotificationBell';
import { GlobalSearchDropdown } from '@/modules/search/components/GlobalSearchDropdown';
import { useAuthStore } from '@/store';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { logout, isLoggingOut } = useAuth();
  const user = useAuthStore((state) => state.currentUser);

  // Derive initials
  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'JD';

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        {/* Breadcrumb Placeholder */}
        <div className="text-sm font-medium text-muted-foreground">
          Home / <span className="text-foreground">Dashboard</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <GlobalSearchDropdown />

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full p-2 hover:bg-accent hover:text-accent-foreground"
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
              <a href="/settings/profile" className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground">Profile</a>
              <a href="/settings/preferences" className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground">Settings</a>
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
