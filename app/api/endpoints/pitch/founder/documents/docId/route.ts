import { NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitchDocs } from "@/backend/drizzle/models/pitch";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { users } from "@/backend/drizzle/models/users";
import { and } from "drizzle-orm";

export async function DELETE(
  request: Request,
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const docId = searchParams.get("docId");
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
      .where(eq(pitchDocs.id, docId || ""));

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

export async function PATCH(
  req: Request,
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URL(req.url).searchParams;
    const docId = searchParams.get("docId");
    const { isPrivate } = await req.json();

    // Get user by email
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email));

    if (!userResult.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;

    // Verify document exists and belongs to user
    const document = await db
      .select()
      .from(pitchDocs)
      .where(and(eq(pitchDocs.id, docId || ""), eq(pitchDocs.uploadedBy, userId)))
      .limit(1);

    if (!document.length) {
      return NextResponse.json(
        { error: "Document not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update document visibility
    const updated = await db
      .update(pitchDocs)
      .set({
        isPrivate,
      })
      .where(eq(pitchDocs.id, docId || ""))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (err) {
    console.error("PATCH /pitch/founder/documents/[docId] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 