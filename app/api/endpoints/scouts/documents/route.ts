import { db } from "@/backend/database";
import { scoutDocuments, daftarScouts } from "@/backend/drizzle/models/scouts";
import { users } from "@/backend/drizzle/models/users";
import { daftarInvestors, daftar } from "@/backend/drizzle/models/daftar";
import { auth } from "@/auth";
import { eq, and, inArray, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId");
    const daftarId = searchParams.get("daftarId");

    if (!scoutId || !daftarId) {
      return NextResponse.json(
        { error: "Scout ID and Daftar ID are required" },
        { status: 400 }
      );
    }

    // Get current user's daftar ID
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email));

    if (!userResult.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userDaftarInfo = await db
      .select({
        daftarId: daftarInvestors.daftarId,
      })
      .from(daftarInvestors)
      .where(eq(daftarInvestors.investorId, userResult[0].id))
      .limit(1);

    if (!userDaftarInfo.length || !userDaftarInfo[0].daftarId) {
      return NextResponse.json({ error: "User not in any daftar" }, { status: 404 });
    }

    const userDaftarId = userDaftarInfo[0].daftarId;

    // Fetch documents with visibility rules:
    // 1. Public documents (isPrivate = false)
    // 2. Private documents from the requested daftar
    const documents = await db
      .select({
        docId: scoutDocuments.docId,
        docName: scoutDocuments.docName,
        docType: scoutDocuments.docType,
        docUrl: scoutDocuments.docUrl,
        size: scoutDocuments.size,
        isPrivate: scoutDocuments.isPrivate,
        uploadedAt: scoutDocuments.uploadedAt,
        uploadedBy: scoutDocuments.uploadedBy,
        daftarId: scoutDocuments.daftarId,
      })
      .from(scoutDocuments)
      .where(
        and(
          eq(scoutDocuments.scoutId, scoutId),
          or(
            eq(scoutDocuments.isPrivate, false),
            and(
              eq(scoutDocuments.isPrivate, true),
              eq(scoutDocuments.daftarId, daftarId)
            )
          )
        )
      );

    // Fetch user details for the documents
    const userIds = documents
      .map((doc) => doc.uploadedBy)
      .filter((id): id is string => !!id);

    const usersResult = await db
      .select({
        id: users.id,
        firstName: users.name,
        lastName: users.lastName,
        role: users.role,
      })
      .from(users)
      .where(inArray(users.id, userIds));

    const userMap = new Map(usersResult.map((user) => [user.id, user]));

    // Fetch daftar names
    const daftarIds = [...new Set(documents.map((doc) => doc.daftarId))].filter(
      (id): id is string => id !== null
    );
    const daftarResult = await db
      .select({
        id: daftar.id,
        name: daftar.name,
      })
      .from(daftar)
      .where(inArray(daftar.id, daftarIds));

    const daftarMap = new Map(
      daftarResult.map((daftar) => [daftar.id, daftar])
    );

    // Categorize documents
    const sent: any[] = [];
    const received: any[] = [];
    const privateDocs: any[] = [];

    documents.forEach((doc) => {
      const uploader = doc.uploadedBy ? userMap.get(doc.uploadedBy) : undefined;
      const baseDoc = {
        id: doc.docId,
        docName: doc.docName,
        docType: doc.docType || "regular",
        docUrl: doc.docUrl && doc.docUrl.startsWith('undefined/')
          ? `${process.env.CLOUDFRONT_DOMAIN}/${doc.docUrl.slice('undefined/'.length)}`
          : doc.docUrl,
        size: doc.size,
        isPrivate: doc.isPrivate,
        uploadedAt: doc.uploadedAt,
        uploadedBy: doc.uploadedBy
          ? {
              id: doc.uploadedBy,
              firstName: uploader?.firstName,
              lastName: uploader?.lastName,
              role: uploader?.role,
            }
          : null,
        daftar: doc.daftarId
          ? {
              id: doc.daftarId,
              name: daftarMap.get(doc.daftarId)?.name || "Unknown Daftar",
            }
          : null,
        isUploadedByCurrentUser: doc.uploadedBy === userResult[0].id,
      };
      if (doc.uploadedBy === userResult[0].id) {
        sent.push(baseDoc);
      } else if (uploader?.role === "investor" && doc.isPrivate) {
        privateDocs.push(baseDoc);
      } else {
        received.push(baseDoc);
      }
    });

    return NextResponse.json({ sent, received, private: privateDocs }, { status: 200 });
  } catch (err) {
    console.error("GET /scout-documents error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { size, docType, scoutId, daftarId, url, docName, isPrivate } =
      await req.json();

    if (!scoutId || !docName || !docType || !url || !daftarId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user by email
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email));

    if (!userResult.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;

    // Verify scout belongs to daftar
    const scoutCheck = await db
      .select()
      .from(daftarScouts)
      .where(
        and(
          eq(daftarScouts.scoutId, scoutId),
          eq(daftarScouts.daftarId, daftarId)
        )
      );

    if (!scoutCheck.length) {
      return NextResponse.json(
        { error: "Scout not found in this Daftar" },
        { status: 400 }
      );
    }

    // Insert document
    const inserted = await db
      .insert(scoutDocuments)
      .values({
        docName,
        scoutId,
        daftarId,
        docUrl: url,
        docType,
        size,
        uploadedBy: userId,
        isPrivate,
      })
      .returning();

    // Fetch complete document info with user and daftar details
    const completeDoc = await db
      .select({
        doc: scoutDocuments,
        user: users,
        daftarInfo: daftar,
      })
      .from(scoutDocuments)
      .leftJoin(users, eq(scoutDocuments.uploadedBy, users.id))
      .leftJoin(daftar, eq(scoutDocuments.daftarId, daftar.id))
      .where(eq(scoutDocuments.docId, inserted[0].docId))
      .limit(1);

    if (!completeDoc.length) {
      return NextResponse.json(inserted[0], { status: 201 });
    }

    const { doc, user, daftarInfo } = completeDoc[0];

    const response = {
      id: doc.docId,
      docName: doc.docName,
      docType: doc.docType,
      docUrl: doc.docUrl,
      size: doc.size,
      isPrivate: doc.isPrivate,
      uploadedAt: doc.uploadedAt,
      uploadedBy: user
        ? {
          id: user.id,
          firstName: user.name,
          lastName: user.lastName,
        }
        : null,
      daftar: daftarInfo
        ? {
          id: daftarInfo.id,
          name: daftarInfo.name,
        }
        : null,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("POST /scout-documents error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get docId from query params
    const { searchParams } = new URL(req.url);
    const docId = searchParams.get("docId");
    
    if (!docId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Get user's daftar ID
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!userResult.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's daftar
    const userDaftarInfo = await db
      .select({
        daftarId: daftarInvestors.daftarId,
      })
      .from(daftarInvestors)
      .where(eq(daftarInvestors.investorId, userResult[0].id))
      .limit(1);

    if (!userDaftarInfo.length || !userDaftarInfo[0].daftarId) {
      return NextResponse.json(
        { error: "User not in any daftar" },
        { status: 404 }
      );
    }

    // Get document to verify ownership
    const document = await db
      .select()
      .from(scoutDocuments)
      .where(eq(scoutDocuments.docId, docId))
      .limit(1);

    if (!document.length) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Verify user has permission to delete (same daftar or document owner)
    const canDelete =
      document[0].daftarId === userDaftarInfo[0].daftarId ||
      document[0].uploadedBy === userResult[0].id;

    if (!canDelete) {
      return NextResponse.json(
        { error: "Not authorized to delete this document" },
        { status: 403 }
      );
    }

    // Delete the document
    await db
      .delete(scoutDocuments)
      .where(eq(scoutDocuments.docId, docId));

    return NextResponse.json(
      { message: "Document deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /scout-documents error:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
