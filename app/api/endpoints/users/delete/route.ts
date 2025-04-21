import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;

    // Update user record
    const updatedUser = await db
      .update(users)
      .set({
        isActive: false,
        isArchived: true,
        archivedOn: new Date(),
      })
      .where(eq(users.email, email))
      .returning({
        id: users.id,
        email: users.email,
        isActive: users.isActive,
        isArchived: users.isArchived,
        archivedOn: users.archivedOn,
      });

    if (updatedUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "User account archived successfully",
        data: updatedUser[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error archiving user:", error);
    return NextResponse.json(
      { error: "Failed to archive user" },
      { status: 500 }
    );
  }
}
