import { auth } from "@/auth"; // Ensure correct path
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { daftar } from "@/backend/drizzle/models/daftar";
import { scouts } from "@/backend/drizzle/models/scouts"; // Assuming scouts exist
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user statuses
    const userStatus = await db
      .select({
        userId: users.id,
        status: sql<string>`
          CASE 
            WHEN ${users.isActive} = true THEN 'Active' 
            WHEN ${users.archivedOn} IS NOT NULL AND ${users.isActive} = false THEN 'Deleted'
            ELSE 'Hold Deleted Profile'
          END`,
        declaredDate: users.archivedOn,
      })
      .from(users);

    // Fetch daftar statuses
    const daftarStatus = await db
      .select({
        daftarId: daftar.id,
        status: sql<string>`
          CASE 
            WHEN ${daftar.isActive} = true THEN 'Active' 
            WHEN ${daftar.deletedOn} IS NOT NULL AND ${daftar.isActive} = false THEN 'Deleted'
            ELSE 'Hold Deleted Profile'
          END`,
        declaredDate: daftar.deletedOn,
      })
      .from(daftar);

    // Fetch scout statuses
    const scoutStatus = await db
      .select({
        scoutId: scouts.scoutId,
        status: sql<string>`
          CASE 
            WHEN ${scouts.isArchived} = false THEN 'Active' 
            WHEN ${scouts.deletedOn} IS NOT NULL AND ${scouts.isArchived} = true THEN 'Deleted'
            ELSE 'Hold Deleted Profile'
          END`,
        declaredDate: scouts.deletedOn,
      })
      .from(scouts);

    return NextResponse.json({
      userStatus,
      daftarStatus,
      scoutStatus,
    });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
};
