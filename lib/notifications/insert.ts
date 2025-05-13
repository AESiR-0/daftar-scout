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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f0f0; padding: 20px; border-radius: 10px;border: 1px solid #ccc;">
          <h2>Scout Collaboration Request</h2>
          <p>${notification.userName},</p>
          <p>We're excited to inform you that ${notification.payload.daftar_id} has requested to collaborate with you on their scout ${notification.payload.scout_id}.</p>
          <div style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; margin-right: 10px;">
              View Request
            </a>
          </div>
          <p>Best regards,<br>Daftar OS</p>
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f0f0; padding: 20px; border-radius: 10px;border: 1px solid #ccc;">
          <h2>New Team Member</h2>
          <p>${notification.userName},</p>
          <p>We're thrilled to announce that ${notification.payload.action_by} has joined your Pitch team!</p>
          <p>Best regards,<br>Daftar OS</p>
        </div>
      `,
    }),
    team_leave: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'Team Member Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f0f0; padding: 20px; border-radius: 10px;border: 1px solid #ccc;">
          <h2>Team Member Update</h2>
          <p>${notification.userName},</p>
          <p>${notification.payload.action_by} has left your Pitch team. We wish them the best in their future endeavors.</p>
          <p>Best regards,<br>Daftar OS</p>
        </div>
      `,
    }),
    new_offer: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'New Offer Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f0f0; padding: 20px; border-radius: 10px;border: 1px solid #ccc;">
          <h2>New Offer Received</h2>
          <p>${notification.userName},</p>
          <p>Congratulations! You've received a new offer from ${notification.payload.scout_id} hosted by ${notification.payload.daftar_id}.</p>
          <p>Best regards,<br>Daftar OS</p>
        </div>
      `,
    }),
    pitch_deleted: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'Pitch Deleted',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f0f0; padding: 20px; border-radius: 10px;border: 1px solid #ccc;">
          <h2>Pitch Deleted</h2>
          <p>${notification.userName},</p>
          <p>Your Pitch has been Archived from Daftar's server.</p>
          <p>We hope you found value in your time with us.</p>
          <p>Best regards,<br>Daftar OS</p>
        </div>
      `,
    }),
    offer_received: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'New Offer',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f0f0; padding: 20px; border-radius: 10px;border: 1px solid #ccc;">
          <h2>New Offer</h2>
          <p>${notification.userName},</p>
          <p>Great news! You've received an offer for ${notification.payload.pitchName}.</p>
          <p>Best regards,<br>Daftar OS</p>
        </div>
      `,
    }),
    offer_withdrawn: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'Offer Withdrawn',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f0f0; padding: 20px; border-radius: 10px;border: 1px solid #ccc;">
          <h2>Offer Withdrawn</h2>
          <p>${notification.userName},</p>
          <p>The offer for ${notification.payload.pitchName} has been withdrawn by ${notification.payload.action_by}.</p>
          <p>While this may be disappointing, remember that new opportunities are always around the corner.</p>
          <p>Best regards,<br>Daftar OS</p>
        </div>
      `,
    }),
    document_received: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'New Document',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f0f0; padding: 20px; border-radius: 10px;border: 1px solid #ccc;">
          <h2>New Document</h2>
          <p>${notification.userName},</p>
          <p>You have received ${notification.payload.documentName} from the investor for ${notification.payload.pitchName}.</p>
          <p>Please review this document carefully as it may contain important information about your  opportunity.</p>
          <p>Best regards,<br>Daftar OS</p>
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f0f0; padding: 20px; border-radius: 10px;border: 1px solid #ccc;">
          <h2>Pitch Delete Request</h2>
          <p>${notification.userName},</p>
          <p>A request to delete your Pitch has been initiated by ${notification.payload.action_by}. This action requires your approval.</p>
          <p>Please review this request carefully.</p>
          <p>Best regards,<br>Daftar OS</p>
        </div>
      `,
    }),
    team_exit: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'Team Member Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f0f0; padding: 20px; border-radius: 10px;border: 1px solid #ccc;">
          <h2>Team Member Update</h2>
          <p>${notification.userName},</p>
          <p>${notification.payload.action_by} has exited your Pitch team.</p>
          <p>We understand this may be challenging, but your team's resilience will help you move forward.</p>
          <p>Best regards,<br>Daftar OS</p>
        </div>
      `,
    }),
    offer_declined: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'Offer Declined',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f0f0; padding: 20px; border-radius: 10px;border: 1px solid #ccc;">
          <h2>Offer Declined</h2>
          <p>${notification.userName},</p>
          <p>The offer for ${notification.payload.pitchName} has been declined by the investor.</p>
          <p>While this may be disappointing, remember that every rejection brings you closer to the right opportunity.</p>
          <p>Best regards,<br>Daftar OS</p>
        </div>
      `,
    }),
    scout_deleted: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'Scout Deleted',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f0f0; padding: 20px; border-radius: 10px;border: 1px solid #ccc;">
          <h2>Scout Deleted</h2>
          <p>${notification.userName},</p>
          <p>${notification.payload.scoutName} has been removed from the platform. Your pitch that was submitted has been automatically withdrawn.</p>
          <p>We understand this may be unexpected. We're here to help you find new opportunities.</p>
          <p>Best regards,<br>Daftar OS</p>
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f0f0; padding: 20px; border-radius: 10px;border: 1px solid #ccc;">
          <h2>Congratulations to ${notification.payload.founderName} from ${notification.payload.location}</h2>
          <p>Their pitch is now backed by Daftar, disrupting the ${notification.payload.sector} at the ${notification.payload.stage}. Team Daftar OS is excited to see the incredible value they'll bring to their stakeholders.</p>
          <p>Best regards,<br>Daftar OS</p>
        </div>
      `,
    }),
  },

  // Scout links
  scout_link: {
    default: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'The Scout is Now Live - Start Inviting Startups',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f0f0; padding: 20px; border-radius: 10px;border: 1px solid #ccc;">
          <h2>The Scout is Now Live - Start Inviting Startups</h2>
          <p>${notification.userName},</p>
          <p>We're excited to inform you that the scout ${notification.scoutName} is successfully live. You can now invite startups from your social network by sharing this link: ${notification.payload.url}.</p>
          <p>This is your opportunity to connect with promising startups and help them grow.</p>
          <p>Best regards,<br>Daftar OS</p>
        </div>
      `,
    }),
  },

  // Welcome email
  welcome: {
    default: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'Welcome to DaftarOS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f0f0; padding: 20px; border-radius: 10px;border: 1px solid #ccc;">
          <p>${notification.userName},</p>
          <p>We're happy to have you with us.</p>
          <p>At Daftar OS, we've created software to help you grow your startup by connecting you with investors and governments. Video pitching in your own language makes it easier to explain what you're building. It's simple, clear, and helps you share the main idea of your startup. We believe that for the first meeting, it's easier for investors to find you, no matter where you are.</p>
          <p>If you're building a startup that can get funding, we want to help you connect with the right people and resources from both government and private investors.</p>
          <p>Welcome to Daftar OS Technology. We're creating a new startup economy.</p>
          <p>Raunak<br>Founder, Daftar OS</p>
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

    // Skip email generation for scout_link notifications
    if (type === "scout_link" || subtype === "offer_withdrawn") {
      return notification;
    }

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