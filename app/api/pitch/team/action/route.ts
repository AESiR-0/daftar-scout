import { NextResponse } from 'next/server';
import { db } from '@/backend/database';
import { pitchTeam } from '@/backend/drizzle/models/pitch';
import { eq, and } from 'drizzle-orm';

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

    // Update the pitch team record
    if (action === 'accept') {
      await db
        .update(pitchTeam)
        .set({ hasApproved: true })
        .where(and(eq(pitchTeam.userId, userId), eq(pitchTeam.pitchId, pitchId)));
    } else if (action === 'reject') {
      await db
        .update(pitchTeam)
        .set({ hasApproved: false })
        .where(and(eq(pitchTeam.userId, userId), eq(pitchTeam.pitchId, pitchId)));
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