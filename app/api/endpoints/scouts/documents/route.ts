import { db } from "@/backend/database";
import { scoutDocuments, daftarScouts } from "@/backend/drizzle/models/scouts";
import { users } from "@/backend/drizzle/models/users";
import { daftarInvestors, daftar } from "@/backend/drizzle/models/daftar";
import { auth } from "@/auth";
import { eq, and, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId");

    if (!scoutId) {
      return NextResponse.json(
        { error: "Scout ID is required" },
        { status: 400 }
      );
    }

    // Fetch scout documents
    const documents = await db
      .select({
        docId: scoutDocuments.docId,
        docType: scoutDocuments.docType,
        docUrl: scoutDocuments.docUrl,
        size: scoutDocuments.size,
        isPrivate: scoutDocuments.isPrivate,
        uploadedAt: scoutDocuments.uploadedAt,
        uploadedBy: scoutDocuments.uploadedBy,
        daftarId: scoutDocuments.daftarId,
      })
      .from(scoutDocuments)
      .where(eq(scoutDocuments.scoutId, scoutId));

    if (!documents.length) {
      return NextResponse.json(
        { message: "No documents found for this scout" },
        { status: 200 }
      );
    }

    // Fetch user details
    const userIds = documents
      .map((doc) => doc.uploadedBy)
      .filter((id): id is string => !!id);
    const usersResult = await db
      .select({
        id: users.id,
        firstName: users.name,
        lastName: users.lastName,
      })
      .from(users)
      .where(inArray(users.id, userIds));

    const userMap = new Map(usersResult.map((user) => [user.id, user]));

    // Fetch daftar name using correct table
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
      daftarResult.map((daftar) => [daftar.id, daftar.name])
    );

    // Combine results
    const response = documents.map((doc) => ({
      docId: doc.docId,
      docType: doc.docType,
      docUrl: doc.docUrl,
      size: doc.size,
      isPrivate: doc.isPrivate,
      uploadedAt: doc.uploadedAt,
      uploadedBy: doc.uploadedBy ? userMap.get(doc.uploadedBy) || null : null,
      daftarName: doc.daftarId ? daftarMap.get(doc.daftarId) || null : null,
    }));

    return NextResponse.json(response, { status: 200 });
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

    const { size, docType, scoutId, daftarId, url, isPrivate } =
      await req.json();

    // 1. Get user by email
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email));

    if (!userResult.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult[0].id;

    // const investorCheck = await db
    //   .select()
    //   .from(daftarInvestors)
    //   .where(
    //     and(
    //       eq(daftarInvestors.investorId, userId),
    //       eq(daftarInvestors.daftarId, daftarId)
    //     )
    //   );

    // if (!investorCheck.length) {
    //   return NextResponse.json(
    //     { error: "User not part of this Daftar" },
    //     { status: 403 }
    //   );
    // }

    const scoutCheck = await db
      .select()
      .from(daftarScouts)
      .where(
        and(
          eq(daftarScouts.scoutId, scoutId),
          eq(daftarScouts.daftarId, daftarId)
        )
      );
    console.log("scoutCheck", scoutCheck);
    if (!scoutCheck.length) {
      return NextResponse.json(
        { error: "Scout not found in this Daftar" },
        { status: 400 }
      );
    }
    await db.insert(scoutDocuments).values({
      scoutId,
      daftarId,
      docUrl: url,
      docType,
      size,
      uploadedBy: userId,
      isPrivate,
      uploadedAt: new Date(),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("POST /scout-documents error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
