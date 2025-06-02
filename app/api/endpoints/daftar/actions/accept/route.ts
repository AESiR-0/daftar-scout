import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { daftarInvestors } from "@/backend/drizzle/models/daftar";
import { users } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get('mail');

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get user ID from email
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update the status to active for all pending invites for this user
    await db
      .update(daftarInvestors)
      .set({ status: "active" })
      .where(eq(daftarInvestors.investorId, user.id));

    return NextResponse.json(
      { message: "Successfully accepted daftar invitation" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error accepting daftar invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept daftar invitation" },
      { status: 500 }
    );
  }
} 