import * as admin from 'firebase-admin';
import { db } from '@/backend/database';
import { users } from '@/backend/drizzle/models/users';
import { eq, inArray } from 'drizzle-orm';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * Send browser push notifications to a list of user IDs.
 * @param userIds - Array of user IDs to notify
 * @param title - Notification title
 * @param body - Notification body
 */
export async function sendBrowserNotifications(
  userIds: string[], 
  title: string, 
  body: string
): Promise<void> {
  try {
    // 1. Get FCM tokens for the users using Drizzle
    const userTokens = await db
      .select({ fcm_token: users.fcm_token })
      .from(users)
      .where(inArray(users.id, userIds));

    const tokens = userTokens
      .map(row => row.fcm_token)
      .filter(Boolean) as string[];

    if (!tokens.length) {
      console.log('No FCM tokens found for users:', userIds);
      return;
    }

    // 2. Send notification to each token
    const message = {
      notification: { title, body },
      webpush: {
        headers: { Urgency: 'high' },
        notification: { 
          icon: '/icon.png', 
          badge: '/badge.png',
          click_action: '/notifications'
        }
      }
    };

    const sendPromises = tokens.map(async (token) => {
      try {
        await admin.messaging().send({ ...message, token });
        console.log(`Notification sent successfully to token: ${token.substring(0, 10)}...`);
      } catch (err) {
        console.error('FCM send error for token:', token.substring(0, 10), err);
        // If token is invalid, we should remove it from the database
        if (err instanceof Error && err.message.includes('InvalidRegistration')) {
          await db
            .update(users)
            .set({ fcm_token: null })
            .where(eq(users.fcm_token, token));
          console.log(`Removed invalid FCM token: ${token.substring(0, 10)}...`);
        }
      }
    });

    await Promise.allSettled(sendPromises);
    console.log(`Attempted to send notifications to ${tokens.length} users`);
  } catch (error) {
    console.error('Error in sendBrowserNotifications:', error);
    throw error;
  }
} 