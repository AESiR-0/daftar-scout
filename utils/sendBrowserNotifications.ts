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
    console.log(`[PUSH] Attempting to send notifications to ${userIds.length} users:`, userIds);
    
    // Check if Firebase Admin is available
    if (!admin) {
      console.warn('[PUSH] Firebase Admin SDK not available. Skipping push notifications.');
      return;
    }

    // 1. Get FCM tokens for the users using Drizzle
    const userTokens = await db
      .select({ fcm_token: users.fcm_token })
      .from(users)
      .where(inArray(users.id, userIds));

    const tokens = userTokens
      .map(row => row.fcm_token)
      .filter(Boolean) as string[];

    if (!tokens.length) {
      console.log(`[PUSH] No FCM tokens found for users:`, userIds);
      console.log(`[PUSH] Users need to enable push notifications in their browser`);
      return;
    }

    console.log(`[PUSH] Found ${tokens.length} FCM tokens for ${userIds.length} users`);

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
        console.log(`[PUSH] ✅ Notification sent successfully to token: ${token.substring(0, 10)}...`);
        return { success: true, token: token.substring(0, 10) };
      } catch (err) {
        console.error('[PUSH] ❌ FCM send error for token:', token.substring(0, 10), err);
        // If token is invalid, we should remove it from the database
        if (err instanceof Error && err.message.includes('InvalidRegistration')) {
          await db
            .update(users)
            .set({ fcm_token: null })
            .where(eq(users.fcm_token, token));
          console.log(`[PUSH] 🗑️ Removed invalid FCM token: ${token.substring(0, 10)}...`);
        }
        return { success: false, token: token.substring(0, 10), error: err };
      }
    });

    const results = await Promise.allSettled(sendPromises);
    const successful = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
    const failed = results.length - successful;
    
    console.log(`[PUSH] 📊 Results: ${successful} successful, ${failed} failed out of ${tokens.length} attempts`);
  } catch (error) {
    console.error('[PUSH] ❌ Error in sendBrowserNotifications:', error);
    // Don't throw error, just log it so it doesn't break the notification flow
  }
} 