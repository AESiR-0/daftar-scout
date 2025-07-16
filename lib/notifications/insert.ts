import { db } from "@/backend/database"; // your drizzle client
import { notifications } from "@/backend/drizzle/models/notifications"; // adjust if different
import { users } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";
import { sendBrowserNotifications } from "@/utils/sendBrowserNotifications";
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
            <a href="https://daftaros.com/investor" 
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
    daftar_invite_received: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'Daftar Invitation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f0f0; padding: 20px; border-radius: 10px;border: 1px solid #ccc;">
          <h2>Daftar Invitation</h2>
          <p>${notification.userName},</p>
          <p>You have been invited to join ${notification.payload.daftarName} on Daftar OS.</p>
          <div style="margin-top: 20px;">
            <a href="https://daftaros.com/api/endpoints/daftar/actions/accept?mail=${userEmail}" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; margin-right: 10px;">
              Accept
            </a>
            <a href="https://daftaros.com/api/endpoints/daftar/actions/reject?mail=${userEmail}" 
               style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none;">
              Reject
            </a>
          </div>
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
    pitch_team_invite: (notification: any, userEmail: string) => {
      const userId = (notification.targeted_users && notification.targeted_users[0]) || notification.userId;
      const pitchId = notification.payload?.pitchId;
      const now = Date.now();
      const acceptToken = Buffer.from(`${userId}:${pitchId}:accept:${now}`).toString('base64');
      const rejectToken = Buffer.from(`${userId}:${pitchId}:reject:${now}`).toString('base64');
      const acceptUrl = `https://daftaros.com/api/pitch/team/action?token=${acceptToken}`;
      const rejectUrl = `https://daftaros.com/api/pitch/team/action?token=${rejectToken}`;
      return {
        to: userEmail,
        subject: `Pitch Team Invitation - ${notification.payload?.pitchName || ''}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px; border-radius: 10px; border: 1px solid #ccc;">
            <h2>Pitch Team Invitation</h2>
            <p>Hello ${notification.userName || ''},</p>
            <p><strong>${notification.payload?.currentUsername || ''}</strong> has invited you to join the pitch team for <strong>${notification.payload?.pitchName || ''}</strong> as <strong>${notification.payload?.invitedUserDesignation || 'Team Member'}</strong>.</p>
            <p>This is an exciting opportunity to collaborate on a startup pitch and work together to present your ideas to potential investors.</p>
            <div style="margin-top: 20px; text-align: center;">
              <a href="${acceptUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; margin-right: 10px; border-radius: 5px; font-weight: bold;">Accept Invitation</a>
              <a href="${rejectUrl}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Decline Invitation</a>
            </div>
            <p>If you have any questions about this invitation, please don't hesitate to reach out to the team or our support team.</p>
            <p style="margin-top: 30px; color: #888; font-size: 13px;">DaftarOS Team<br/>Building the Future of Startup Collaboration</p>
          </div>
        `,
      };
    },
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
          <p>This is your opportunity to connect with startups and help them grow.</p>
          <p>Best regards,<br>Daftar OS</p>
        </div>
      `,
    }),
  },

  // Welcome email
  welcome: {
    default: (notification: any, userEmail: string) => ({
      to: userEmail,
      subject: 'Welcome to Daftar OS - Demo Video',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f0f0; padding: 20px; border-radius: 10px;border: 1px solid #ccc;">
          <p>Hi ${notification.userName}</p>
          <p>Welcome Aboard</p>
          <br/>
          <p>Here's your demo video to help you experience how Daftar works:
🎥 https://daftaros.com/demo
</p>
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

    // Send push notifications to targeted users
    if (targeted_users.length > 0) {
      try {
        await sendBrowserNotifications(targeted_users, title, description);
        console.log(`Push notifications sent to ${targeted_users.length} users`);
      } catch (error) {
        console.error('Error sending push notifications:', error);
        // Don't throw error here, continue with email notifications
      }
    }

    // Skip email generation only for offer_withdrawn
    if (subtype === "offer_withdrawn") {
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

        // Send email using the email API
        const response = await fetch(`https://daftaros.com/api/notifications/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notification,
            userId,
            userEmail: user.email,
            // Send the email data directly instead of wrapping it
            ...emailData,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to send email to user ${userId}:`, response.status, errorText);
        } else {
          console.log(`Email sent successfully to user ${userId}`);
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