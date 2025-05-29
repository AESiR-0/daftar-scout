import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/backend/database";
import { and, eq } from "drizzle-orm";
import { daftarInvestors } from "@/backend/drizzle/models/daftar";
import { users } from "@/backend/drizzle/models/users";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.email)
    return NextResponse.json({ message: "Unauthorized", status: 401 });

  try {
    const { email, daftarId } = await req.json();

    if (!email || !daftarId) {
      return NextResponse.json(
        { message: "Missing required parameters", status: 400 }
      );
    }

    // First get the user ID from email
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user.length) {
      return NextResponse.json(
        { message: "User not found", status: 404 }
      );
    }

    // Delete the daftarInvestor record
    await db
      .delete(daftarInvestors)
      .where(
        and(
          eq(daftarInvestors.daftarId, daftarId),
          eq(daftarInvestors.investorId, user[0].id)
        )
      );

    return NextResponse.json({
      message: "Member removed successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { message: "Failed to remove member", status: 500 },
      { status: 500 }
    );
  }
} 