import { auth } from "@/auth";
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Authenticate the user
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await db
      .select({ userId: users.id })
      .from(users)
      .where(eq(users.email, session.user.email));
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const id = user[0].userId;
    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
