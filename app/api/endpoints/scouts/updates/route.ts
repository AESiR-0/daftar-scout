import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { scoutUpdates } from "@/backend/drizzle/models/scouts";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId");

    if (!scoutId) {
      return NextResponse.json(
        { error: "scoutId is required" },
        { status: 400 }
      );
    }

    const updates = await db
      .select({
        id: scoutUpdates.id,
        content: scoutUpdates.updateInfo,
        date: scoutUpdates.updateDate,
      })
      .from(scoutUpdates)
      .where(eq(scoutUpdates.scoutId, scoutId))
      .orderBy(desc(scoutUpdates.updateDate));

    return NextResponse.json(updates);
  } catch (error) {
    console.error("Error fetching scout updates:", error);
    return NextResponse.json(
      { error: "Failed to fetch updates" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { scoutId, content } = await req.json();

    if (!scoutId || !content) {
      return NextResponse.json(
        { error: "scoutId and content are required" },
        { status: 400 }
      );
    }

    const newUpdate = await db
      .insert(scoutUpdates)
      .values({
        scoutId,
        updateInfo: content,
      })
      .returning();

    return NextResponse.json({
      id: newUpdate[0].id.toString(),
      content: newUpdate[0].updateInfo,
      date: newUpdate[0].updateDate,
    });
  } catch (error) {
    console.error("Error creating scout update:", error);
    return NextResponse.json(
      { error: "Failed to create update" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const updateId = searchParams.get("updateId");

    if (!updateId) {
      return NextResponse.json(
        { error: "updateId is required" },
        { status: 400 }
      );
    }

    await db
      .delete(scoutUpdates)
      .where(eq(scoutUpdates.id, parseInt(updateId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting scout update:", error);
    return NextResponse.json(
      { error: "Failed to delete update" },
      { status: 500 }
    );
  }
} 