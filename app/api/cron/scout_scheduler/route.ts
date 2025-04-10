import { NextResponse } from "next/server";
import { db } from "@/backend/database";
import { scouts } from "@/backend/drizzle/models/scouts";
import { and, eq, lte } from "drizzle-orm";

export async function GET() {
  try {
    const today = new Date();

    const updatedScouts = await db
      .update(scouts)
      .set({ status: "active" })
      .where(
        and(
          eq(scouts.status, "scheduled"),
          lte(scouts.programLaunchDate, today.toISOString().split("T")[0])
        )
      )
      .returning();

    return NextResponse.json({
      message: "Scout statuses updated",
      count: updatedScouts.length,
      updatedScouts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update scout statuses" },
      { status: 500 }
    );
  }
}
