import { auth } from "@/auth";
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Authenticate the user
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await db
      .select({ journal: users.journal })
      .from(users)
      .where(eq(users.email, session.user.email));
    console.log("User fetched:", user);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const journal = user[0].journal;
    return NextResponse.json({ journal }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Authenticate the user
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const journalData = await req.json();
    console.log("Journal data:", journalData);

    const user = await db
      .update(users)
      .set({ journal: journalData.journal })
      .where(eq(users.email, session.user.email));
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Data Updated in journal" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
