import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/backend/database";
import { meetings } from "@/backend/drizzle/models/meetings";
import { users, accounts } from "@/backend/drizzle/models/users";
import { eq, and } from "drizzle-orm";
import { google } from "googleapis";

export async function POST(
  request: Request,
  { params }: { params: { meetingId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meetingId = params.meetingId;

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the meeting
    const [meeting] = await db
      .select()
      .from(meetings)
      .where(
        and(
          eq(meetings.id, meetingId),
          eq(meetings.userId, user.id)
        )
      );

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Get user's Google account
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, user.id));

    if (!account) {
      return NextResponse.json(
        { error: "Google account not found" },
        { status: 404 }
      );
    }

    // Update Google Calendar event
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL
    );
    
    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
      expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    await calendar.events.patch({
      calendarId: "primary",
      eventId: meeting.calendarEventId,
      requestBody: {
        status: "cancelled",
      },
    });

    // Update meeting in database
    const [updatedMeeting] = await db
      .update(meetings)
      .set({
        status: "rejected",
        updatedAt: new Date(),
      })
      .where(eq(meetings.id, meetingId))
      .returning();

    return NextResponse.json(updatedMeeting);
  } catch (error) {
    console.error("Error rejecting meeting:", error);
    return NextResponse.json(
      { error: "Failed to reject meeting" },
      { status: 500 }
    );
  }
} 