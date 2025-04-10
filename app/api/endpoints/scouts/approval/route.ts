import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/backend/database";
import {
  daftarScouts,
  scoutApproved,
  scouts,
} from "@/backend/drizzle/models/scouts";
import { users } from "@/backend/drizzle/models/users";
import { eq, and } from "drizzle-orm";
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
      return NextResponse.json(
        { error: "Approval record not found for this user and scout" },
        { status: 404 }
      );
    }

    // Get daftarId for the scout
    const daftarIdRes = await db
      .select({ daftarId: daftarScouts.daftarId })
      .from(daftarScouts)
      .where(eq(daftarScouts.scoutId, scoutId))
      .limit(1);

    if (daftarIdRes.length === 0 || !daftarIdRes) {
      return NextResponse.json(
        { error: "Daftar not linked to scout" },
        { status: 400 }
      );
    }

    const daftarId = daftarIdRes[0].daftarId;

    // Get all members of that daftar
    const daftarMembers = await db
      .select({ investorId: daftarInvestors.investorId })
      .from(daftarInvestors)
      .where(eq(daftarInvestors.daftarId, daftarId!));

    const allInvestorIds = daftarMembers.map((member) => member.investorId);

    // Get all approvals for this scout
    const approved = await db
      .select({ investorId: scoutApproved.investorId })
      .from(scoutApproved)
      .where(
        and(
          eq(scoutApproved.scoutId, scoutId),
          eq(scoutApproved.isApproved, true)
        )
      );

    const approvedIds = approved.map((item) => item.investorId);

    // Check if all daftar members have approved
    const isApprovedByAll = allInvestorIds.every((id) =>
      approvedIds.includes(id)
    );

    // Update the scout
    const updatedScout = await db
      .update(scouts)
      .set({
        isApprovedByAll,
      })
      .where(eq(scouts.scoutId, scoutId))
      .returning();

    return NextResponse.json(
      { message: "Scout approved successfully", data: updatedScout[0] },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to approve scout", details: error.message },
      { status: 500 }
    );
  }
}
