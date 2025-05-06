import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitchDocs } from "@/backend/drizzle/models/pitch";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { deleteFounderPitchDocument } from "@/lib/actions/document";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
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
      .where(eq(pitchDocs.id, id));

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete from storage first
    if (doc.docUrl) {
      await deleteFounderPitchDocument(doc.docUrl);
    }

    // Delete from database
    await db.delete(pitchDocs).where(eq(pitchDocs.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /pitch/investor/documents/[id]]", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
} 