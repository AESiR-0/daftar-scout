import { NextResponse } from 'next/server';
import { db } from '@/backend/database';
import { pitch, pitchTeam } from '@/backend/drizzle/models/pitch';
import { eq, and } from 'drizzle-orm';
import { users } from '@/backend/drizzle/models/users';
import { createNotification } from '@/lib/notifications/insert';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Decode the token (in production, use proper JWT verification)
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, pitchId, action, timestamp] = decoded.split(':');

    if (!userId || !pitchId || !action) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Check if the token is expired (e.g., 24 hours)
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return NextResponse.json({ error: 'Token expired' }, { status: 400 });
    }

    // Get user details
    const [user] = await db
      .select({
        name: users.name,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userName = `${user.name || ''} ${user.lastName || ''}`.trim();

    // Get pitch details
    const [pitchDetails] = await db
      .select({
        name: pitch.pitchName,
      })
      .from(pitch)
      .where(eq(pitch.id, pitchId));

    if (!pitchDetails) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 });
    }

    // Get existing team members
    const existingTeamMembers = await db
      .select({
        userId: pitchTeam.userId,
        designation: pitchTeam.designation,
      })
      .from(pitchTeam)
      .where(eq(pitchTeam.pitchId, pitchId));

    const teamMemberIds = existingTeamMembers
      .map(member => member.userId)
      .filter((id): id is string => id !== null && id !== userId);

    // Get user's designation
    const userTeamMember = existingTeamMembers.find(member => member.userId === userId);
    const designation = userTeamMember?.designation || 'Team Member';

    // Update the pitch team record
    if (action === 'accept') {
      await db
        .update(pitchTeam)
        .set({ invitationAccepted: true })
        .where(and(eq(pitchTeam.userId, userId), eq(pitchTeam.pitchId, pitchId)));

      // Notify team members about acceptance
      if (teamMemberIds.length > 0) {
        await createNotification({
          type: "updates",
          subtype: "team_join",
          title: "New Team Member Joined",
          description: `${userName} has accepted the invitation to join ${pitchDetails.name} as ${designation}`,
          targeted_users: teamMemberIds,
          role: "founder",
          payload: {
            pitchId,
            designation,
            message: `${userName} has accepted the invitation to join ${pitchDetails.name} as ${designation}`,
            action: "accept",
            action_by: userId,
            action_at: new Date().toISOString(),
          },
        });
      }
    } else if (action === 'reject') {
      await db
        .update(pitchTeam)
        .set({ invitationAccepted: false })
        .where(and(eq(pitchTeam.userId, userId), eq(pitchTeam.pitchId, pitchId)));

      // Notify team members about rejection
      if (teamMemberIds.length > 0) {
        await createNotification({
          type: "updates",
          subtype: "team_decline",
          title: "Team Invitation Declined",
          description: `${userName} has declined the invitation to join ${pitchDetails.name} as ${designation}`,
          targeted_users: teamMemberIds,
          role: "founder",
          payload: {
            pitchId,
            designation,
            message: `${userName} has declined the invitation to join ${pitchDetails.name} as ${designation}`,
            action: "decline",
            action_by: userId,
            action_at: new Date().toISOString(),
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing pitch team action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
} 