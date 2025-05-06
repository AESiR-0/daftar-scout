import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/backend/database";
import { meetings } from "@/backend/drizzle/models/meetings";
import { users, accounts } from "@/backend/drizzle/models/users";
import { eq, and } from "drizzle-orm";
import { google } from "googleapis";

export async function GET(
  req: Request,
  { params }: { params: { pitchId: string } }
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

    // Get meetings from Google Calendar
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const calendarResponse = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 100,
    });

    // Get meetings from database
    const dbMeetings = await db
      .select()
      .from(meetings)
      .where(
        and(
          eq(meetings.userId, user.id),
          eq(meetings.pitchId, params.pitchId)
        )
      );

    // Combine calendar events with database meetings
    const combinedMeetings = dbMeetings.map(dbMeeting => {
      const calendarEvent = calendarResponse.data.items?.find(
        event => event.id === dbMeeting.calendarEventId
      );

      return {
        id: dbMeeting.id,
        title: dbMeeting.title,
        description: dbMeeting.description,
        startTime: dbMeeting.startTime.toISOString(),
        endTime: dbMeeting.endTime.toISOString(),
        status: dbMeeting.status,
        attendees: calendarEvent?.attendees?.map(a => a.email) || [],
        meetLink: calendarEvent?.hangoutLink || calendarEvent?.conferenceData?.entryPoints?.[0]?.uri,
        location: calendarEvent?.location || "Virtual Meeting",
      };
    });

    return NextResponse.json(combinedMeetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
} 