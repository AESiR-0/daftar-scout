import { db } from "@/backend/database";
import { daftarScouts } from "@/backend/drizzle/models/scouts";
import { scouts } from "@/backend/drizzle/models/scouts";
import { daftar, daftarInvestors } from "@/backend/drizzle/models/daftar";
import { users } from "@/backend/drizzle/models/users";
import { eq, and, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createNotification } from "@/lib/notifications/insert";

export async function POST(req: NextRequest) {
  // Get session and user
  const session = await auth();
  const userEmail = session?.user?.email;
  if (!userEmail)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch current user details
  const userDetails = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.name,
      lastName: users.lastName,
      profileUrl: users.image,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.email, userEmail))
    .limit(1);

  if (!userDetails[0])
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Parse request body
  const body = await req.json();
  const { scoutId, daftarId, action } = body;

  if (!scoutId || !daftarId || !action) {
    return NextResponse.json(
      { error: "scoutId, daftarId, and action are required" },
      { status: 400 }
    );
  }

  if (!["accept", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return await processCollaborationAction(scoutId, daftarId, action, userDetails[0]);
}

export async function GET(req: NextRequest) {
  // Get session and user
  const session = await auth();
  const userEmail = session?.user?.email;
  if (!userEmail)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch current user details
  const userDetails = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.name,
      lastName: users.lastName,
      profileUrl: users.image,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.email, userEmail))
    .limit(1);

  if (!userDetails[0])
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Parse query parameters
  const { searchParams } = new URL(req.url);
  const scoutId = searchParams.get("scoutId");
  const daftarId = searchParams.get("daftarId");
  const action = searchParams.get("action");

  if (!scoutId || !daftarId || !action) {
    return NextResponse.json(
      { error: "scoutId, daftarId, and action are required" },
      { status: 400 }
    );
  }

  if (!["accept", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const result = await processCollaborationAction(scoutId, daftarId, action, userDetails[0]);
  
  // If successful, redirect to scout page
  if (result.status === 200) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/investor/scout`);
  }
  
  return result;
}

async function processCollaborationAction(
  scoutId: string,
  daftarId: string,
  action: string,
  userDetails: any
) {
  // Check if the collaboration request exists and is pending
  const collaboration = await db
    .select({
      id: daftarScouts.id,
      isPending: daftarScouts.isPending,
    })
    .from(daftarScouts)
    .where(
      and(
        eq(daftarScouts.scoutId, scoutId),
        eq(daftarScouts.daftarId, daftarId),
        eq(daftarScouts.isPending, true)
      )
    )
    .limit(1);

  if (!collaboration[0]) {
    return NextResponse.json(
      { error: "Collaboration request not found or already processed" },
      { status: 404 }
    );
  }

  // Fetch scout and daftar details for notification
  const scoutDetails = await db
    .select({ scoutName: scouts.scoutName })
    .from(scouts)
    .where(eq(scouts.scoutId, scoutId))
    .limit(1);

  const daftarDetails = await db
    .select({ name: daftar.name })
    .from(daftar)
    .where(eq(daftar.id, daftarId))
    .limit(1);

  if (!scoutDetails[0] || !daftarDetails[0]) {
    return NextResponse.json(
      { error: "Scout or Daftar not found" },
      { status: 404 }
    );
  }

  await db
    .update(daftarScouts)
    .set({
      isPending: false,
    })
    .where(eq(daftarScouts.id, collaboration[0].id));

  if (action === "reject") {
    // Optionally delete the collaboration entry on reject
    await db
      .delete(daftarScouts)
      .where(eq(daftarScouts.id, collaboration[0].id));
  }

  // Fetch all daftars part of the scout

  // Get all daftarIds linked to this scout
  const relatedDaftars = await db
    .select({ daftarId: daftarScouts.daftarId })
    .from(daftarScouts)
    .where(eq(daftarScouts.scoutId, scoutId));
  // Extract unique daftar IDs
  const uniqueDaftarIds = Array.from(
    new Set(relatedDaftars.map((d) => d.daftarId))
  );

  const relatedInvestors = await db
    .select({ investorId: daftarInvestors.investorId })
    .from(daftarInvestors)
    .where(
      inArray(
        daftarInvestors.daftarId,
        uniqueDaftarIds.filter(
          (id): id is string => id !== null && id !== undefined
        )
      )
    );

  const targetedInvestorIds = Array.from(
    new Set(relatedInvestors.map((i) => i.investorId))
  ).filter((id): id is string => id !== null);

  // Send notification to all related investors instead of sending emails directly
  for (const investorId of targetedInvestorIds) {
    try {
      await createNotification({
        type: "updates",
        subtype: "collaboration",
        title: "Scout Collaboration Response",
        description: `${userDetails.firstName || 'User'} has ${action}ed the collaboration request for scout ${scoutDetails[0].scoutName} in daftar ${daftarDetails[0].name}.`,
        targeted_users: [investorId],
        payload: {
          scoutName: scoutDetails[0].scoutName,
          daftarName: daftarDetails[0].name,
          action: action,
          responderName: userDetails.firstName || 'User',
        },
      });
    } catch (error) {
      console.error(`Error creating notification for investor ${investorId}:`, error);
    }
  }

  return NextResponse.json({
    success: true,
    user: userDetails,
    action,
  });
}
