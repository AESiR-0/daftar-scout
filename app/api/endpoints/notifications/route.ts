import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { daftar } from "@/backend/drizzle/models/daftar";
import { users } from "@/backend/drizzle/models/users";
import { scouts, daftarScouts } from "@/backend/drizzle/models/scouts";
import { auth } from "@/auth";
import { eq, count, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Authenticate the user
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the user exists in the database
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!dbUser.length) {
      return NextResponse.json({ error: "DB User not found" }, { status: 404 });
    }

    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const daftarId = searchParams.get("daftarId");
    const scoutId = searchParams.get("scoutId");
    const userId = searchParams.get("userId");

    // Validate query parameters
    if (!daftarId || !scoutId || !userId) {
      return NextResponse.json(
        { error: "Missing required query parameters: daftarId, scoutId, userId" },
        { status: 400 }
      );
    }

    // Fetch user name
    const userData = await db
      .select({
        firstName: users.name,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userData.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userName = `${userData[0].firstName || ""} ${userData[0].lastName || ""}`.trim();

    // Fetch Daftar name
    const daftarData = await db
      .select({
        name: daftar.name,
      })
      .from(daftar)
      .where(eq(daftar.id, daftarId))
      .limit(1);

    if (!daftarData.length) {
      return NextResponse.json({ error: "Daftar not found" }, { status: 404 });
    }

    const daftarName = daftarData[0].name;

    // Fetch scout name
    const scoutData = await db
      .select({
        name: scouts.scoutName,
        description: scouts.scoutDetails,
      })
      .from(scouts)
      .where(eq(scouts.scoutId, scoutId))
      .limit(1);

    if (!scoutData.length) {
      return NextResponse.json({ error: "Scout not found" }, { status: 404 });
    }

    const scoutName = scoutData[0].name;

    // Count total collaborators for the scoutId
    const collaboratorCount = await db
      .select({ count: count() })
      .from(daftarScouts)
      .where(eq(daftarScouts.scoutId, scoutId));

    const totalCollaborators = collaboratorCount[0].count;

    // Return the response
    return NextResponse.json(
      {
        userName,
        daftarName,
        scoutName,
        totalCollaborators,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/endpoints/names error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}