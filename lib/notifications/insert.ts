import { db } from "@/backend/database"; // your drizzle client
import { notifications } from "@/backend/drizzle/models/notifications"; // adjust if different
import { users } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";
import {
  NotificationPayload,
  NotificationType,
  NotificationRole,
} from "./type";

export interface CreateNotificationInput {
  type: NotificationType;
  title?: string;
  description?: string;
  role?: NotificationRole;
  targeted_users?: string[];
  payload?: NotificationPayload;
}

export async function createNotification({
  type,
  role = "both",
  title = "",
  description = "",
  targeted_users = [],
  payload,
}: CreateNotificationInput) {
  try {
    // Create the notification
    const [notification] = await db.insert(notifications).values({
      type,
      role,
      title,
      description,
      targeted_users,
      payload,
    }).returning();

    // Send email for each targeted user
    for (const userId of targeted_users) {
      try {
        // Fetch user email from users table
        const [user] = await db
          .select({ email: users.email })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (!user?.email) {
          console.error(`No email found for user ${userId}`);
          continue;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notification,
            userId,
            userEmail: user.email,
          }),
        });

        if (!response.ok) {
          console.error(`Failed to send email to user ${userId}`);
        }
      } catch (error) {
        console.error(`Error sending email to user ${userId}:`, error);
      }
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Requests

// Scout Collboration Request

// Scout Name
// Daftar Name
// date
// Accept/Reject

// Updates  - Founder

// Congratulations. [Username] has recently joined your Pitch. More skills, more opportunities.

// [Username] is removed from your Pitch

// Congratulations You've received a new offer from [ Scout ] Hosted by [ Daftar ]

// The Pitch is permanently deleted from Daftar's server.

// Offer received from the investor for [pitchName].

// Offer withdrawn by (Team member) for [pitchName].

// You have received [Document Name] from the investor for [pitchName].

// Alerts - Founders

// Pitch delete request. Waiting for your approval. Requested by [User]
// [Username] has exited your Pitch.
// Offer declined by the investor for [pitchName].

// Scout has been deleted.(title)
// [Scout Name] has been removed from the platform, your pitch that was submitted has automatically withdrawn. (description)
