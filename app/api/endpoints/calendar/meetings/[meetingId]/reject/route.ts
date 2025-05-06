import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/backend/database";
import { meetings } from "@/backend/drizzle/models/meetings";
import { users, accounts } from "@/backend/drizzle/models/users";
import { eq, and } from "drizzle-orm";
import { google } from "googleapis";

export async function POST(
  req: Request,
  { params }: { params: { meetingId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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

    // Find the meeting
    const [meeting] = await db
      .select()
      .from(meetings)
      .where(and(eq(meetings.id, params.meetingId), eq(meetings.userId, user.id)));

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Update meeting status in Google Calendar
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    await calendar.events.patch({
      calendarId: "primary",
      eventId: meeting.calendarEventId,
      requestBody: {
        status: "cancelled",
      },
    });

    // Update meeting status in database
    await db
      .update(meetings)
      .set({ status: "rejected" })
      .where(eq(meetings.id, params.meetingId));

    return NextResponse.json({ message: "Meeting rejected successfully" });
  } catch (error) {
    console.error("Error rejecting meeting:", error);
    return NextResponse.json(
      { error: "Failed to reject meeting" },
      { status: 500 }
    );
  }
} 