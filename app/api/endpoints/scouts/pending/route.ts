import { db } from "@/backend/database";
import {
  scouts,
  scoutQuestions,
  scoutDocuments,
  faqs,
  scoutApproved,
  daftarScouts,
} from "@/backend/drizzle/models/scouts";
import { isNull, or, eq, and } from "drizzle-orm";
import { users } from "@/backend/drizzle/models/users";
import { daftar, daftarInvestors } from "@/backend/drizzle/models/daftar";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId");

    if (!scoutId) {
      throw Error("ScoutId not given");
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

    const issues: string[] = [];

    // Check scouts
    const scoutRecord = await db
      .select({
        scoutDetails: scouts.scoutDetails,
        scoutCommunity: scouts.scoutCommunity,
        targetAudLocation: scouts.targetAudLocation,
        investorPitch: scouts.investorPitch,
      })
      .from(scouts)
      .where(eq(scouts.scoutId, scoutId))
      .limit(1);

    if (scoutRecord.length > 0) {
      const s = scoutRecord[0];
      if (!s.scoutDetails?.trim())
        issues.push("Please ensure the field in scoutDetails of scouts");
      if (!s.scoutCommunity?.trim())
        issues.push("Please ensure the field in scoutCommunity of scouts");
      if (!s.targetAudLocation?.trim())
        issues.push("Please ensure the field in targetAudLocation of scouts");
      if (!s.investorPitch?.trim())
        issues.push("Please ensure the field in investorPitch of scouts");
    }

    // Check FAQs
    const faqsEmpty = await db
      .select({ faqAnswer: faqs.faqAnswer })
      .from(faqs)
      .where(eq(faqs.scoutId, scoutId));

    for (const faq of faqsEmpty) {
      if (!faq.faqAnswer?.trim()) {
        issues.push("Please ensure the field in faqAnswer of faqs");
        break;
      }
    }

    // Check scout documents
    const docsEmpty = await db
      .select({ docUrl: scoutDocuments.docUrl })
      .from(scoutDocuments)
      .where(eq(scoutDocuments.scoutId, scoutId));

    for (const doc of docsEmpty) {
      if (!doc.docUrl?.trim()) {
        issues.push("Please ensure the field in docUrl of scoutDocuments");
        break;
      }
    }

    // Check approvals list
    const listOfUsers = await db
      .select({
        scoutId: scoutApproved.scoutId,
        isApproved: scoutApproved.isApproved,
        investorId: scoutApproved.investorId,
        approvedAt: scoutApproved.approvedAt,
        daftarName: daftar.name,
        designation: daftarInvestors.designation,
        user: {
          name: users.name,
          lastName: users.lastName,
          email: users.email,
          role: users.role,
        },
      })
      .from(scoutApproved)
      .leftJoin(users, eq(scoutApproved.investorId, users.id))
      .leftJoin(daftarScouts, eq(scoutApproved.scoutId, daftarScouts.scoutId))
      .leftJoin(daftar, eq(daftarScouts.daftarId, daftar.id))
      .leftJoin(
        daftarInvestors,
        and(
          eq(daftar.id, daftarInvestors.daftarId),
          eq(scoutApproved.investorId, daftarInvestors.investorId)
        )
      )
      .where(eq(scoutApproved.scoutId, scoutId));

    const userApproval = listOfUsers.find(
      (entry) => entry.investorId === currentUserId
    );

    const currentUserApprovalStatus = userApproval?.isApproved ?? null;

    return NextResponse.json({
      issues,
      listOfUsers,
      currentUserApprovalStatus,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch scout info" },
      { status: 500 }
    );
  }
}
