import { NextResponse, NextRequest } from "next/server";
import { db } from "@/backend/database";
import { scouts, daftarScouts } from "@/backend/drizzle/models/scouts";
import { daftarInvestors } from "@/backend/drizzle/models/daftar";
import { createNotification } from "@/lib/notifications/insert";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scoutId, lastDayToPitch, programLaunchDate } = body;

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
        status: "scheduled",
        lastDayToPitch: lastDayToPitch || null,
        programLaunchDate: programLaunchDate || null,
      })
      .where(eq(scouts.scoutId, scoutId))
      .returning();

    const scout = updatedScout[0];
    const scoutName = scout.scoutName;

    // Notification logic
    if (scout.status === "scheduled") {
      const linkedDaftars = await db
        .select({ daftarId: daftarScouts.daftarId })
        .from(daftarScouts)
        .where(eq(daftarScouts.scoutId, scoutId));

      const daftarIds = linkedDaftars
        .map((d) => d.daftarId)
        .filter((id): id is string => id !== null);

      if (daftarIds.length) {
        const investors = await db
          .select({ userId: daftarInvestors.investorId })
          .from(daftarInvestors)
          .where(inArray(daftarInvestors.daftarId, daftarIds));

        const userIds = investors
          .map((i) => i.userId)
          .filter((id): id is string => id !== null);

        if (userIds.length) {
          await createNotification({
            type: "updates",
            title: "Scout Scheduled",
            description: `${scoutName} has been scheduled. Stay tuned!`,
            role: "both",
            targeted_users: userIds,
            payload: {
              message: `${scoutName} has been scheduled. Stay tuned!`,
              daftar_id: daftarIds.join(","),
            },
          });
        }
      }
    }

    return NextResponse.json(
      { message: "Scout details updated successfully", data: scout },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Failed to update scout details:", error);
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
