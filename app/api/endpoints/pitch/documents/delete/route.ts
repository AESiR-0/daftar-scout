import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitchDocs } from "@/backend/drizzle/models/pitch";
import { eq } from "drizzle-orm";
import { deleteVideoFromS3 } from "@/lib/s3";
import { auth } from "@/auth";

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const docId = searchParams.get("id");
    const pitchId = searchParams.get("pitchId");

    if (!docId || !pitchId) {
      return NextResponse.json(
        { error: "Document ID and Pitch ID are required" },
        { status: 400 }
      );
    }

    // Get the document details first
    const [doc] = await db
      .select()
      .from(pitchDocs)
      .where(eq(pitchDocs.id, docId))
      .limit(1);

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete from S3 if URL exists
    if (doc.docUrl) {
      try {
        const urlParts = doc.docUrl.split('.amazonaws.com/');
        if (urlParts.length === 2) {
          const key = urlParts[1];
          await deleteVideoFromS3("founder", key);
        }
      } catch (error) {
        console.error("Error deleting from S3:", error);
        // Continue with database deletion even if S3 deletion fails
      }
    }

    // Delete from database
    await db
      .delete(pitchDocs)
      .where(eq(pitchDocs.id, docId));

    return NextResponse.json(
      { message: "Document deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
} 