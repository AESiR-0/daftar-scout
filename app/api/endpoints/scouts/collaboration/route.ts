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
  const { searchParams } = new URL(req.url);
  const scoutId = searchParams.get("scoutId");
  if (!scoutId || scoutId == undefined)
    return NextResponse.json({ error: "scoutId is required" }, { status: 400 });

  const scoutEntries = await db
    .select()
    .from(daftarScouts)
    .where(eq(daftarScouts.scoutId, scoutId));

  return NextResponse.json(scoutEntries);
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
    role: "investor",
    title: `New Scout Collaboration Request`,
    description: `You've been invited to collaborate on scout "${scoutExists[0].scoutName}" by daftar "${daftarExists[0].name}".`,
    targeted_users: targetedUsers,
    payload: {
      action_by: userId,
      action_at: new Date().toISOString(),
      action: "pending",
    },
  });

  return NextResponse.json({ success: true, inserted });
}
