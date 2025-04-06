import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import {
  daftar,
  daftarInvestors,
  daftarStructure,
} from "@/backend/drizzle/models/daftar";
import { structure } from "@/backend/drizzle/models/daftar";
import { users } from "@/backend/drizzle/models/users";
import { auth } from "@/auth";
import { eq, inArray } from "drizzle-orm";

// Function to generate a unique alphanumeric daftarId
async function generateDaftarId(name: string): Promise<string> {
  const prefix = name
    .slice(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "X"); // Take first 3 letters, uppercase, replace non-letters with X
  let daftarId: string = "";
  let isUnique = false;

  while (!isUnique) {
    const randomNum = Math.floor(100 + Math.random() * 900); // 3-digit random number (100-999)
    daftarId = `${prefix}${randomNum}`;

    // Check if the generated daftarId already exists
    const existingDaftar = await db
      .select()
      .from(daftar)
      .where(eq(daftar.id, daftarId))
      .limit(1)
      .execute();
    isUnique = existingDaftar.length === 0;
  }

  return daftarId;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = session;
    if (!user?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Get user from DB
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1);

    if (!dbUser.length) {
      return NextResponse.json({ error: "DB User not found" }, { status: 404 });
    }

    const currentUser = dbUser[0];

    // 2. Get all daftarInvestors entries where investorId = current user ID
    const investorEntries = await db
      .select({
        daftarId: daftarInvestors.daftarId,
      })
      .from(daftarInvestors)
      .where(eq(daftarInvestors.investorId, currentUser.id));

    const daftarIds = investorEntries
      .map((entry) => entry.daftarId)
      .filter((id): id is string => id !== null);

    if (daftarIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // 3. Get daftar entries by IDs
    const daftars = await db
      .select({
        id: daftar.id,
        name: daftar.name,
        description: daftar.bigPicture,
      })
      .from(daftar)
      .where(inArray(daftar.id, daftarIds));

    return NextResponse.json(daftars, { status: 200 });
  } catch (error) {
    console.error("GET /api/daftar error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daftar entries" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = session;
    if (!user || !user.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1);

    if (!dbUser.length) {
      return NextResponse.json({ error: "DB User not found" }, { status: 404 });
    }

    const currentUser = dbUser[0];
    const data = await req.json();

    const requiredFields = ["name", "structure", "bigPicture", "location"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Generate unique daftarId
    const daftarId = await generateDaftarId(data.name);

    // Insert into daftar
    await db.insert(daftar).values({
      id: daftarId,
      name: data.name,
      profileUrl: data.profileUrl || null,
      structure: data.structure, // Store structure name for quick access
      website: data.website || null,
      type: data.type || null,
      bigPicture: data.bigPicture,
      location: data.location,
      createdAt: new Date(),
    });

    // Insert or find structure by name
    let structureEntry = await db
      .select()
      .from(structure)
      .where(eq(structure.name, data.structure))
      .limit(1);

    let structureId: number;
    if (structureEntry.length > 0) {
      structureId = structureEntry[0].id;
    } else {
      const inserted = await db
        .insert(structure)
        .values({
          name: data.structure,
          createdAt: new Date(),
          createdBy: currentUser.id,
        })
        .returning();
      structureId = inserted[0].id;
    }

    // Link structure to daftar
    await db.insert(daftarStructure).values({
      daftarId,
      structureId,
    });

    // Add user to daftarInvestors
    await db.insert(daftarInvestors).values({
      daftarId,
      investorId: currentUser.id,
      status: "active",
      designation: data.designation || "Member",
      joinType: "creator",
      joinDate: new Date(),
    });

    return NextResponse.json(
      { message: "Daftar created and linked successfully", daftarId },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/daftar error:", error);
    return NextResponse.json(
      { error: "Failed to create daftar entry" },
      { status: 500 }
    );
  }
}
