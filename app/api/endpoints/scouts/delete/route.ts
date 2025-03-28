import { NextResponse, NextRequest } from "next/server";
import { db } from "@/backend/database";
import { scouts } from "@/backend/drizzle/models/scouts";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scoutId, isArchived, deletedOn, status, deleteIsAgreedByAll, deleteRequestDate } = body;

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
      return NextResponse.json(
        { error: "Scout not found" },
        { status: 404 }
      );
    }

    const updatedScout = await db
      .update(scouts)
      .set({
        isArchived: isArchived || false,
        deletedOn: deletedOn || null,
        status: status || null,
        deleteIsAgreedByAll: deleteIsAgreedByAll || false,
        deleteRequestDate: deleteRequestDate || null,
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