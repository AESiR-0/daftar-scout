import { auth } from "@/auth"; // Ensure correct path
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { daftar } from "@/backend/drizzle/models/daftar";
import { pitch } from "@/backend/drizzle/models/pitch";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch total users per daftar
    const daftarUsers = await db
      .select({ daftarId: daftar.id, userCount: sql<number>`COUNT(*)` })
      .from(users)
      .leftJoin(daftar, sql`${users.email} = ${daftar.id}`)
      .groupBy(daftar.id);

    // Fetch total users per pitch
    const pitchUsers = await db
      .select({ pitchId: pitch.id, userCount: sql<number>`COUNT(*)` })
      .from(users)
      .leftJoin(pitch, sql`${users.email} = ${pitch.id}`)
      .groupBy(pitch.id);

    // Role distribution
    const roleDistribution = await db
      .select({ role: users.role, count: sql<number>`COUNT(*)` })
      .from(users)
      .groupBy(users.role);

    // Profile picture statistics
    const profilePicStats = await db
      .select({
        usersWithProfilePic: sql<number>`COUNT(*) FILTER (WHERE ${users.image} IS NOT NULL)`,
        usersWithoutProfilePic: sql<number>`COUNT(*) FILTER (WHERE ${users.image} IS NULL)`,
      })
      .from(users);

    // Time taken to upload profile picture
    const timeToUploadProfilePic = await db
      .select({
        avgTime: sql<number>`AVG(EXTRACT(EPOCH FROM (${users.createdAt} - ${users.image})))`,
      })
      .from(users)
      .where(sql`${users.image} IS NOT NULL`);

    // Total profile picture changes
    const totalProfilePicChanges = await db
      .select({ totalChanges: sql<number>`SUM(1)` }) // Assuming changes are logged elsewhere
      .from(users);

    // Time between changing profile pictures (Placeholder: Requires log tracking)
    const timeBetweenProfilePicChanges = 0; // This needs to be computed from logs if stored

    // User registration time (On Daftar Since)
    const daftarSince = await db
      .select({
        daftarId: daftar.id,
        earliestUser: sql<Date>`MIN(${users.createdAt})`,
      })
      .from(users)
      .leftJoin(daftar, sql`${users.email} = ${daftar.id}`)
      .groupBy(daftar.id);

    return NextResponse.json({
      daftarUsers,
      pitchUsers,
      roleDistribution,
      profilePictureStats: profilePicStats[0],
      timeToUploadProfilePic: timeToUploadProfilePic[0]?.avgTime ?? null,
      totalProfilePicChanges: totalProfilePicChanges[0]?.totalChanges ?? 0,
      timeBetweenProfilePicChanges,
      daftarSince,
    });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
};
