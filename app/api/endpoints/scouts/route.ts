import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { scouts } from "@/backend/drizzle/models/scouts";
import { eq } from "drizzle-orm";


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

export async function GET() {
  const allScouts = await db.select().from(scouts);
  return NextResponse.json(allScouts);
}

  export async function POST(req: NextRequest) {
    try {
      // Parse the request body
      const body = await req.json();
  
      // Extract and validate required fields
      const {
        scoutName,
        daftarId,
        investorId,
      } = body;

      const scoutId = await generateScoutId(scoutName)
  
      // Insert the new scout into the database
      const newScout = await db
        .insert(scouts)
        .values({
          scoutId: scoutId,
          scoutName: scoutName,
          scoutCreatedAt: new Date(),
          daftarId: daftarId || null,
        })
        .returning();
  
      return NextResponse.json(
        { message: "Scout created successfully", data: newScout[0] },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error creating scout:", error);
    }
  }

