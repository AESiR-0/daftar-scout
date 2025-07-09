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
  host: 'email-smtp.ap-south-1.amazonaws.com',
  port: 587, // STARTTLS (recommended)
  secure: false,
  auth: {
    user: SMTP2GO_USER,
    pass: SMTP2GO_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
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
    subject: `${notification.pitchName} invited you to join Daftar OS`,
    html: `
      <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <div style="background-color: #0e0e0e; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Daftar OS Technology</h1>
          </div>
  
          <!-- Invitation Message -->
          <div style="padding: 30px;">
            <h2 style="color: #333333; font-size: 20px; margin-bottom: 10px;">${notification.currentUsername} has invited you to the team as <span style="color: #ff5a5f;">${notification.designation}</span></h2>
            
            <p style="color: #555555; font-size: 16px; margin-top: 20px;">
              Hey ${notification.invitedUsername},
            </p>
  
            <p style="color: #555555; font-size: 15px; margin-top: 10px; line-height: 1.6;">
              I'm inviting you to join my pitch.
              <br /><br />
              I'm applying to the investor who's scouting startups. Check out their deal – I believe my startup idea can actually win here. I'm inviting you to join my team and pitch. Let's build the next big startup together.
            </p>
  
            <!-- CTA Buttons -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${acceptUrl}" 
                style="background-color: #ff5a5f; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 30px; font-size: 16px; border-radius: 6px; display: inline-block; margin-right: 10px;">
                Join My Team
              </a>
              <a href="${rejectUrl}" 
                style="background-color: #666666; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 30px; font-size: 16px; border-radius: 6px; display: inline-block;">
                Decline
              </a>
            </div>
  
            <!-- Footer Info -->
            <div style="color: #999999; font-size: 13px; text-align: center; margin-top: 20px;">
              ${notification.currentUsername}<br/>
              ${notification.currentUserDesignation || notification.designation}<br/>
              On Daftar Since ${notification.joinedTime || "2024"}
            </div>
          </div>
        </div>
  
        <!-- Bottom Footer -->
        <div style="text-align: center; color: #aaaaaa; font-size: 12px; margin-top: 20px;">
          © ${new Date().getFullYear()} Daftar OS Technology. All rights reserved.
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
