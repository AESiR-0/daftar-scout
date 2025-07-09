import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { notifications } from "@/backend/drizzle/models/notifications";
import { auth } from "@/auth";
import { desc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Authenticate the user
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Fetch all notifications where userId is in targeted_users
    const allNotifications = await db
      .select()
      .from(notifications)
      .where(sql`${userId} = ANY(${notifications.targeted_users})`)
      .orderBy(desc(notifications.created_at));

    return NextResponse.json(allNotifications, { status: 200 });
  } catch (error) {
    console.error("GET /api/endpoints/notifications/all error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
