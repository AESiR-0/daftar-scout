import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database"; // your Drizzle instance
import { pitchDocs } from "@/backend/drizzle/models/pitch";
import { scoutDocuments } from "@/backend/drizzle/models/scouts";
import { users } from "@/backend/drizzle/models/users";
import { eq, inArray, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase/createClient";

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
    const { pitchId, docName, docType, docUrl, isPrivate, size } = body;

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
        size,
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
    const receivedDocs = [ ...investorPitchDocs];

    return NextResponse.json({
      sent: sentDocs,
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

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const docId = searchParams.get("id");

    if (!docId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // First get the document to check ownership and get the file path
    const [doc] = await db
      .select({
        docUrl: pitchDocs.docUrl,
        uploadedBy: pitchDocs.uploadedBy,
      })
      .from(pitchDocs)
      .where(eq(pitchDocs.id, docId));

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Check if user owns the document
    if (doc.uploadedBy !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this document" },
        { status: 403 }
      );
    }

    // Delete from Supabase Storage
    if (doc.docUrl) {
      const filePathMatch = doc.docUrl.match(/documents\/(.*)/);
      if (filePathMatch) {
        const filePath = filePathMatch[1];
        const { error: storageError } = await supabase.storage
          .from("documents")
          .remove([filePath]);

        if (storageError) {
          console.error("Error deleting from storage:", storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }
    }

    // Delete from database
    await db.delete(pitchDocs).where(eq(pitchDocs.id, docId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
