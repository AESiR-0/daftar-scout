import { supabase } from "../supabase/createClient";
import { NotificationPayload } from "./type";
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";
import nodemailer from 'nodemailer';
import { emailTemplates } from './insert';

const SMTP2GO_USER = process.env.SMTP_USER;
const SMTP2GO_PASSWORD = process.env.SMTP_PASS;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!SMTP2GO_USER || !SMTP2GO_PASSWORD) {
  throw new Error('SMTP2GO credentials are not configured');
}

const transporter = nodemailer.createTransport({
  host: 'mail.smtp2go.com',
  port: 2525,
  secure: true,
  auth: {
    user: SMTP2GO_USER,
    pass: SMTP2GO_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: 'notifications@daftaros.com',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

export function generateActionToken(userId: string, pitchId: string, action: 'accept' | 'reject'): string {
  // In production, use a proper JWT or similar secure token
  const token = Buffer.from(`${userId}:${pitchId}:${action}:${Date.now()}`).toString('base64');
  return token;
}

export function generatePitchTeamInviteEmail(
  userEmail: string,
  notification: NotificationPayload,
  acceptToken: string,
  rejectToken: string
): EmailOptions {
  const acceptUrl = `${BASE_URL}/api/pitch/team/action?token=${acceptToken}`;
  const rejectUrl = `${BASE_URL}/api/pitch/team/action?token=${rejectToken}`;

  return {
    to: userEmail,
    subject: 'Pitch Team Invitation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Pitch Team Invitation</h2>
        <p>You have been invited to join a pitch team as ${notification.designation}.</p>
        <p>${notification.message || ''}</p>
        <div style="margin-top: 20px;">
          <a href="${acceptUrl}" 
             style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; margin-right: 10px;">
            Accept Invitation
          </a>
          <a href="${rejectUrl}" 
             style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none;">
            Decline Invitation
          </a>
        </div>
      </div>
    `,
  };
}

export function generateStandardNotificationEmail(
  userEmail: string,
  notification: NotificationPayload
): EmailOptions {
  return {
    to: userEmail,
    subject: 'New Notification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Notification</h2>
        <p>${notification.message || ''}</p>
        ${notification.url ? `<a href="${notification.url}" style="color: #2196F3;">View Details</a>` : ''}
      </div>
    `,
  };
}

type Notification = {
  id: string;
  type: string;
  role: string;
  targeted_users: string[];
  payload: NotificationPayload;
  created_at: string;
};

export async function sendNotificationEmail(notification: Notification, userId: string) {
  try {
    // Get user's email
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user?.email) {
      console.error(`No email found for user ${userId}`);
      return;
    }

    const userEmail = user.email;

    // Get the appropriate email template based on notification type and subtype
    const typeTemplates = emailTemplates[notification.type as keyof typeof emailTemplates];
    if (!typeTemplates) {
      console.error(`No email templates found for notification type: ${notification.type}`);
      return;
    }

    // Handle different template structures
    let template;
    if (typeof typeTemplates === 'function') {
      template = typeTemplates;
    } else {
      const subtype = notification.payload.action || 'default';
      template = typeTemplates[subtype as keyof typeof typeTemplates] || 
                (typeTemplates as any).default;
    }

    if (!template) {
      console.error(`No email template found for subtype: ${notification.payload.action}`);
      return;
    }

    if (typeof template !== 'function') {
      console.error('Template is not a function');
      return;
    }

    const emailData = (template as (notification: any, userEmail: string) => any)(notification.payload, userEmail);
    await sendEmail(emailData);
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
}

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  try {
    const template = emailTemplates.welcome?.default;
    if (!template) {
      console.error('Welcome email template not found');
      return;
    }

    const emailData = template({ userName }, userEmail);
    await sendEmail(emailData);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

export function listenToNotifications({
  userId,
  role,
  onNotification,
}: {
  userId: string;
  role: "founder" | "investor";
  onNotification: (notification: Notification) => void;
}) {
  return supabase
    .channel("realtime:notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
      },
      (payload) => {
        const notif = payload.new as Notification;

        const isTargeted =
          notif.targeted_users.length === 0 ||
          notif.targeted_users.includes(userId);

        const roleMatches = notif.role === "both" || notif.role === role;

        if (isTargeted && roleMatches) {
          onNotification(notif);
        }
      }
    )
    .subscribe();
}
