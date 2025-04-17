import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { SupportRequests } from "@/backend/drizzle/models/reportAndRequests";
import { auth } from "@/auth";
import { users } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const supports = await db.select().from(SupportRequests);
    return NextResponse.json(supports);
  } catch (error) {
    console.error("Error fetching support requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch support requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = session;
    if (!user?.email) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    // Fetch user record (to get user.id)
    const userExist = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1);

    const dbUser = userExist[0];
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { supportName, description } = await req.json();
    if (!supportName || !description) {
      return NextResponse.json(
        { error: "Missing required fields: supportName, description" },
        { status: 400 }
      );
    }

    const [newSupport] = await db
      .insert(SupportRequests)
      .values({ supportName, description, userId: dbUser.id })
      .returning();

    return NextResponse.json(
      { message: "Support request submitted", data: newSupport },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting support request:", error);
    return NextResponse.json(
      { error: "Failed to submit support request" },
      { status: 500 }
    );
  }
}