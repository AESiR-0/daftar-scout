import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { pitchDocs, pitch, pitchTeam } from "@/backend/drizzle/models/pitch";
import { users } from "@/backend/drizzle/models/users";
import { eq, and, isNotNull } from "drizzle-orm";
import { auth } from "@/auth";
import { uploadInvestorPitchDocument } from "@/lib/actions/document";
import { createNotification } from "@/lib/notifications/insert";
import { daftarInvestors } from "@/backend/drizzle/models/daftar";
import { scouts } from "@/backend/drizzle/models/scouts";

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

    // Get current user details
    const currentUser = await db
      .select({
        id: users.id,
        name: users.name
      })
      .from(users)
      .where(eq(users.email, session.user.email));

    if (!currentUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const uploadedBy = currentUser[0].id;

    // Get pitch and scout details
    const details = await db
      .select({
        pitchName: pitch.pitchName,
        scoutName: scouts.scoutName,
        daftarId: scouts.daftarId
      })
      .from(pitch)
      .innerJoin(scouts, eq(pitch.scoutId, scouts.scoutId))
      .where(
        and(
          eq(pitch.id, pitchId),
          eq(scouts.scoutId, scoutId)
        )
      )
      .limit(1);

    if (!details.length) {
      return NextResponse.json(
        { error: "Pitch or scout not found" },
        { status: 404 }
      );
    }

    const { pitchName, scoutName, daftarId } = details[0];

    // Check if daftarId is null
    if (!daftarId) {
      return NextResponse.json(
        { error: "Scout's daftar not found" },
        { status: 404 }
      );
    }

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

    // Get all active daftar members
    const daftarMembers = await db
      .select({
        investorId: daftarInvestors.investorId
      })
      .from(daftarInvestors)
      .where(
        and(
          eq(daftarInvestors.daftarId, daftarId),
          eq(daftarInvestors.status, "active"),
          isNotNull(daftarInvestors.investorId)
        )
      );

    // Get pitch team members if the file is not private
    let pitchTeamMembers: { userId: string | null }[] = [];
    if (!isPrivate) {
      pitchTeamMembers = await db
        .select({
          userId: pitchTeam.userId
        })
        .from(pitchTeam)
        .where(
          and(
            eq(pitchTeam.pitchId, pitchId),
            isNotNull(pitchTeam.userId)
          )
        );
    }

    // Prepare notification recipients
    const validDaftarIds = daftarMembers
      .map(member => member.investorId)
      .filter((id): id is string => id !== null);

    const validPitchTeamIds = !isPrivate
      ? pitchTeamMembers
        .map(member => member.userId)
        .filter((id): id is string => id !== null)
      : [];

    // Send notification
    if (validDaftarIds.length > 0) {
      await createNotification({
        type: "updates",
        subtype: "document_uploaded",
        title: "New Document Uploaded",
        description: `${currentUser[0].name} has uploaded ${isPrivate ? "a private" : "a"} document "${file.name}" for "${pitchName}" at "${scoutName}"`,
        role: "investor",
        targeted_users: validDaftarIds,
        payload: {
          pitchId,
          scout_id: scoutId,
          message: `${currentUser[0].name} has uploaded ${isPrivate ? "a private" : "a"} document "${file.name}" for "${pitchName}" at "${scoutName}"`
        }
      });
    }

    // Send notification to pitch team members if the file is not private
    if (!isPrivate && validPitchTeamIds.length > 0) {
      await createNotification({
        type: "updates",
        subtype: "document_uploaded",
        title: "New Document Available",
        description: `${currentUser[0].name} has uploaded a document "${file.name}" for your pitch "${pitchName}" at "${scoutName}"`,
        role: "founder",
        targeted_users: validPitchTeamIds,
        payload: {
          pitchId,
          scout_id: scoutId,
          message: `${currentUser[0].name} has uploaded a document "${file.name}" for your pitch "${pitchName}" at "${scoutName}"`
        }
      });
    }

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    console.error("[POST /pitch/investor/documents/upload]", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
} 