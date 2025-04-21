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
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const scoutId = searchParams.get("scoutId");

  if (!scoutId) {
    return NextResponse.json({ error: "ScoutId not given" }, { status: 400 });
  }

  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1);

  if (user.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const currentUserId = user[0].id;

  const listOfUsers = await db
    .select({
      scoutId: scoutDelete.scoutId,
      isAgreed: scoutDelete.isAgreed,
      investorId: scoutDelete.investorId,
      agreedAt: scoutDelete.agreedAt,
      daftarName: daftar.name,
      designation: daftarInvestors.designation,
      user: {
        name: users.name,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
      },
    })
    .from(scoutDelete)
    .leftJoin(users, eq(scoutDelete.investorId, users.id))
    .leftJoin(daftarScouts, eq(scoutDelete.scoutId, daftarScouts.scoutId))
    .leftJoin(daftar, eq(daftarScouts.daftarId, daftar.id))
    .leftJoin(
      daftarInvestors,
      and(
        eq(daftar.id, daftarInvestors.daftarId),
        eq(scoutDelete.investorId, daftarInvestors.investorId)
      )
    )
    .where(eq(scoutDelete.scoutId, scoutId));

  const userApproval = listOfUsers.find(
    (entry) => entry.investorId === currentUserId
  );

  const currentUserApprovalStatus = userApproval?.isAgreed ?? null;

  return NextResponse.json({
    listOfUsers,
    currentUserApprovalStatus,
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { scoutId, isAgreed } = body;

    if (!scoutId || isAgreed === undefined) {
      return NextResponse.json(
        { error: "scoutId and isAgreed are required" },
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

    // Upsert approval in scoutDelete table
    const existingApproval = await db
      .select()
      .from(scoutDelete)
      .where(
        and(
          eq(scoutDelete.scoutId, scoutId),
          eq(scoutDelete.investorId, investorId)
        )
      );

    const agreedAt = isAgreed ? new Date() : null;

    if (existingApproval.length > 0) {
      // Update existing approval
      await db
        .update(scoutDelete)
        .set({
          isAgreed,
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
        isAgreed,
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
    let updatedScout = null;
    if (deleteIsAgreedByAll) {
      updatedScout = await db
        .update(scouts)
        .set({
          isArchived: true,
          deletedOn: new Date(),
          deleteIsAgreedByAll: true,
        })
        .where(eq(scouts.scoutId, scoutId))
        .returning();
    }

    return NextResponse.json(
      {
        message: deleteIsAgreedByAll
          ? "Scout archived successfully"
          : "Approval recorded successfully",
        data: updatedScout ? updatedScout[0] : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /scout-documents error:", error);
    return NextResponse.json(
      { error: "Failed to record approval" },
      { status: 500 }
    );
  }
}
