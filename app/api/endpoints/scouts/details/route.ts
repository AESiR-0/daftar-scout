import { NextResponse, NextRequest } from "next/server";
import { db } from "@/backend/database";
import { scouts } from "@/backend/drizzle/models/scouts";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scoutId, scoutName } = body;

    if (!scoutId) {
      return NextResponse.json(
        { error: "scoutId is required" },
        { status: 400 }
      );
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
        scoutName: scoutName || null,
        scoutDetails: null,
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

// GET: Fetch scout name and vision
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scoutId = searchParams.get("scoutId");

  if (!scoutId) {
    return NextResponse.json({ error: "scoutId is required" }, { status: 400 });
  }

  const scout = await db
    .select({
      scoutName: scouts.scoutName,
      scoutVision: scouts.scoutDetails,
    })
    .from(scouts)
    .where(eq(scouts.scoutId, scoutId))
    .limit(1);

  if (!scout.length) {
    return NextResponse.json({ error: "Scout not found" }, { status: 404 });
  }

  return NextResponse.json({ data: scout[0] }, { status: 200 });
}

// PATCH: Update scout name and vision
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { scoutId, scoutName, scoutVision } = body;

    if (!scoutId) {
      return NextResponse.json(
        { error: "scoutId is required" },
        { status: 400 }
      );
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
        scoutName: scoutName ?? undefined,
        scoutDetails: scoutVision ?? undefined,
      })
      .where(eq(scouts.scoutId, scoutId))
      .returning();

    return NextResponse.json(
      { message: "Scout updated successfully", data: updatedScout[0] },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update scout details" },
      { status: 500 }
    );
  }
}
