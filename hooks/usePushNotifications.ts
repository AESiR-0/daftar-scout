import { useState, useEffect } from 'react';
import { initializePushNotifications, arePushNotificationsEnabled, isPushNotificationSupported } from '@/utils/fcm';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = isPushNotificationSupported();
      setIsSupported(supported);

      if (supported) {
        const enabled = await arePushNotificationsEnabled();
        setIsEnabled(enabled);
      }
    };

    checkSupport();
  }, []);

  const initialize = async () => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return false;
    }

    setIsInitializing(true);
    setError(null);

    try {
      const success = await initializePushNotifications();
      if (success) {
        setIsEnabled(true);
        return true;
      } else {
        setError('Failed to initialize push notifications');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setIsInitializing(false);
    }
  };

  return {
    isSupported,
    isEnabled,
    isInitializing,
    error,
    initialize,
  };
} 