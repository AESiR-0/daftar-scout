import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/backend/database";
import { meetings } from "@/backend/drizzle/models/meetings";
import { users, accounts } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";
import { google } from "googleapis";

export async function GET() {
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

    const calendarResponse = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 100,
      fields: "items(id,summary,description,start,end,attendees,hangoutLink,location,conferenceData,organizer)",
    });

    // Get meetings from database (where user is organizer)
    const dbMeetings = await db
      .select()
      .from(meetings)
      .where(eq(meetings.userId, user.id))
      .orderBy(meetings.startTime);

    // Get all calendar events
    const allCalendarEvents = calendarResponse.data.items || [];

    // Find events where current user is an attendee but not the organizer
    const attendedEvents = allCalendarEvents.filter(event => {
      const isAttendee = event.attendees?.some(attendee => 
        attendee.email === user.email && attendee.responseStatus !== 'declined'
      );
      const isOrganizer = event.organizer?.email === user.email;
      return isAttendee && !isOrganizer;
    });

    // Process organized meetings (from database)
    const organizedMeetings = dbMeetings.map(dbMeeting => {
      const calendarEvent = allCalendarEvents.find(
        event => event.id === dbMeeting.calendarEventId
      );

      if (!calendarEvent) {
        return null; // Meeting was deleted from Google Calendar
      }

      return {
        id: dbMeeting.id,
        title: dbMeeting.title,
        description: dbMeeting.description,
        startTime: dbMeeting.startTime.toISOString(),
        endTime: dbMeeting.endTime.toISOString(),
        status: dbMeeting.status,
        attendees: calendarEvent.attendees?.map(a => a.email) || [],
        meetLink: calendarEvent.hangoutLink || calendarEvent.conferenceData?.entryPoints?.[0]?.uri || dbMeeting.meetLink,
        location: calendarEvent.location || dbMeeting.location || "Virtual Meeting",
        organizer: calendarEvent.organizer?.email || user.email,
        role: "organizer"
      };
    }).filter(Boolean);

    // Process attended meetings (from Google Calendar only)
    const attendedMeetings = attendedEvents.map(calendarEvent => {
      // Find the current user's response status from the event
      const userAttendee = calendarEvent.attendees?.find(attendee => 
        attendee.email === user.email
      );
      const responseStatus = userAttendee?.responseStatus || 'needsAction';
      
      // Map Google Calendar response status to our status
      let status = 'pending';
      if (responseStatus === 'accepted') {
        status = 'accepted';
      } else if (responseStatus === 'declined') {
        status = 'rejected';
      } else if (responseStatus === 'tentative') {
        status = 'pending';
      }

      return {
        id: calendarEvent.id,
        title: calendarEvent.summary || "Untitled Meeting",
        description: calendarEvent.description || "",
        startTime: calendarEvent.start?.dateTime || calendarEvent.start?.date || "",
        endTime: calendarEvent.end?.dateTime || calendarEvent.end?.date || "",
        status: status,
        attendees: calendarEvent.attendees?.map(a => a.email) || [],
        meetLink: calendarEvent.hangoutLink || calendarEvent.conferenceData?.entryPoints?.[0]?.uri || "",
        location: calendarEvent.location || "Virtual Meeting",
        organizer: calendarEvent.organizer?.email || "",
        role: "attendee",
        calendarEventId: calendarEvent.id
      };
    });

    // Combine and sort all meetings
    const allMeetings = [...organizedMeetings, ...attendedMeetings];
    allMeetings.sort((a, b) => {
      if (!a || !b) return 0;
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

    return NextResponse.json(allMeetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
} 