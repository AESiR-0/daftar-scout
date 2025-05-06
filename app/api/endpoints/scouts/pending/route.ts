import { db } from "@/backend/database";
import {
  scouts,
  scoutQuestions,
  scoutDocuments,
  faqs,
  scoutApproved,
  daftarScouts,
} from "@/backend/drizzle/models/scouts";
import { isNull, or, eq, and, inArray } from "drizzle-orm";
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

    const daftarIds = scoutDaftars.map(d => d.daftarId).filter(Boolean);

    // Get all investors from these daftars
    const daftarInvestorsList = await db
      .select({
        investorId: daftarInvestors.investorId,
        daftarId: daftarInvestors.daftarId,
        designation: daftarInvestors.designation,
      })
      .from(daftarInvestors)
      .where(
        and(
          inArray(daftarInvestors.daftarId, daftarIds),
          eq(daftarInvestors.status, "active")
        )
      );

    // Check if current user is part of any of these daftars
    const isUserAuthorized = daftarInvestorsList.some(
      di => di.investorId === currentUserId
    );

    if (!isUserAuthorized) {
      return NextResponse.json(
        { error: "User not authorized to view this scout" },
        { status: 403 }
      );
    }

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
        issues.push("Scout details are missing");
      if (!s.scoutCommunity?.trim())
        issues.push("Scout community information is missing");
      if (!s.targetAudLocation?.trim())
        issues.push("Target audience location is missing");
      if (!s.investorPitch?.trim())
        issues.push("Investor pitch is missing");
    }

    // Check FAQs
    const faqsEmpty = await db
      .select({ faqAnswer: faqs.faqAnswer })
      .from(faqs)
      .where(eq(faqs.scoutId, scoutId));

    for (const faq of faqsEmpty) {
      if (!faq.faqAnswer?.trim()) {
        issues.push("One or more FAQ answers are missing");
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
        issues.push("One or more document URLs are missing");
        break;
      }
    }

    // Get all approvals for this scout
    const approvals = await db
      .select({
        scoutId: scoutApproved.scoutId,
        isApproved: scoutApproved.isApproved,
        investorId: scoutApproved.investorId,
        approvedAt: scoutApproved.approvedAt,
      })
      .from(scoutApproved)
      .where(eq(scoutApproved.scoutId, scoutId));

    // Get user details for all investors
    const investorIds = daftarInvestorsList.map(di => di.investorId);
    const userDetails = await db
      .select({
        id: users.id,
        name: users.name,
        lastName: users.lastName,
        email: users.email,
      })
      .from(users)
      .where(inArray(users.id, investorIds));

    // Get daftar names
    const daftarNames = await db
      .select({
        id: daftar.id,
        name: daftar.name,
      })
      .from(daftar)
      .where(inArray(daftar.id, daftarIds));

    // Combine all information
    const listOfUsers = daftarInvestorsList.map(investor => {
      const user = userDetails.find(u => u.id === investor.investorId);
      const daftarName = daftarNames.find(d => d.id === investor.daftarId)?.name;
      const approval = approvals.find(a => a.investorId === investor.investorId);

      return {
        scoutId,
        isApproved: approval?.isApproved ?? false,
        investorId: investor.investorId,
        approvedAt: approval?.approvedAt ?? null,
        daftarName,
        designation: investor.designation,
        user: {
          name: user?.name ?? "",
          lastName: user?.lastName ?? "",
          email: user?.email ?? "",
        },
      };
    });

    const currentUserApprovalStatus = approvals.find(
      a => a.investorId === currentUserId
    )?.isApproved ?? false;

    return NextResponse.json({
      issues,
      listOfUsers,
      currentUserApprovalStatus,
      currentUserId,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch scout info" },
      { status: 500 }
    );
  }
}
