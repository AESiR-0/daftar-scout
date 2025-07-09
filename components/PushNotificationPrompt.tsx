import React from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, AlertCircle } from 'lucide-react';

interface PushNotificationPromptProps {
  className?: string;
  variant?: 'button' | 'card';
}

export function PushNotificationPrompt({ 
  className = '', 
  variant = 'button' 
}: PushNotificationPromptProps) {
  const { isSupported, isEnabled, isInitializing, error, initialize } = usePushNotifications();

  if (!isSupported) {
    return null; // Don't show anything if not supported
  }

  if (isEnabled) {
    return (
      <div className={`flex items-center gap-2 text-green-600 ${className}`}>
        <Bell className="h-4 w-4" />
        <span className="text-sm">Push notifications enabled</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900 mb-1">
              Enable Push Notifications
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Get instant notifications about new scouts, offers, and updates.
            </p>
            {error && (
              <div className="flex items-center gap-2 text-red-600 mb-3">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            <Button
              onClick={initialize}
              disabled={isInitializing}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              {isInitializing ? 'Enabling...' : 'Enable Notifications'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={initialize}
      disabled={isInitializing}
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 ${className}`}
    >
      <BellOff className="h-4 w-4" />
      {isInitializing ? 'Enabling...' : 'Enable Notifications'}
    </Button>
  );
} 