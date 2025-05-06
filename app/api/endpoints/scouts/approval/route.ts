import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/backend/database";
import {
  daftarScouts,
  scoutApproved,
  scouts,
} from "@/backend/drizzle/models/scouts";
import { users } from "@/backend/drizzle/models/users";
import { eq, and, inArray } from "drizzle-orm";
import { daftarInvestors } from "@/backend/drizzle/models/daftar";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;

    const body = await req.json();
    const { scoutId } = body;

    if (!scoutId) {
      return NextResponse.json(
        { error: "scoutId is required" },
        { status: 400 }
      );
    }

    // Get investorId using email
    const userRes = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userRes.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const investorId = userRes[0].id;

    // Get the daftars associated with this scout
    const scoutDaftars = await db
      .select({ daftarId: daftarScouts.daftarId })
      .from(daftarScouts)
      .where(eq(daftarScouts.scoutId, scoutId));

    if (scoutDaftars.length === 0) {
      return NextResponse.json(
        { error: "Scout not associated with any daftar" },
        { status: 404 }
      );
    }

    const daftarIds = scoutDaftars
      .map(d => d.daftarId)
      .filter((id): id is string => id !== null);

    // Check if user is part of any of these daftars
    const userDaftars = await db
      .select()
      .from(daftarInvestors)
      .where(
        and(
          inArray(daftarInvestors.daftarId, daftarIds),
          eq(daftarInvestors.investorId, investorId),
          eq(daftarInvestors.status, "active")
        )
      );

    if (userDaftars.length === 0) {
      return NextResponse.json(
        { error: "User not authorized to approve this scout" },
        { status: 403 }
      );
    }

    // Check if approval exists
    const existingApproval = await db
      .select()
      .from(scoutApproved)
      .where(
        and(
          eq(scoutApproved.scoutId, scoutId),
          eq(scoutApproved.investorId, investorId)
        )
      )
      .limit(1);

    if (existingApproval.length > 0) {
      // Update isApproved = true
      await db
        .update(scoutApproved)
        .set({ isApproved: true, approvedAt: new Date() })
        .where(
          and(
            eq(scoutApproved.scoutId, scoutId),
            eq(scoutApproved.investorId, investorId)
          )
        );
    } else {
      // Create new approval
      await db.insert(scoutApproved).values({
        scoutId,
        investorId,
        isApproved: true,
        approvedAt: new Date(),
      });
    }

    // Get all investors from these daftars
    const daftarInvestorsList = await db
      .select({
        investorId: daftarInvestors.investorId,
      })
      .from(daftarInvestors)
      .where(
        and(
          inArray(daftarInvestors.daftarId, daftarIds),
          eq(daftarInvestors.status, "active")
        )
      );

    const allInvestorIds = daftarInvestorsList.map(di => di.investorId);

    // Get all approvals for this scout
    const approvals = await db
      .select({
        investorId: scoutApproved.investorId,
      })
      .from(scoutApproved)
      .where(
        and(
          eq(scoutApproved.scoutId, scoutId),
          eq(scoutApproved.isApproved, true)
        )
      );

    const approvedIds = approvals.map(a => a.investorId);

    // Check if all investors have approved
    const isApprovedByAll = allInvestorIds.every(id => approvedIds.includes(id));

    // Update scout status if all approved
    if (isApprovedByAll) {
      await db
        .update(scouts)
        .set({
          isApprovedByAll,
          status: "Active",
        })
        .where(eq(scouts.scoutId, scoutId));
    }

    return NextResponse.json(
      { 
        message: "Scout approval recorded successfully",
        isApprovedByAll,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in scout approval:", error);
    return NextResponse.json(
      { error: "Failed to approve scout", details: error.message },
      { status: 500 }
    );
  }
}
