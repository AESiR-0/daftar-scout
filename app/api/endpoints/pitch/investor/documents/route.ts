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

    if (!scoutId) {
      return NextResponse.json(
        { error: "scoutId is required" },
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

    const userId = currentUserWithDaftar[0].id;
    const userDaftarId = currentUserWithDaftar[0].daftarId;

    // Get all documents
    const documents = await db
      .select()
      .from(scoutDocuments)
      .where(eq(scoutDocuments.scoutId, scoutId))
      .execute();
    const pitchDocuments = await db
      .select()
      .from(pitchDocs)
      .where(eq(pitchDocs.pitchId, pitchId ?? ""))
      .execute();
    // Get uploader details with daftar info
    const uploaderIds = [...new Set(documents.map(doc => doc.uploadedBy))].filter(Boolean);
    const uploaders = await db
      .select({
        id: users.id,
        name: users.name,
        lastName: users.lastName,
        daftarId: daftarInvestors.daftarId,
        daftarName: daftar.name
      })
      .from(users)
      .leftJoin(daftarInvestors, eq(users.id, daftarInvestors.investorId))
      .leftJoin(daftar, eq(daftarInvestors.daftarId, daftar.id))
      .where(inArray(users.id, uploaderIds as string[]))
      .execute();
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

    // Map uploader details to documents
    const docsWithUploaders = documents.map(doc => {
      const uploader = uploaders.find(u => u.id === doc.uploadedBy);
      return {
        ...doc,
        uploadedBy: uploader ? {
          id: uploader.id,
          name: uploader.name,
          lastName: uploader.lastName,
          daftarId: uploader.daftarId,
          daftarName: uploader.daftarName
        } : null,
        daftarName: uploader?.daftarName || "Unknown Daftar"
      };
    });
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
    const filteredPitchDocs = pitchDocsWithUploaders.filter(doc => {
      if (doc.isPrivate) {
        return false;
      }
      return true;
    });


    // Filter documents based on visibility and daftarId
    const filteredDocs = docsWithUploaders.filter(doc => {
      if (doc.isPrivate) {
        // Private documents are only visible to users from the same daftar
        return doc.uploadedBy?.daftarId === userDaftarId;
      }
      // Non-private documents are visible to all investors
      return true;
    });

    const allDocs = [...filteredDocs, ...filteredPitchDocs];

    return NextResponse.json(allDocs);
  } catch (error) {
    console.error("[GET /scout-docs]", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
