import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { NotificationPayload } from "@/lib/notifications/type";
import { db } from "@/backend/database";
import { eq } from "drizzle-orm";
import { users } from "@/backend/drizzle/models/users";
import { daftar } from "@/backend/drizzle/models/daftar";

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!SMTP_USER || !SMTP_PASS) {
  throw new Error("SMTP credentials are not configured");
}

const transporter = nodemailer.createTransport({
  host: "mail.smtp2go.com",
  port: 2525,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

function generateActionToken(
  userId: string,
  pitchId: string,
  action: "accept" | "reject"
): string {
  const token = Buffer.from(
    `${userId}:${pitchId}:${action}:${Date.now()}`
  ).toString("base64");
  return token;
}

function generatePitchTeamInviteEmail(
  userEmail: string,
  userName: string,
  pitchName: string,
  inviterName: string,
  designation: string,
  pitchId: string,
  scoutId: string
) {
  const acceptUrl = `${BASE_URL}/api/pitch/team/action?token=${Buffer.from(`${userEmail}:${pitchId}:accept:${Date.now()}`).toString('base64')}`;
  const rejectUrl = `${BASE_URL}/api/pitch/team/action?token=${Buffer.from(`${userEmail}:${pitchId}:reject:${Date.now()}`).toString('base64')}`;

  return {
    to: userEmail,
    subject: `Pitch Team Invitation - ${pitchName}`,
    html: `
      <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <div style="background-color: #0e0e0e; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Daftar OS Technology</h1>
          </div>
  
          <!-- Pitch Team Invitation Content -->
          <div style="padding: 30px;">
            <h2 style="color: #333333; font-size: 20px; margin-bottom: 10px;">Pitch Team Invitation</h2>
            
            <p style="color: #555555; font-size: 16px; margin-top: 20px;">
              Hello ${userName},
            </p>
  
            <p style="color: #555555; font-size: 15px; margin-top: 10px; line-height: 1.6;">
              <strong>${inviterName}</strong> has invited you to join the pitch team for <strong>${pitchName}</strong> as <strong>${designation}</strong>.
            </p>

            <p style="color: #555555; font-size: 15px; margin-top: 10px; line-height: 1.6;">
              This is an exciting opportunity to collaborate on a startup pitch and work together to present your ideas to potential investors.
            </p>
  
            <!-- CTA Buttons -->
            <div style="text-align: center; margin: 40px 0 20px;">
              <a href="${acceptUrl}" 
                style="background-color: #4CAF50; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 30px; font-size: 16px; border-radius: 6px; display: inline-block; margin-right: 10px;">
                Accept Invitation
              </a>
              <a href="${rejectUrl}" 
                style="background-color: #f44336; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 30px; font-size: 16px; border-radius: 6px; display: inline-block;">
                Decline Invitation
              </a>
            </div>

            <p style="color: #666666; font-size: 14px; margin-top: 20px; line-height: 1.6;">
              If you have any questions about this invitation, please don't hesitate to reach out to the team or our support team.
            </p>
  
            <!-- Footer Info -->
            <div style="color: #999999; font-size: 13px; text-align: center; margin-top: 30px;">
              DaftarOS Team<br/>
              Building the Future of Startup Collaboration
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

function generatePitchTeamInviteNotificationEmail(
  userEmail: string,
  userName: string,
  pitchName: string,
  newMemberName: string,
  designation: string
) {
  return {
    to: userEmail,
    subject: `New Team Member Invited - ${pitchName}`,
    html: `
      <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <div style="background-color: #0e0e0e; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Daftar OS Technology</h1>
          </div>
  
          <!-- Pitch Team Invitation Notification Content -->
          <div style="padding: 30px;">
            <h2 style="color: #333333; font-size: 20px; margin-bottom: 10px;">New Team Member Invited</h2>
            
            <p style="color: #555555; font-size: 16px; margin-top: 20px;">
              Hello ${userName},
            </p>
  
            <p style="color: #555555; font-size: 15px; margin-top: 10px; line-height: 1.6;">
              <strong>${newMemberName}</strong> has been invited to join the pitch team for <strong>${pitchName}</strong> as <strong>${designation}</strong>.
            </p>

            <p style="color: #555555; font-size: 15px; margin-top: 10px; line-height: 1.6;">
              Once they accept the invitation, they will be able to contribute to the pitch development and collaborate with the team.
            </p>
  
            <!-- Footer Info -->
            <div style="color: #999999; font-size: 13px; text-align: center; margin-top: 30px;">
              DaftarOS Team<br/>
              Building the Future of Startup Collaboration
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

function generateDaftarTeamInviteEmail(
  userEmail: string,
  notification: NotificationPayload,
  acceptToken: string,
  rejectToken: string
) {
  const acceptUrl = `${BASE_URL}/api/pitch/team/action?token=${acceptToken}`;
  const rejectUrl = `${BASE_URL}/api/pitch/team/action?token=${rejectToken}`;

  return {
    to: userEmail,
    subject: `${notification.daftarName} invited you to Daftar OS`,
    html: `
    <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
        
        <!-- Header -->
        <div style="background-color: #0e0e0e; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Daftar OS Technology</h1>
        </div>

        <!-- Invitation Message -->
        <div style="padding: 30px;">
          <h2 style="color: #333333; font-size: 20px; margin-bottom: 10px;">${notification.currentUsername
      } has invited you to the team as <span style="color: #ff5a5f;">${notification.designation
      }</span></h2>
          
          <p style="color: #555555; font-size: 16px; margin-top: 20px;">
            Hey ${notification.invitedUsername},
          </p>

          <p style="color: #555555; font-size: 15px; margin-top: 10px; line-height: 1.6;">
            I'm inviting you to join my Daftar <strong>${notification.daftarName
      }</strong>.
            <br /><br />
            I'm scouting startups at Daftar OS and inviting you to join my team.
            <br /><br />
            Btw, this software is amazing – it helps me understand a startup in just <strong>2.5 minutes</strong> without all the PPTs. Can't wait to have you on board!
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0 20px 0;">
            <a href="${acceptUrl}" 
              style="background-color: #ff5a5f; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 30px; font-size: 16px; border-radius: 6px; display: inline-block;">
              Join My Daftar
            </a>
          </div>

          <!-- Footer Info -->
          <div style="color: #999999; font-size: 13px; text-align: center; margin-top: 30px;">
            ${notification.currentUsername}<br/>
            ${notification.currentUserDesignation}<br/>
            ${notification.daftarName}<br/>
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

function generateCollaborationInviteEmail(
  userEmail: string,
  userName: string,
  scoutName: string,
  daftarName: string,
  scoutId: string,
  daftarId: string
) {
  return {
    to: userEmail,
    subject: 'Scout Collaboration Invitation',
    html: `
      <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <div style="background-color: #0e0e0e; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Daftar OS Technology</h1>
          </div>
  
          <!-- Collaboration Invitation Content -->
          <div style="padding: 30px;">
            <h2 style="color: #333333; font-size: 20px; margin-bottom: 10px;">Scout Collaboration Invitation</h2>
            
            <p style="color: #555555; font-size: 16px; margin-top: 20px;">
              Hello ${userName},
            </p>
  
            <p style="color: #555555; font-size: 15px; margin-top: 10px; line-height: 1.6;">
              We're excited to inform you that <strong>${daftarName}</strong> has requested to collaborate with you on their scout <strong>${scoutName}</strong>.
            </p>

            <p style="color: #555555; font-size: 15px; margin-top: 10px; line-height: 1.6;">
              This collaboration will help expand the reach of the scout and connect with more promising startups in your network.
            </p>
  
            <!-- CTA Buttons -->
            <div style="text-align: center; margin: 40px 0 20px;">
              <a href="${BASE_URL}/api/endpoints/scouts/collaboration/action?scoutId=${scoutId}&daftarId=${daftarId}&action=accept" 
                style="background-color: #4CAF50; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 30px; font-size: 16px; border-radius: 6px; display: inline-block; margin-right: 10px;">
                Accept Collaboration
              </a>
              <a href="${BASE_URL}/api/endpoints/scouts/collaboration/action?scoutId=${scoutId}&daftarId=${daftarId}&action=reject" 
                style="background-color: #f44336; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 30px; font-size: 16px; border-radius: 6px; display: inline-block;">
                Decline Collaboration
              </a>
            </div>

            <p style="color: #666666; font-size: 14px; margin-top: 20px; line-height: 1.6;">
              If you have any questions about this collaboration request, please don't hesitate to reach out to our support team.
            </p>
  
            <!-- Footer Info -->
            <div style="color: #999999; font-size: 13px; text-align: center; margin-top: 30px;">
              DaftarOS Team<br/>
              Building the Future of Startup Collaboration
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

function generateStandardNotificationEmail(
  userEmail: string,
  notification: NotificationPayload
) {
  return {
    to: userEmail,
    subject: "New Notification from DaftarOS",
    html: `
      <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <div style="background-color: #0e0e0e; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Daftar OS Technology</h1>
          </div>
  
          <!-- Notification Content -->
          <div style="padding: 30px;">
            <h2 style="color: #333333; font-size: 20px; margin-bottom: 10px;">${"New Notification"}</h2>
            
            <p style="color: #555555; font-size: 15px; margin-top: 20px; line-height: 1.6;">
              ${notification.message || ""}
            </p>
  
            ${notification.url ? `
              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0 20px;">
                <a href="${notification.url}" 
                  style="background-color: #ff5a5f; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 30px; font-size: 16px; border-radius: 6px; display: inline-block;">
                  View Details
                </a>
              </div>
            ` : ''}
  
            <!-- Footer Info -->
            <div style="color: #999999; font-size: 13px; text-align: center; margin-top: 30px;">
              DaftarOS Team<br/>
              Building the Future of Startup Collaboration
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

function generateWelcomeEmail(userEmail: string, userName: string) {
  return {
    to: userEmail,
    subject: 'Welcome to DaftarOS!',
    html: `
      <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <div style="background-color: #0e0e0e; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Daftar OS Technology</h1>
          </div>
  
          <!-- Welcome Message -->
          <div style="padding: 30px;">
            <h2 style="color: #333333; font-size: 20px; margin-bottom: 10px;">Welcome to DaftarOS!</h2>
            
            <p style="color: #555555; font-size: 16px; margin-top: 20px;">
              Hello ${userName},
            </p>
  
            <p style="color: #555555; font-size: 15px; margin-top: 10px; line-height: 1.6;">
              We're thrilled to have you join our community of innovators and entrepreneurs. DaftarOS is your platform to connect, collaborate, and create the next big thing.
              <br /><br />
              Get started by exploring our platform and connecting with other members. We're here to help you succeed!
            </p>
  
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0 20px;">
              <a href="${BASE_URL}/dashboard" 
                style="background-color: #ff5a5f; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 30px; font-size: 16px; border-radius: 6px; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
  
            <!-- Footer Info -->
            <div style="color: #999999; font-size: 13px; text-align: center; margin-top: 30px;">
              DaftarOS Team<br/>
              Building the Future of Startup Collaboration
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

function generateDaftarInviteEmail(
  userEmail: string,
  notification: NotificationPayload
) {
  return {
    to: userEmail,
    subject: 'Daftar Invitation',
    html: `
      <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <div style="background-color: #0e0e0e; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Daftar OS Technology</h1>
          </div>
  
          <!-- Invitation Content -->
          <div style="padding: 30px;">
            <h2 style="color: #333333; font-size: 20px; margin-bottom: 10px;">Daftar Invitation</h2>
            
            <p style="color: #555555; font-size: 16px; margin-top: 20px;">
              Hello ${notification.userName},
            </p>
  
            <p style="color: #555555; font-size: 15px; margin-top: 10px; line-height: 1.6;">
              You have been invited to join ${notification.payload.daftarName} on Daftar OS.
            </p>
  
            <!-- CTA Buttons -->
            <div style="text-align: center; margin: 40px 0 20px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/api/endpoints/daftar/actions/accept?mail=${userEmail}" 
                style="background-color: #4CAF50; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 30px; font-size: 16px; border-radius: 6px; display: inline-block; margin-right: 10px;">
                Accept
              </a>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/api/endpoints/daftar/actions/reject?mail=${userEmail}" 
                style="background-color: #f44336; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 30px; font-size: 16px; border-radius: 6px; display: inline-block;">
                Reject
              </a>
            </div>
  
            <!-- Footer Info -->
            <div style="color: #999999; font-size: 13px; text-align: center; margin-top: 30px;">
              DaftarOS Team<br/>
              Building the Future of Startup Collaboration
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

function generateCollaborationResponseEmail(
  userEmail: string,
  userName: string,
  scoutName: string,
  daftarName: string,
  responderName: string,
  action: string
) {
  return {
    to: userEmail,
    subject: `Scout Collaboration ${action === 'accepted' ? 'Accepted' : 'Rejected'}`,
    html: `
      <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <div style="background-color: #0e0e0e; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Daftar OS Technology</h1>
          </div>
  
          <!-- Collaboration Response Content -->
          <div style="padding: 30px;">
            <h2 style="color: #333333; font-size: 20px; margin-bottom: 10px;">Scout Collaboration ${action === 'accepted' ? 'Accepted' : 'Rejected'}</h2>
            
            <p style="color: #555555; font-size: 16px; margin-top: 20px;">
              Hello ${userName},
            </p>
  
            <p style="color: #555555; font-size: 15px; margin-top: 10px; line-height: 1.6;">
              ${responderName} has ${action} the collaboration request for scout <strong>${scoutName}</strong> with daftar <strong>${daftarName}</strong>.
            </p>

            <p style="color: #555555; font-size: 15px; margin-top: 10px; line-height: 1.6;">
              ${action === 'accepted' 
                ? 'The collaboration is now active and both teams can work together to expand the scout\'s reach.' 
                : 'The collaboration request has been declined. You can continue with your existing scout activities.'
              }
            </p>
  
            <!-- Footer Info -->
            <div style="color: #999999; font-size: 13px; text-align: center; margin-top: 30px;">
              DaftarOS Team<br/>
              Building the Future of Startup Collaboration
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

function generatePitchTeamResponseEmail(
  userEmail: string,
  userName: string,
  pitchName: string,
  responderName: string,
  action: string,
  pitchId: string,
  scoutId: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const pitchUrl = `${baseUrl}/pitch/${pitchId}`;

  return {
    to: userEmail,
    subject: `Pitch Team Update: ${responderName} ${action} invitation`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pitch Team Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Pitch Team Update</h2>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>${responderName} has ${action} the invitation to join the pitch team for <strong>${pitchName}</strong>.</p>
            <p>This update affects the team composition and may impact the pitch development process.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${pitchUrl}" class="button">View Pitch Details</a>
            </div>
            <p>If you have any questions about this update, please contact your team lead or the pitch coordinator.</p>
          </div>
          <div class="footer">
            <p>This is an automated notification from DaftarOS.</p>
            <p>If you have any questions, please contact support.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

function generateDaftarTeamResponseEmail(
  userEmail: string,
  userName: string,
  daftarName: string,
  responderName: string,
  action: string,
  designation: string
) {
  return {
    to: userEmail,
    subject: `Daftar Team Invitation ${action === 'accepted' ? 'Accepted' : 'Rejected'}`,
    html: `
      <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <div style="background-color: #0e0e0e; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Daftar OS Technology</h1>
          </div>
  
          <!-- Daftar Team Response Content -->
          <div style="padding: 30px;">
            <h2 style="color: #333333; font-size: 20px; margin-bottom: 10px;">Daftar Team Invitation ${action === 'accepted' ? 'Accepted' : 'Rejected'}</h2>
            
            <p style="color: #555555; font-size: 16px; margin-top: 20px;">
              Hello ${userName},
            </p>
  
            <p style="color: #555555; font-size: 15px; margin-top: 10px; line-height: 1.6;">
              ${responderName} has ${action} the invitation to join <strong>${daftarName}</strong> as <strong>${designation}</strong>.
            </p>

            <p style="color: #555555; font-size: 15px; margin-top: 10px; line-height: 1.6;">
              ${action === 'accepted' 
                ? 'The team member is now part of your daftar team and can help scout startups together.' 
                : 'The invitation has been declined. You can continue with your existing team members.'
              }
            </p>
  
            <!-- Footer Info -->
            <div style="color: #999999; font-size: 13px; text-align: center; margin-top: 30px;">
              DaftarOS Team<br/>
              Building the Future of Startup Collaboration
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

export async function POST(request: Request) {
  try {
    const { notification, userId, type, userEmail, userName, scoutName, daftarName, scoutId, daftarId, action, responderName, pitchName, designation, inviterName, pitchId, newMemberName } = await request.json();

    // Handle welcome email for new users
    if (type === 'welcome') {
      const emailOptions = generateWelcomeEmail(userEmail, userName);
      await transporter.sendMail({
        from: 'notifications@daftaros.com',
        ...emailOptions,
      });
      return NextResponse.json({ success: true });
    }

    // Handle collaboration invitation email
    if (type === 'collaboration_invite') {
      const emailOptions = generateCollaborationInviteEmail(
        userEmail,
        userName,
        scoutName,
        daftarName,
        scoutId,
        daftarId
      );
      await transporter.sendMail({
        from: 'notifications@daftaros.com',
        ...emailOptions,
      });
      return NextResponse.json({ success: true });
    }

    // Handle collaboration response email
    if (type === 'collaboration_response') {
      const emailOptions = generateCollaborationResponseEmail(
        userEmail,
        userName,
        scoutName,
        daftarName,
        responderName,
        action
      );
      await transporter.sendMail({
        from: 'notifications@daftaros.com',
        ...emailOptions,
      });
      return NextResponse.json({ success: true });
    }

    // Handle pitch team invitation email
    if (type === 'pitch_team_invite') {
      const emailOptions = generatePitchTeamInviteEmail(
        userEmail,
        userName,
        pitchName,
        inviterName,
        designation,
        pitchId,
        scoutId
      );
      await transporter.sendMail({
        from: 'notifications@daftaros.com',
        ...emailOptions,
      });
      return NextResponse.json({ success: true });
    }

    // Handle pitch team invitation notification email
    if (type === 'pitch_team_invite_notification') {
      const emailOptions = generatePitchTeamInviteNotificationEmail(
        userEmail,
        userName,
        pitchName,
        newMemberName,
        designation
      );
      await transporter.sendMail({
        from: 'notifications@daftaros.com',
        ...emailOptions,
      });
      return NextResponse.json({ success: true });
    }

    // Handle pitch team response email
    if (type === 'pitch_team_response') {
      const emailOptions = generatePitchTeamResponseEmail(
        userEmail,
        userName,
        pitchName,
        responderName,
        action,
        pitchId,
        scoutId
      );
      await transporter.sendMail({
        ...emailOptions,
      });
      return NextResponse.json({ success: true });
    }

    // Handle daftar team response email
    if (type === 'daftar_team_response') {
      const emailOptions = generateDaftarTeamResponseEmail(
        userEmail,
        userName,
        daftarName,
        responderName,
        action,
        designation
      );
      await transporter.sendMail({
        from: 'notifications@daftaros.com',
        ...emailOptions,
      });
      return NextResponse.json({ success: true });
    }

    // Handle notification emails
    if (notification.type === "updates" && notification.subtype === "daftar_invite_received") {
      // Fetch user details from database
      const [user] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.email, userEmail))
        .limit(1);

      // Fetch daftar details from database
      const [daftarInfo] = await db
        .select({ name: daftar.name })
        .from(daftar)
        .where(eq(daftar.id, notification.payload.daftarId))
        .limit(1);

      // Create a new notification object with the user's name and daftar name
      const notificationWithDetails = {
        ...notification,
        userName: user?.name || 'User',
        payload: {
          ...notification.payload,
          daftarName: daftarInfo?.name || 'Daftar'
        }
      };

      const emailOptions = generateDaftarInviteEmail(
        userEmail,
        notificationWithDetails
      );

      await transporter.sendMail({
        from: "notifications@daftaros.com",
        ...emailOptions,
      });
    } else if (notification.type === "updates" && notification.payload.pitchId) {
      const acceptToken = generateActionToken(
        userId,
        notification.payload.pitchId,
        "accept"
      );
      const rejectToken = generateActionToken(
        userId,
        notification.payload.pitchId,
        "reject"
      );

      const emailOptions = generatePitchTeamInviteEmail(
        userEmail,
        notification.payload.invitedUsername,
        notification.payload.pitchName,
        notification.payload.currentUsername,
        notification.payload.invitedUserDesignation,
        notification.payload.pitchId,
        notification.payload.scoutId
      );

      await transporter.sendMail({
        from: "notifications@daftaros.com",
        ...emailOptions,
      });
    } else {
      const emailOptions = generateStandardNotificationEmail(
        userEmail,
        notification.payload
      );

      await transporter.sendMail({
        from: "notifications@daftaros.com",
        ...emailOptions,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
