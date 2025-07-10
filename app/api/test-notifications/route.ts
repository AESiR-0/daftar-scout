import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createNotification } from '@/lib/notifications/insert';

export async function POST(req: NextRequest) {
  try {
    // Get session using the auth function
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title = 'Test Notification', description = 'This is a test notification', userIds = [] } = await req.json();

    if (!userIds.length) {
      return NextResponse.json({ error: 'No user IDs provided' }, { status: 400 });
    }

    // Create a test notification
    const notification = await createNotification({
      type: 'updates',
      subtype: 'test',
      title,
      description,
      targeted_users: userIds,
      payload: {
        test: true,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({ 
      success: true, 
      notification,
      message: `Test notification sent to ${userIds.length} users`
    });
  } catch (error) {
    console.error('Error in test notification:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
} 