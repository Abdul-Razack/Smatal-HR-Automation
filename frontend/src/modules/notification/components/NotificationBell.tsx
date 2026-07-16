'use client';

import * as React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotification } from '../hooks/useNotification';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const { useNotifications, markAsRead } = useNotification();
  const { data: notifications = [] } = useNotifications(true); // Fetch unread only for badge

  const handleRead = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markAsRead.mutate(id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          <Badge variant="secondary">{notifications.length} Unread</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-sm text-center text-muted-foreground">
            No new notifications
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map((notif) => (
              <DropdownMenuItem key={notif.id} className="flex flex-col items-start p-4 cursor-pointer gap-1">
                <div className="flex w-full justify-between items-start gap-2">
                  <span className="font-medium text-sm leading-none">{notif.title}</span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                <div className="flex w-full justify-between items-center mt-2">
                  {notif.referenceType === 'WORKFLOW' && notif.referenceId ? (
                    <Link href={`/hr/workflows/${notif.referenceId}`} className="text-xs text-primary hover:underline">
                      View Workflow
                    </Link>
                  ) : <span />}
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-xs h-6 px-2" onClick={(e) => handleRead(notif.id, e)}>
                    Mark Read
                  </Button>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
