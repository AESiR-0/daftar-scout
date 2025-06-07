import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database"; // your Drizzle instance
import { scoutDocuments } from "@/backend/drizzle/models/scouts";
import { users } from "@/backend/drizzle/models/users";
import { daftarInvestors, daftar } from "@/backend/drizzle/models/daftar";
import { eq, inArray, and, not } from "drizzle-orm";
import { auth } from "@/auth"; // your auth function
import { pitchDocs } from "@/backend/drizzle/models/pitch";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  daftarId: string;
}

interface Document {
  id: string;
  docName: string;
  docType: string;
  docUrl: string;
  isPrivate: boolean;
  uploadedBy: string;
  uploadedAt: Date;
  scoutId: string;
  pitchId: string;
  daftarId: string;
  visibility: "private" | "investors_only";
  accessLevel: "investor" | "founder";
}

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

    // Get user details
    const userDetails = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email ?? ""))
      .execute();

    if (!userDetails.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const uploadedBy = userDetails[0].id;
    const body = await req.json();
    const {
      docName,
      docType,
      docUrl,
      isPrivate,
      scoutId,
      pitchId,
      daftarId,
      size
    } = body;

    if (!docName || !docType || !docUrl || !uploadedBy || !scoutId || !pitchId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const doc = {
      docName,
      docType,
      docUrl,
      size,
      uploadedBy,
      scoutId,
      pitchId,
      daftarId,
      visibility: isPrivate ? "private" : "investors_only",
      accessLevel: "investor",
      uploadedAt: new Date()
    };

    const inserted = await db
      .insert(scoutDocuments)
      .values(doc)
      .returning();

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    console.error("[POST /scout-docs]", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

// GET: Fetch documents based on visibility and access
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId");
    const pitchId = searchParams.get("pitchId");

    if (!scoutId || !pitchId) {
      return NextResponse.json(
        { error: "scoutId and pitchId are required" },
        { status: 400 }
      );
    }

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user's details and daftar info
    const currentUserWithDaftar = await db
      .select({
        id: users.id,
        name: users.name,
        daftarId: daftarInvestors.daftarId,
        daftarName: daftar.name
      })
      .from(users)
      .leftJoin(daftarInvestors, eq(users.id, daftarInvestors.investorId))
      .leftJoin(daftar, eq(daftarInvestors.daftarId, daftar.id))
      .where(eq(users.email, session.user.email))
      .execute();

    if (!currentUserWithDaftar.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get pitch documents (from founders)
    const pitchDocuments = await db
      .select()
      .from(pitchDocs)
      .where(eq(pitchDocs.pitchId, pitchId))
      .execute();

    // Get uploader details for pitch documents
    const pitchUploaderIds = [...new Set(pitchDocuments.map(doc => doc.uploadedBy))].filter((id): id is string => id !== null);
    const pitchUploaders = await db
      .select({
        id: users.id,
        name: users.name,
        lastName: users.lastName
      })
      .from(users)
      .where(inArray(users.id, pitchUploaderIds))
      .execute();

    // Map uploader details to pitch documents
    const pitchDocsWithUploaders = pitchDocuments.map(doc => {
      const uploader = pitchUploaders.find(u => u.id === doc.uploadedBy);
      return {
        ...doc,
        uploadedBy: uploader ? {
          id: uploader.id,
          name: uploader.name,
          lastName: uploader.lastName
        } : null
      };
    });

    // Filter out private pitch documents
    const filteredPitchDocs = pitchDocsWithUploaders.filter(doc => !doc.isPrivate);

    return NextResponse.json(filteredPitchDocs);
  } catch (error) {
    console.error("[GET /scout-docs]", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
