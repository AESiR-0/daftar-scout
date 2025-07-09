import { messaging, getToken } from './firebase';

// VAPID key for push notifications
const VAPID_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa1HIkQjf9XjfKzJ8_1VJ6fK1ySbvqQtQ4j2lkP7vtQCs45IeE6zZmM';

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging || !getToken) {
    console.error('Firebase messaging not initialized');
    return null;
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    console.log('FCM token obtained:', token.substring(0, 20) + '...');
    
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Save FCM token to the backend
 */
export async function saveFCMToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('/api/save-fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save FCM token: ${response.statusText}`);
    }

    console.log('FCM token saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return false;
  }
}

/**
 * Initialize push notifications for the current user
 */
export async function initializePushNotifications(): Promise<boolean> {
  try {
    const token = await requestNotificationPermission();
    if (!token) {
      return false;
    }

    const saved = await saveFCMToken(token);
    return saved;
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return false;
  }
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Check if push notifications are enabled
 */
export async function arePushNotificationsEnabled(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  const permission = await Notification.permission;
  return permission === 'granted';
} 