import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { NotificationPayload } from '@/lib/notifications/type';
import { db } from '@/backend/database';
import { users } from '@/backend/drizzle/models/users';
import { eq } from 'drizzle-orm';

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!SMTP_USER || !SMTP_PASS) {
  throw new Error('SMTP credentials are not configured');
}

const transporter = nodemailer.createTransport({
  host: 'mail.smtp2go.com',
  port: 2525,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

function generateActionToken(userId: string, pitchId: string, action: 'accept' | 'reject'): string {
  const token = Buffer.from(`${userId}:${pitchId}:${action}:${Date.now()}`).toString('base64');
  return token;
}

function generatePitchTeamInviteEmail(
  userEmail: string,
  notification: NotificationPayload,
  acceptToken: string,
  rejectToken: string
) {
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

function generateStandardNotificationEmail(
  userEmail: string,
  notification: NotificationPayload
) {
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

function generateWelcomeEmail(userEmail: string, userName: string) {
  return {
    to: userEmail,
    subject: 'Welcome to DaftarOS!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to DaftarOS!</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for joining DaftarOS. We're excited to have you on board!</p>
        <p>Get started by exploring our platform and connecting with other members.</p>
        <div style="margin-top: 20px;">
          <a href="${BASE_URL}/dashboard" 
             style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none;">
            Go to Dashboard
          </a>
        </div>
      </div>
    `,
  };
}

export async function POST(request: Request) {
  try {
    const { notification, userId, type, userEmail, userName } = await request.json();

    // Handle welcome email for new users
    if (type === 'welcome') {
      const emailOptions = generateWelcomeEmail(userEmail, userName);
      await transporter.sendMail({
        from: 'notifications@daftaros.com',
        ...emailOptions,
      });
      return NextResponse.json({ success: true });
    }

    // Handle notification emails
    if (notification.type === "updates" && notification.payload.pitchId) {
      const acceptToken = generateActionToken(userId, notification.payload.pitchId, 'accept');
      const rejectToken = generateActionToken(userId, notification.payload.pitchId, 'reject');

      const emailOptions = generatePitchTeamInviteEmail(
        userEmail,
        notification.payload,
        acceptToken,
        rejectToken
      );

      await transporter.sendMail({
        from: 'notifications@daftaros.com',
        ...emailOptions,
      });
    } else {
      const emailOptions = generateStandardNotificationEmail(
        userEmail,
        notification.payload
      );

      await transporter.sendMail({
        from: 'notifications@daftaros.com',
        ...emailOptions,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 