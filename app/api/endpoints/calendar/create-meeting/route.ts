import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/backend/database";
import { meetings } from "@/backend/drizzle/models/meetings";
import { users, accounts } from "@/backend/drizzle/models/users";
import { google } from "googleapis";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, startTime, endTime, attendees } = body;

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's access token
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, user.id));

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Create Google Calendar event
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
      summary: title,
      description: description,
      start: {
        dateTime: startTime,
        timeZone: "UTC",
      },
      end: {
        dateTime: endTime,
        timeZone: "UTC",
      },
      attendees: attendees.map((email: string) => ({ email })),
    };

    const calendarEvent = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    // Store in local database
    const [meeting] = await db
      .insert(meetings)
      .values({
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        userId: user.id,
        calendarEventId: calendarEvent.data.id!,
      })
      .returning();

    return NextResponse.json(meeting);
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    );
  }
} 