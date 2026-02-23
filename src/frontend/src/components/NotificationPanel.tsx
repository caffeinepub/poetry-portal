import React from 'react';
import { useGetNotifications, useMarkNotificationAsRead } from '../hooks/useQueries';
import { formatDate } from '../utils/formatDate';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Check, Loader2 } from 'lucide-react';

export default function NotificationPanel() {
  const { data: notifications, isLoading } = useGetNotifications();
  const markAsRead = useMarkNotificationAsRead();

  const handleMarkAsRead = async (index: number) => {
    try {
      await markAsRead.mutateAsync(BigInt(index));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">Notifications</h3>
      </div>
      <ScrollArea className="h-[400px]">
        <div className="p-2">
          {notifications.map((notification, index) => (
            <div key={index}>
              <div
                className={`p-3 rounded-lg transition-colors ${
                  notification.read ? 'bg-background' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-snug">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(notification.timestamp)}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleMarkAsRead(index)}
                      disabled={markAsRead.isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              {index < notifications.length - 1 && <Separator className="my-1" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
