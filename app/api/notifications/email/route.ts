import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { NotificationPayload } from "@/lib/notifications/type";
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";

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
  notification: NotificationPayload,
  acceptToken: string,
  rejectToken: string
) {
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
            <h2 style="color: #333333; font-size: 20px; margin-bottom: 10px;">${
              notification.currentUsername
            } has invited you to the team as <span style="color: #ff5a5f;">${
      notification.invitedUserDesignation
    }</span></h2>
            
            <p style="color: #555555; font-size: 16px; margin-top: 20px;">
              Hey ${notification.invitedUsername},
            </p>
  
            <p style="color: #555555; font-size: 15px; margin-top: 10px; line-height: 1.6;">
              I’m inviting you to join my pitch.
              <br /><br />
              I’m applying to the investor who's scouting startups. Check out their deal – I believe my startup idea can actually win here. I’m inviting you to join my team and pitch. Let’s build the next big startup together.
            </p>
  
            <!-- Video Thumbnail -->
            <div style="margin: 30px 0; text-align: center;">
              <a href="${
                notification.videoUrl
              }" target="_blank" style="display: inline-block;">
                <img src="${
                  notification.videoThumbnail || "/path/to/thumbnail.jpg"
                }" alt="Investor Pitch Video" style="width: 100%; max-width: 500px; border-radius: 8px;">
              </a>
            </div>
  
            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${acceptUrl}" 
                style="background-color: #ff5a5f; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 30px; font-size: 16px; border-radius: 6px; display: inline-block;">
                Join My Team
              </a>
            </div>
  
            <!-- Footer Info -->
            <div style="color: #999999; font-size: 13px; text-align: center; margin-top: 20px;">
              ${notification.currentUsername}<br/>
              ${notification.currentUserDesignation}<br/>
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
          <h2 style="color: #333333; font-size: 20px; margin-bottom: 10px;">${
            notification.currentUsername
          } has invited you to the team as <span style="color: #ff5a5f;">${
      notification.designation
    }</span></h2>
          
          <p style="color: #555555; font-size: 16px; margin-top: 20px;">
            Hey ${notification.invitedUsername},
          </p>

          <p style="color: #555555; font-size: 15px; margin-top: 10px; line-height: 1.6;">
            I’m inviting you to join my Daftar <strong>${
              notification.daftarName
            }</strong>.
            <br /><br />
            I’m scouting startups at Daftar OS and inviting you to join my team.
            <br /><br />
            Btw, this software is amazing – it helps me understand a startup in just <strong>2.5 minutes</strong> without all the PPTs. Can’t wait to have you on board!
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
  notification: NotificationPayload,
  acceptToken: string,
  rejectToken: string
) {
  const acceptUrl = `${BASE_URL}/api/pitch/team/action?token=${acceptToken}`;
  const rejectUrl = `${BASE_URL}/api/pitch/team/action?token=${rejectToken}`;

  return {
    to: userEmail,
    subject: `${notification.daftarName} invited you to collaborate on a Scout at Daftar OS`,
    html: `
      <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <div style="background-color: #0e0e0e; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Daftar OS Technology</h1>
          </div>
  
          <!-- Invitation Content -->
          <div style="padding: 30px;">
            <h2 style="color: #333333; font-size: 20px; margin-bottom: 10px;">
              ${
                notification.currentUsername
              } has invited you to collaborate on the Scout:
              <span style="color: #ff5a5f;">${notification.scoutName}</span> 
            </h2>
  
            <p style="color: #555555; font-size: 15px; margin-top: 20px; line-height: 1.6;">
              Published by <strong>${
                notification.daftarName
              }</strong> via Daftar OS.
            </p>
  
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0 20px;">
              <a href="${openScoutUrl}" 
                style="background-color: #ff5a5f; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 30px; font-size: 16px; border-radius: 6px; display: inline-block;">
                Open Your Daftar
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

function generateStandardNotificationEmail(
  userEmail: string,
  notification: NotificationPayload
) {
  return {
    to: userEmail,
    subject: "New Notification",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Notification</h2>
        <p>${notification.message || ""}</p>
        ${
          notification.url
            ? `<a href="${notification.url}" style="color: #2196F3;">View Details</a>`
            : ""
        }
      </div>
    `,
  };
}

export async function POST(request: Request) {
  try {
    const { notification, userId } = await request.json();

    // Get user's email from database
    const user = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user.length || !user[0].email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 404 }
      );
    }

    const userEmail = user[0].email;

    if (notification.type === "updates" && notification.payload.pitchId) {
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
        notification.payload,
        acceptToken,
        rejectToken
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
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
