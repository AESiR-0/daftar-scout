import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/backend/database";
import { meetings } from "@/backend/drizzle/models/meetings";
import { users, accounts } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";
import { google } from "googleapis";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, startTime, endTime, attendees } = body;

    if (!title || !startTime || !endTime || !attendees) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
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

    // Create event in Google Calendar
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
      summary: title,
      description,
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: new Date(endTime).toISOString(),
        timeZone: "UTC",
      },
      attendees: attendees.map((email: string) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(7),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const calendarResponse = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,
    });

    if (!calendarResponse.data.id) {
      throw new Error("Failed to create Google Calendar event");
    }

    // Create meeting in database
    const [newMeeting] = await db
      .insert(meetings)
      .values({
        userId: user.id,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: "pending",
        calendarEventId: calendarResponse.data.id,
        meetLink: calendarResponse.data.hangoutLink || "",
        location: "Virtual Meeting",
      })
      .returning();

    return NextResponse.json({
      ...newMeeting,
      attendees,
      meetLink: calendarResponse.data.hangoutLink,
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    );
  }
} 