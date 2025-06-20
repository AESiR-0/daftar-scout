import { NextResponse, NextRequest } from "next/server";
import { db } from "@/backend/database";
import {
  scoutDelete,
  scouts,
  daftarScouts,
} from "@/backend/drizzle/models/scouts";
import { users } from "@/backend/drizzle/models/users";
import { daftar, daftarInvestors } from "@/backend/drizzle/models/daftar";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId");

    if (!scoutId) {
      return NextResponse.json({ error: "ScoutId not given" }, { status: 400 });
    }

    // Get daftarId for the scout
    const scoutCheck = await db
      .select({ daftarId: daftarScouts.daftarId })
      .from(daftarScouts)
      .where(eq(daftarScouts.scoutId, scoutId))
      .limit(1);

    if (scoutCheck.length === 0) {
      return NextResponse.json({ error: "Scout not found" }, { status: 404 });
    }

    const daftarId = scoutCheck[0].daftarId;
    if (!daftarId) {
      return NextResponse.json({ error: "Daftar not found" }, { status: 404 });
    }

    // Get current user's ID
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUserId = user[0].id;

    // Get current user's approval status
    const currentUserApproval = await db
      .select({ isAgreed: scoutDelete.isAgreed })
      .from(scoutDelete)
      .where(
        and(
          eq(scoutDelete.scoutId, scoutId),
          eq(scoutDelete.investorId, currentUserId)
        )
      )
      .limit(1);

    // Get all investors in the daftar with their details
    const daftarInvestorsList = await db
      .select({
        investorId: daftarInvestors.investorId,
        designation: daftarInvestors.designation,
        daftarName: daftar.name,
        user: {
          name: users.name,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(daftarInvestors)
      .leftJoin(users, eq(daftarInvestors.investorId, users.id))
      .leftJoin(daftar, eq(daftarInvestors.daftarId, daftar.id))
      .where(eq(daftarInvestors.daftarId, daftarId));

    // Get all approvals for this scout
    const approvals = await db
      .select({
        investorId: scoutDelete.investorId,
        isAgreed: scoutDelete.isAgreed,
        agreedAt: scoutDelete.agreedAt,
      })
      .from(scoutDelete)
      .where(eq(scoutDelete.scoutId, scoutId));

    // Combine the data
    const members = daftarInvestorsList.map((investor) => {
      const approval = approvals.find((a) => a.investorId === investor.investorId);
      const userName = investor.user ? `${investor.user.name} ${investor.user.lastName}` : 'Unknown User';
      
      return {
        name: userName,
        isApproved: approval?.isAgreed || false,
        status: approval ? (approval.isAgreed ? 'approved' : 'rejected') : 'pending',
        daftarName: investor.daftarName || 'Unknown Daftar',
        designation: investor.designation || 'Unknown Designation',
      };
    });

    return NextResponse.json({ 
      members,
      currentUserApprovalStatus: currentUserApproval 
    });
  } catch (error) {
    console.error("GET /scout-delete error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deletion approvals" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { scoutId } = body;

    if (!scoutId) {
      return NextResponse.json(
        { error: "scoutId is required" },
        { status: 400 }
      );
    }

    // Get current user
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const investorId = user[0].id;

    // Verify scout and daftar association
    const scoutCheck = await db
      .select({ daftarId: daftarScouts.daftarId })
      .from(daftarScouts)
      .where(eq(daftarScouts.scoutId, scoutId))
      .limit(1);

    if (scoutCheck.length === 0) {
      return NextResponse.json({ error: "Scout not found" }, { status: 404 });
    }

    const daftarId = scoutCheck[0].daftarId;

    // Verify user is part of daftar
    const investorCheck = await db
      .select()
      .from(daftarInvestors)
      .where(
        and(
          eq(daftarInvestors.investorId, investorId),
          eq(daftarInvestors.daftarId, daftarId ?? "")
        )
      );

    if (investorCheck.length === 0) {
      return NextResponse.json(
        { error: "User not part of this Daftar" },
        { status: 403 }
      );
    }

    // Record approval in scoutDelete table
    const agreedAt = new Date();
    const existingApproval = await db
      .select()
      .from(scoutDelete)
      .where(
        and(
          eq(scoutDelete.scoutId, scoutId),
          eq(scoutDelete.investorId, investorId)
        )
      );

    if (existingApproval.length > 0) {
      // Update existing approval
      await db
        .update(scoutDelete)
        .set({
          isAgreed: true,
          agreedAt,
        })
        .where(
          and(
            eq(scoutDelete.scoutId, scoutId),
            eq(scoutDelete.investorId, investorId)
          )
        );
    } else {
      // Insert new approval
      await db.insert(scoutDelete).values({
        scoutId,
        investorId,
        isAgreed: true,
        agreedAt,
      });
    }

    // Check if all daftar members have approved
    const daftarMembers = await db
      .select({ investorId: daftarInvestors.investorId })
      .from(daftarInvestors)
      .where(eq(daftarInvestors.daftarId, daftarId ?? ""));

    const allInvestorIds = daftarMembers.map((member) => member.investorId);

    const approved = await db
      .select({ investorId: scoutDelete.investorId })
      .from(scoutDelete)
      .where(
        and(eq(scoutDelete.scoutId, scoutId), eq(scoutDelete.isAgreed, true))
      );

    const approvedIds = approved.map((item) => item.investorId);
    const deleteIsAgreedByAll = allInvestorIds.every((id) =>
      approvedIds.includes(id)
    );

    // Update scout if all approved
    if (deleteIsAgreedByAll) {
      await db
        .update(scouts)
        .set({
          isArchived: true,
          status: 'closed',
          deletedOn: new Date(),
          deleteIsAgreedByAll: true,
        })
        .where(eq(scouts.scoutId, scoutId));
    }

    return NextResponse.json(
      {
        message: deleteIsAgreedByAll
          ? "Scout archived successfully"
          : "Approval recorded successfully",
        isArchived: deleteIsAgreedByAll,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /scout-delete error:", error);
    return NextResponse.json(
      { error: "Failed to record approval" },
      { status: 500 }
    );
  }
}
