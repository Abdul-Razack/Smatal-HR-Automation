'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

import { useTheme } from 'next-themes';

export function ApplicationSettings() {
  const { theme, setTheme } = useTheme();

  const handleAction = () => {
    toast.info('Preferences Saved', { description: 'Your application preferences have been updated.' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Application Settings</h2>
        <p className="text-muted-foreground">Manage your preferences and system configuration</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the application looks on your device.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Dark Mode</label>
                <p className="text-sm text-muted-foreground">Toggle between light and dark themes.</p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Compact View</label>
                <p className="text-sm text-muted-foreground">Reduce padding in tables and lists.</p>
              </div>
              <Switch disabled />
            </div>
            <Button onClick={handleAction} variant="outline" className="mt-4">Save Appearance</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your password and active sessions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button onClick={handleAction} variant="outline">Change Password</Button>
            </div>
            <div>
              <Button onClick={handleAction} variant="outline" className="text-destructive">Log out of all devices</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Control how you receive alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Email Alerts</label>
                <p className="text-sm text-muted-foreground">Receive daily digests of pending workflows.</p>
              </div>
              <Switch disabled />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Push Notifications</label>
                <p className="text-sm text-muted-foreground">Browser alerts for critical system events.</p>
              </div>
              <Switch disabled />
            </div>
            <Button onClick={handleAction} variant="outline" className="mt-4">Save Preferences</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
