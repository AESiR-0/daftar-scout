import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitchDocs } from "@/backend/drizzle/models/pitch";
import { users } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { uploadInvestorPitchDocument } from "@/lib/actions/document";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const scoutId = formData.get("scoutId") as string;
    const pitchId = formData.get("pitchId") as string;
    const isPrivate = formData.get("isPrivate") === "true";

    if (!file || !scoutId || !pitchId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user ID from database
    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email));

    if (!userResult.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const uploadedBy = userResult[0].id;

    // Upload file to storage
    const docUrl = await uploadInvestorPitchDocument(file, scoutId);

    // Insert document record
    const inserted = await db
      .insert(pitchDocs)
      .values({
        pitchId,
        docName: file.name,
        docType: file.type || file.name.split(".").pop() || "unknown",
        docUrl,
        isPrivate,
        size: file.size,
        uploadedBy,
      })
      .returning();

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    console.error("[POST /pitch/investor/documents/upload]", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
} 