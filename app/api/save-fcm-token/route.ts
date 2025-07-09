import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/backend/database';
import { users } from '@/backend/drizzle/models/users';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    // Get session using the auth function
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database by email
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse request body
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    // Update user's FCM token
    await db
      .update(users)
      .set({ fcm_token: token })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 