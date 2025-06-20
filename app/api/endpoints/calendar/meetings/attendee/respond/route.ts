import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/backend/database'
import { users, accounts } from '@/backend/drizzle/models/users'
import { eq } from 'drizzle-orm'
import { google } from 'googleapis'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { calendarEventId, response } = await req.json()

    if (!calendarEventId || !response) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's Google account
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, user.id))

    if (!account) {
      return NextResponse.json(
        { error: 'Google account not found' },
        { status: 404 }
      )
    }

    // Create Google Calendar client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL
    )

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
      expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Update the event with the attendee's response
    const event = await calendar.events.get({
      calendarId: 'primary',
      eventId: calendarEventId,
    })

    if (!event.data) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Find the current user in attendees and update their response
    const attendees = event.data.attendees || []
    const userEmail = user.email
    const updatedAttendees = attendees.map(attendee => {
      if (attendee.email === userEmail) {
        return {
          ...attendee,
          responseStatus: response === 'accepted' ? 'accepted' : 'declined'
        }
      }
      return attendee
    })

    // Update the event
    await calendar.events.update({
      calendarId: 'primary',
      eventId: calendarEventId,
      requestBody: {
        ...event.data,
        attendees: updatedAttendees,
      },
      sendUpdates: 'all',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error responding to meeting:', error)
    return NextResponse.json(
      { error: 'Failed to respond to meeting' },
      { status: 500 }
    )
  }
} 