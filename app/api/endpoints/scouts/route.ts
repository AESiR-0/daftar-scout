import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import {
  daftarScouts,
  scouts,
  scoutApproved,
} from "@/backend/drizzle/models/scouts";
import { eq, inArray, or, not, and, sql } from "drizzle-orm";
import { auth } from "@/auth"; // Assuming you have an auth utility
import { users } from "@/backend/drizzle/models/users"; // Assuming you have a users table
import { daftar, daftarInvestors } from "@/backend/drizzle/models/daftar"; // Assuming you have an investordaftar table

async function generateScoutId(scoutName: string): Promise<string> {
  const prefix = scoutName.slice(0, 3).toLowerCase();
  let scoutId: string = "";
  let isUnique = false;

  while (!isUnique) {
    const randomNum = Math.floor(100 + Math.random() * 900);
    scoutId = `${prefix}${randomNum}`;

    // Check if the generated scoutId already exists in the database
    const existingScout = await db
      .select()
      .from(scouts)
      .where(eq(scouts.scoutId, scoutId))
      .limit(1)
      .execute();
    isUnique = existingScout.length === 0;
  }

  return scoutId;
}

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user's role based on their email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)
      .execute();

    if (!user.length) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userRole = user[0].role;
    const investorId = user[0].id;
    // Fetch the daftarId associated with the investorId from the investordaftar table

    let scoutsList,
      collaboratorsList: { daftarName: string; scoutId: string | null }[];

    if (userRole === "founder") {
      // If the user is a founder, fetch all scouts
      scoutsList = await db
        .select({
          id: scouts.scoutId,
          title: scouts.scoutName,
          status: scouts.status,
          scheduledDate: scouts.lastDayToPitch,
          postedBy: scouts.daftarId,
        })
        .from(scouts)
        .where(sql`LOWER(${scouts.status}) = 'active'`);
    } else {
      const investordaftar = await db
        .select()
        .from(daftarInvestors) // Replace with the actual table name if different
        .where(eq(daftarInvestors.investorId, investorId));

      if (!investordaftar.length) {
        return NextResponse.json(
          { message: "Daftar ID not found" },
          { status: 404 }
        );
      }

      const daftarId = investordaftar[0].daftarId;
      // If the user is not a founder, fetch scouts related to their daftarId
      scoutsList = await db
        .select({
          id: scouts.scoutId,
          title: scouts.scoutName,
          status: scouts.status,
          scheduledDate: scouts.lastDayToPitch,
          postedBy: scouts.daftarId,
        })
        .from(scouts)
        .where(daftarId ? eq(scouts.daftarId, daftarId) : undefined);
    }

    const collaboratorId = await db
      .select({
        daftarId: daftarScouts.daftarId,
        scoutId: daftarScouts.scoutId,
      })
      .from(daftarScouts)
      .where(
        inArray(
          daftarScouts.scoutId,
          scoutsList.map((s) => s.id).filter((id): id is string => id !== null)
        )
      );
    if (collaboratorId.length === 0)
      return NextResponse.json(scoutsList, { status: 200 });

    collaboratorsList = await db
      .select({
        daftarName: daftar.name,
        scoutId: daftarScouts.scoutId,
      })
      .from(daftar)
      .innerJoin(daftarScouts, eq(daftar.id, daftarScouts.daftarId))
      .where(
        inArray(
          daftar.id,
          collaboratorId
            .map((c) => c.daftarId)
            .filter((id): id is string => id !== null)
        )
      );
    const scoutsAll = scoutsList.map((scout) => {
      const collaborators =
        collaboratorsList
          ?.filter((collaborator) => collaborator.scoutId === scout.id)
          .map((collaborator) => collaborator.daftarName) || [];

      return {
        id: scout.id,
        title: scout.title,
        postedby: scout.postedBy,
        status: scout.status,
        scheduledDate: scout.scheduledDate,
        collaborator: collaborators,
      };
    });

    return NextResponse.json(scoutsAll, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching scouts:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scoutName, daftarId } = body;

    const scoutId = await generateScoutId(scoutName);

    // Insert the new scout
    const newScout = await db
      .insert(scouts)
      .values({
        scoutId,
        scoutName,
        daftarId: daftarId,
      })
      .returning();

    // Link scout to daftar
    await db.insert(daftarScouts).values({
      scoutId,
      daftarId,
    });

    // Fetch all investors for the given daftarId
    const daftarMembers = await db
      .select({ investorId: daftarInvestors.investorId })
      .from(daftarInvestors)
      .where(eq(daftarInvestors.daftarId, daftarId));

    // Insert all members into scoutApproved
    if (daftarMembers.length > 0) {
      const approvedInserts = daftarMembers.map((member) => ({
        scoutId,
        investorId: member.investorId,
        isApproved: null,
        approvedAt: null,
      }));

      await db.insert(scoutApproved).values(approvedInserts);
    }

    return NextResponse.json(
      { message: "Scout created successfully", data: newScout[0] },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error creating scout", error: error.message },
      { status: 500 }
    );
  }
}
