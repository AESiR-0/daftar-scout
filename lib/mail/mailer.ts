import nodemailer from 'nodemailer';
import { NotificationType, NotificationPayload } from '../notifications/type';

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
      from: 'pratham@daftaros.com',
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