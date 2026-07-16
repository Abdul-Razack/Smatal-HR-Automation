'use client';

import * as React from 'react';
import { useNotification } from '../hooks/useNotification';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function NotificationCenter() {
  const { useNotifications, markAsRead } = useNotification();
  const { data: notifications = [], isLoading } = useNotifications();

  if (isLoading) {
    return <div className="p-8 text-center">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notification Center</h2>
          <p className="text-muted-foreground">Stay updated on your workflow tasks and alerts</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-20" />
              <p>You have no notifications.</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n: any) => (
                <div key={n.id} className={`p-4 flex gap-4 transition-colors hover:bg-muted/50 ${!n.isRead ? 'bg-primary/5' : ''}`}>
                  <div className="mt-1">
                    {!n.isRead ? (
                      <Circle className="h-4 w-4 fill-primary text-primary" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${!n.isRead ? 'font-medium' : 'text-muted-foreground'}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                      {n.referenceId && n.referenceType === 'WORKFLOW_INSTANCE' && (
                        <Link href={`/hr/workflows/${n.referenceId}`} className="text-xs text-primary hover:underline font-medium">
                          View Workflow
                        </Link>
                      )}
                    </div>
                  </div>
                  {!n.isRead && (
                    <Button variant="ghost" size="sm" onClick={() => markAsRead.mutate(n.id)}>
                      Mark Read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
