import { NextResponse } from "next/server";
import { db } from "@/backend/database";
import { scouts, daftarScouts } from "@/backend/drizzle/models/scouts";
import { daftarInvestors } from "@/backend/drizzle/models/daftar";
import { and, eq, lte, inArray, not } from "drizzle-orm";
import { createNotification } from "@/lib/notifications/insert";

export async function GET() {
  try {
    const todayDate = new Date();
    const today = todayDate.toISOString().split("T")[0]; // YYYY-MM-DD

    // --- 1. Activate Scouts ---
    const activatedScouts = await db
      .update(scouts)
      .set({ status: "active", isLocked: true })
      .where(
        and(
          eq(scouts.status, "scheduled"),
          lte(scouts.programLaunchDate, today)
        )
      )
      .returning();

    for (const scout of activatedScouts) {
      const scoutId = scout.scoutId;

      const linkedDaftars = await db
        .select({ daftarId: daftarScouts.daftarId })
        .from(daftarScouts)
        .where(eq(daftarScouts.scoutId, scoutId));

      const daftarIds = linkedDaftars
        .map((d) => d.daftarId)
        .filter((id): id is string => id !== null);
      if (!daftarIds.length) continue;

      const investors = await db
        .select({ userId: daftarInvestors.investorId })
        .from(daftarInvestors)
        .where(inArray(daftarInvestors.daftarId, daftarIds));

      const userIds = investors
        .map((i) => i.userId)
        .filter((id): id is string => id !== null);
      if (!userIds.length) continue;

      await createNotification({
        type: "scout_link",
        title: "Scout is now live",
        description: `${scout.scoutName} just got active. Share with your friends.`,
        role: "investor",
        targeted_users: userIds,
        payload: {
          message: `${scout.scoutName} just got active. Share with your friends.`,
          daftar_id: daftarIds.join(","),
        },
      });
    }

    // --- 2. Close Scouts if lastDayToPitch has passed ---
    const closedScouts = await db
      .update(scouts)
      .set({ status: "closed" })
      .where(
        and(not(eq(scouts.status, "closed")), lte(scouts.lastDayToPitch, today))
      )
      .returning();

    return NextResponse.json({
      message: "Scout statuses updated",
      activatedCount: activatedScouts.length,
      closedCount: closedScouts.length,
      activatedScouts,
      closedScouts,
    });
  } catch (error: any) {
    console.error("Failed to update scout statuses:", error);
    return NextResponse.json(
      { error: "Failed to update scout statuses" },
      { status: 500 }
    );
  }
}
