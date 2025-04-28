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
  subtype?: string;
  title?: string;
  description?: string;
  role?: NotificationRole;
  targeted_users?: string[];
  payload?: NotificationPayload;
}

// Email templates for different notification types
export const emailTemplates = {
  // Scout Collaboration Request
  request: {
    collaboration: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'Scout Collaboration Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Scout Collaboration Request</h2>
          <p>Scout: ${notification.payload.scout_id || 'Unknown Scout'}</p>
          <p>Daftar: ${notification.payload.daftar_id || 'Unknown Daftar'}</p>
          <p>Date: ${new Date(notification.created_at).toLocaleDateString()}</p>
          <div style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; margin-right: 10px;">
              View Request
            </a>
          </div>
        </div>
      `,
    }),
  },

  // Updates for Founders
  updates: {
    team_join: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'New Team Member',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Team Member</h2>
          <p>Congratulations! ${notification.payload.action_by} has recently joined your Pitch.</p>
          <p>More skills, more opportunities.</p>
        </div>
      `,
    }),
    team_leave: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'Team Member Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Team Member Update</h2>
          <p>${notification.payload.action_by} has left your Pitch.</p>
        </div>
      `,
    }),
    new_offer: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'New Offer Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Offer Received</h2>
          <p>Congratulations! You've received a new offer from ${notification.payload.scout_id} hosted by ${notification.payload.daftar_id}.</p>
        </div>
      `,
    }),
    pitch_deleted: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'Pitch Deleted',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Pitch Deleted</h2>
          <p>The Pitch has been permanently deleted from Daftar's server.</p>
        </div>
      `,
    }),
    offer_received: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'New Offer',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Offer</h2>
          <p>Offer received from the investor for ${notification.payload.pitchName}.</p>
        </div>
      `,
    }),
    offer_withdrawn: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'Offer Withdrawn',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Offer Withdrawn</h2>
          <p>Offer withdrawn by ${notification.payload.action_by} for ${notification.payload.pitchName}.</p>
        </div>
      `,
    }),
    document_received: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'New Document',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Document</h2>
          <p>You have received ${notification.payload.documentName} from the investor for ${notification.payload.pitchName}.</p>
        </div>
      `,
    }),
  },

  // Alerts for Founders
  alert: {
    delete_request: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'Pitch Delete Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Pitch Delete Request</h2>
          <p>Pitch delete request. Waiting for your approval. Requested by ${notification.payload.action_by}</p>
        </div>
      `,
    }),
    team_exit: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'Team Member Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Team Member Update</h2>
          <p>${notification.payload.action_by} has exited your Pitch.</p>
        </div>
      `,
    }),
    offer_declined: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'Offer Declined',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Offer Declined</h2>
          <p>Offer declined by the investor for ${notification.payload.pitchName}.</p>
        </div>
      `,
    }),
    scout_deleted: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'Scout Deleted',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Scout Deleted</h2>
          <p>${notification.payload.scoutName} has been removed from the platform, your pitch that was submitted has automatically withdrawn.</p>
        </div>
      `,
    }),
  },

  // News notifications
  news: {
    default: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: notification.title || 'News Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${notification.title}</h2>
          <p>${notification.description}</p>
        </div>
      `,
    }),
  },

  // Scout links
  scout_link: {
    default: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'New Scout Link',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Scout Link Available</h2>
          <p>Your scout link is now available:</p>
          <a href="${notification.payload.url}" 
             style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; margin-top: 10px;">
            View Scout
          </a>
        </div>
      `,
    }),
  },

  // Welcome email
  welcome: {
    default: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'Welcome to DaftarOS!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to DaftarOS!</h2>
          <p>Hello ${notification.userName},</p>
          <p>Thank you for joining DaftarOS. We're excited to have you on board!</p>
          <p>Get started by exploring our platform and connecting with other members.</p>
          <div style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" 
               style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none;">
              Go to Dashboard
            </a>
          </div>
        </div>
      `,
    }),
  },
};

export async function createNotification({
  type = "updates",
  subtype = 'default',
  title = "",
  description = "",
  targeted_users = [],
  payload,
  role = "both",
}: CreateNotificationInput) {
  try {
    // Create the notification
    const [notification] = await db.insert(notifications).values({
      type,
      role,
      title,
      subtype,
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
        // Get the appropriate email template based on notification type and subtype
        const typeTemplates = emailTemplates[notification.type as keyof typeof emailTemplates];
        if (!typeTemplates) {
          console.error(`No email templates found for notification type: ${notification.type}`);
          continue;
        }

        // Handle different template structures
        let template;
        if (typeof typeTemplates === 'function') {
          template = typeTemplates;
        } else {
          // Try to find template using subtype
          const key = notification.subtype || 'default';
          template = typeTemplates[key as keyof typeof typeTemplates] ||
            (typeTemplates as any).default;
        }

        if (!template) {
          console.error(`No email template found for subtype: ${notification.subtype}`);
          continue;
        }
        if (typeof template !== 'function') {
          console.error(`Template is not a function for subtype: ${notification.subtype}`);
          continue;
        }
        const emailData = (template as (notification: any, userEmail: string) => any)(notification, user.email);

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notification,
            userId,
            userEmail: user.email,
            emailData,
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