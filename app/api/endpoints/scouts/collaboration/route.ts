// app/api/daftar-scouts/route.ts
import { db } from "@/backend/database";
import { scouts } from "@/backend/drizzle/models/scouts";
import { daftarScouts } from "@/backend/drizzle/models/scouts";
import { daftar, daftarInvestors } from "@/backend/drizzle/models/daftar";
import { eq } from "drizzle-orm";
import { users } from "@/backend/drizzle/models/users";
import { NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications/insert";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scoutId = searchParams.get("scoutId");
    if (!scoutId || scoutId == undefined)
      return NextResponse.json({ error: "scoutId is required" }, { status: 400 });

    // Get the user's daftarId
    const userDaftar = await db
      .select({ daftarId: daftarInvestors.daftarId })
      .from(users)
      .leftJoin(daftarInvestors, eq(users.id, daftarInvestors.investorId))
      .where(eq(users.email, userEmail))
      .limit(1);

    const currentDaftarId = userDaftar[0]?.daftarId;

    const scoutEntries = await db
      .select({
        id: daftarScouts.id,
        daftarId: daftarScouts.daftarId,
        isPending: daftarScouts.isPending,
        createdAt: daftarScouts.addedAt,
        daftarName: daftar.name,
        daftarStructure: daftar.structure,
        daftarWebsite: daftar.website,
        daftarLocation: daftar.location,
        daftarBigPicture: daftar.bigPicture,
      })
      .from(daftarScouts)
      .leftJoin(daftar, eq(daftarScouts.daftarId, daftar.id))
      .where(eq(daftarScouts.scoutId, scoutId));

    // Filter out the current user's daftar

    // Ensure all fields have default values if null
    const sanitizedEntries = scoutEntries.map(entry => ({
      id: entry.id || '',
      daftarId: entry.daftarId || '',
      isPending: entry.isPending ?? true,
      createdAt: entry.createdAt || new Date().toISOString(),
      daftarName: entry.daftarName || '',
      daftarStructure: entry.daftarStructure || '',
      daftarWebsite: entry.daftarWebsite || '',
      daftarLocation: entry.daftarLocation || '',
      daftarBigPicture: entry.daftarBigPicture || '',
    }));

    return NextResponse.json(sanitizedEntries);
  } catch (error) {
    console.error('Error in GET /api/endpoints/scouts/collaboration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userEmail = session?.user?.email; // Assuming user ID is available in session
  if (!userEmail)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userIdList = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, userEmail))
    .limit(1);
  if (!userIdList.length) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const userId = userIdList[0].id;

  const body = await req.json();
  const { scoutId, daftarId } = body;

  if (!scoutId || !daftarId) {
    return NextResponse.json(
      { error: "scoutId and daftarId are required" },
      { status: 400 }
    );
  }

  // Check if the scout exists
  const scoutExists = await db
    .select({ scoutId: scouts.scoutId, scoutName: scouts.scoutName })
    .from(scouts)
    .where(eq(scouts.scoutId, scoutId));

  if (scoutExists.length === 0) {
    return NextResponse.json({ error: "Invalid scoutId" }, { status: 404 });
  }

  // Check if the daftar exists
  const daftarExists = await db
    .select({ id: daftar.id, name: daftar.name })
    .from(daftar)
    .where(eq(daftar.id, daftarId));

  if (daftarExists.length === 0) {
    return NextResponse.json({ error: "Invalid daftarId" }, { status: 404 });
  }

  // Get users in the daftar
  const daftarUsersList = await db
    .select({ userId: daftarInvestors.investorId })
    .from(daftarInvestors)
    .where(eq(daftarInvestors.daftarId, daftarId));

  const targetedUsers = daftarUsersList
    .map((user) => user.userId)
    .filter((userId): userId is string => userId !== null);
  console.log(targetedUsers);
  // Insert into daftar_scouts
  const inserted = await db.insert(daftarScouts).values({
    scoutId,
    daftarId,
    isPending: true,
  });

  // Create notification for each user in the daftar
  await createNotification({
    type: "request",
    subtype: "collaboration",
    role: "investor",
    title: `New Scout Collaboration Request`,
    description: `You've been invited to collaborate on scout "${scoutExists[0].scoutName}" by daftar "${daftarExists[0].name}".`,
    targeted_users: targetedUsers,
    payload: {
      action_by: userId,
      action_at: new Date().toISOString(),
      action: "pending",
      scoutName: scoutExists[0].scoutName,
      daftarName: daftarExists[0].name,
    },
  });

  return NextResponse.json({ success: true, inserted });
}
