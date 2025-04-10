import { NextResponse, NextRequest } from "next/server";
import { db } from "@/backend/database";
import { scouts } from "@/backend/drizzle/models/scouts";
import { eq } from "drizzle-orm";
import { auth } from "@/auth"; // Adjust path if needed

// POST: Update Scout Details
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scoutId, lastDayToPitch, programLaunchDate } = body;

    if (!scoutId) {
      return NextResponse.json({ error: "scoutId is required" }, { status: 400 });
    }

    const existingScout = await db
      .select()
      .from(scouts)
      .where(eq(scouts.scoutId, scoutId))
      .limit(1);

    if (existingScout.length === 0) {
      return NextResponse.json({ error: "Scout not found" }, { status: 404 });
    }

    const updatedScout = await db
      .update(scouts)
      .set({
        status: "scheduled",
        lastDayToPitch: lastDayToPitch || null,
        programLaunchDate: programLaunchDate || null,
      })
      .where(eq(scouts.scoutId, scoutId))
      .returning();

    return NextResponse.json(
      { message: "Scout details updated successfully", data: updatedScout[0] },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update scout details" },
      { status: 500 }
    );
  }
}

// GET: Get Scout Details (Authenticated)
export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const scoutId = searchParams.get("scoutId");

  if (!scoutId) {
    return NextResponse.json({ error: "scoutId is required" }, { status: 400 });
  }

  const scout = await db
    .select()
    .from(scouts)
    .where(eq(scouts.scoutId, scoutId))
    .limit(1);

  if (scout.length === 0) {
    return NextResponse.json({ error: "Scout not found" }, { status: 404 });
  }

  return NextResponse.json({ data: scout[0] }, { status: 200 });
}
