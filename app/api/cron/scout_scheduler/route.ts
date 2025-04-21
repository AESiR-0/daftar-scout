import { NextResponse } from "next/server";
import { db } from "@/backend/database";
import { scouts, daftarScouts } from "@/backend/drizzle/models/scouts";
import { daftarInvestors } from "@/backend/drizzle/models/daftar";
import { and, eq, lte, inArray } from "drizzle-orm";
import { createNotification } from "@/lib/notifications/insert";
import { users } from "@/backend/drizzle/models/users";

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

    // For each activated scout, create a notification
    for (const scout of updatedScouts) {
      const scoutId = scout.scoutId;

      // Get all daftars this scout is linked to
      const linkedDaftars = await db
        .select({ daftarId: daftarScouts.daftarId })
        .from(daftarScouts)
        .where(eq(daftarScouts.scoutId, scoutId));

      const daftarIds = linkedDaftars.map((d) => d.daftarId);
      if (!daftarIds.length) continue;

      // Get all users (investors) from those daftars
      const investors = await db
        .select({ userId: daftarInvestors.investorId })
        .from(daftarInvestors)
        .where(
          inArray(
            daftarInvestors.daftarId,
            daftarIds.filter((id): id is string => id !== null)
          )
        );

      const userIds = investors
        .map((i) => i.userId)
        .filter((id): id is string => id !== null);
      if (!userIds.length) continue;

      await createNotification({
        type: "scout_link",
        title: "Scout is now live",
        description: `${scout.scoutName} just got active. Share with your friends.`,
        role: "both", // optional if you want to scope it
        targeted_users: userIds,
        payload: {
          message: `${scout.scoutName} just got active. Share with your friends.`,
          daftar_id: daftarIds.length
            ? daftarIds.filter((id): id is string => id !== null).join(",")
            : undefined,
        },
      });
    }

    return NextResponse.json({
      message: "Scout statuses updated",
      count: updatedScouts.length,
      updatedScouts,
    });
  } catch (error: any) {
    console.error("Failed to update scout statuses:", error);
    return NextResponse.json(
      { error: "Failed to update scout statuses" },
      { status: 500 }
    );
  }
}
