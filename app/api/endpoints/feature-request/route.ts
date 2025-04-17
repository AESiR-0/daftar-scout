import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { featureRequests } from "@/backend/drizzle/models/reportAndRequests";
import { auth } from "@/auth";
import { users } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const features = await db.select().from(featureRequests);
    return NextResponse.json(features);
  } catch (error) {
    console.error("Error fetching features:", error);
    return NextResponse.json(
      { error: "Failed to fetch features" },
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
    const { featureName, description } = await req.json();
    const [newFeature] = await db
      .insert(featureRequests)
      .values({ featureName, description, userId: dbUser.id })
      .returning();
    return NextResponse.json(
      { message: "Feature request submitted", data: newFeature },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting feature:", error);
    return NextResponse.json(
      { error: "Failed to submit feature" },
      { status: 500 }
    );  
  }
}
