import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database"; // your Drizzle instance
import { pitchDocs } from "@/backend/drizzle/models/pitch";
import { scoutDocuments } from "@/backend/drizzle/models/scouts";
import { users } from "@/backend/drizzle/models/users";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/auth"; // your auth function

// POST: Upload a document
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { user } = session;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, user.email ?? ""));
    if (!userId.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const uploadedBy = userId[0].id;
    const body = await req.json();
    const { pitchId, docName, docType, docUrl, isPrivate } = body;

    if (!pitchId || !docName || !docType || !docUrl || !uploadedBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const inserted = await db
      .insert(pitchDocs)
      .values({
        pitchId,
        docName,
        docType,
        docUrl,
        isPrivate,
        uploadedBy,
      })
      .returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    console.error("[POST /pitch-docs]", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

// GET: Fetch sent and received documents
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId");
    if (!scoutId) {
      return NextResponse.json(
        { error: "Scout ID is required" },
        { status: 400 }
      );
    }
    const pitchId = searchParams.get("pitchId");
    if (!pitchId) {
      return NextResponse.json(
        { error: "Pitch ID is required" },
        { status: 400 }
      );
    }
    // All documents user uploaded = sent
    const sentDocs = await db
      .select()
      .from(pitchDocs)
      .where(eq(pitchDocs.pitchId, pitchId));
    // All scout documents = received
    const scoutDocs = await db
      .select()
      .from(scoutDocuments)
      .where(eq(scoutDocuments.scoutId, scoutId));
    // Get documents from pitchDocs where uploadedBy is an investor
    const investorUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "investor"));
    const investorIds = investorUsers.map((u) => u.id);

    const investorPitchDocs = investorIds.length
      ? await db
          .select()
          .from(pitchDocs)
          .where((row) => inArray(row.uploadedBy, investorIds))
      : [];
    const receivedDocs = [...investorPitchDocs];

    return NextResponse.json({
      sent: [sentDocs, scoutDocs],
      received: receivedDocs,
    });
  } catch (error) {
    console.error("[GET /pitch-docs]", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
