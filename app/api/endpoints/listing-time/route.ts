import { auth } from "@/auth"; // Ensure correct path
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { pitch } from "@/backend/drizzle/models/pitch";
import { daftar } from "@/backend/drizzle/models/daftar";
import { scouts } from "@/backend/drizzle/models/scouts"; // Assuming scouts exist
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Prevents Edge runtime issues

export const GET = async () => {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Founder: Time between account creation & first pitch
    const founderTimeToPitch = await db
      .select({
        userId: users.id,
        timeTaken: sql<number>`EXTRACT(EPOCH FROM (MIN(${pitch.createdAt}) - ${users.createdAt}))`,
      })
      .from(users)
      .leftJoin(pitch, sql`${users.id} = ${pitch.id}`)
      .where(sql`${users.role} = 'founder'`)
      .groupBy(users.id);

    // Investor: Time between account creation & first daftar
    const investorTimeToDaftar = await db
      .select({
        userId: users.id,
        timeTaken: sql<number>`EXTRACT(EPOCH FROM (MIN(${daftar.createdAt}) - ${users.createdAt}))`,
      })
      .from(users)
      .leftJoin(daftar, sql`${users.id} = ${daftar.id}`)
      .where(sql`${users.role} = 'investor'`)
      .groupBy(users.id);

    // Investor: Time between account creation & first scout
    const investorTimeToScout = await db
      .select({
        userId: users.id,
        timeTaken: sql<number>`EXTRACT(EPOCH FROM (MIN(${scouts.scoutCreatedAt}) - ${users.createdAt}))`,
      })
      .from(users)
      .leftJoin(scouts, sql`${users.id} = ${scouts.scoutId}`)
      .where(sql`${users.role} = 'investor'`)
      .groupBy(users.id);

    // Daftar: Time between daftar creation & first scout
    const daftarTimeToScout = await db
      .select({
        daftarId: daftar.id,
        timeTaken: sql<number>`EXTRACT(EPOCH FROM (MIN(${scouts.scoutCreatedAt}) - ${daftar.createdAt}))`,
      })
      .from(daftar)
      .leftJoin(scouts, sql`${daftar.id} = ${scouts.scoutId}`)
      .groupBy(daftar.id);

    return NextResponse.json({
      founderTimeToPitch,
      investorTimeToDaftar,
      investorTimeToScout,
      daftarTimeToScout,
    });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
};
