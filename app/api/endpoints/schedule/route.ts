// app/api/schedule-meet/route.ts
import { google } from "googleapis";
import { auth } from "@/auth";
import { db } from "@/backend/database";
import { users, accounts } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth();
  const body = await req.json();

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Find user with drizzle.select
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email));

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  // Get Google account info
  const [googleAccount] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id));

  if (!googleAccount?.access_token) {
    return new Response("Missing Google token", { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: googleAccount.access_token,
    refresh_token: googleAccount.refresh_token,
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const event = {
    summary: body.title,
    description: body.description,
    start: {
      dateTime: body.startTime,
      timeZone: "Asia/Kolkata",
    },
    end: {
      dateTime: body.endTime,
      timeZone: "Asia/Kolkata",
    },
    attendees: [{ email: body.attendeeEmail }, { email: session.user.email }],
    conferenceData: {
      createRequest: {
        requestId: new Date().toISOString(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  try {
    const res = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,
    });

    return Response.json({
      meetLink: res.data.hangoutLink,
      eventId: res.data.id,
    });
  } catch (err) {
    console.error("Failed to create event:", err);
    return new Response("Calendar error", { status: 500 });
  }
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Get user via drizzle.select
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email));

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  // Get linked Google account
  const [googleAccount] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id));

  if (!googleAccount?.access_token) {
    return new Response("Missing Google token", { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: googleAccount.access_token,
    refresh_token: googleAccount.refresh_token,
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  try {
    const res = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(), // Only future events
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 20,
    });

    const events =
      res.data.items?.map((event) => ({
        id: event.id,
        summary: event.summary,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        attendees: event.attendees?.map((a) => a.email),
        meetLink:
          event.hangoutLink ||
          event.conferenceData?.entryPoints?.[0]?.uri ||
          null,
      })) || [];

    return Response.json({ events });
  } catch (err) {
    console.error("Failed to fetch events:", err);
    return new Response("Google Calendar fetch failed", { status: 500 });
  }
}
