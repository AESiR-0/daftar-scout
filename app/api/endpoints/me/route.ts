// /api/user/profile/route.ts
import { db } from "@/backend/database"; // Your Drizzle DB instance
import {
  users,
  userLanguages,
  languages,
} from "@/backend/drizzle/models/users";
import { auth } from "@/auth";
import { eq, inArray, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Get user basic info
    const [user] = await db.select().from(users).where(eq(users.email, session.user.email));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get language info for the user
    const userLangs = await db
      .select({ 
        id: languages.id,
        name: languages.language_name 
      })
      .from(userLanguages)
      .innerJoin(languages, eq(userLanguages.languageId, languages.id))
      .where(eq(userLanguages.userId, user.id));

    return NextResponse.json({
      firstName: user.name,
      lastName: user.lastName,
      image: user.image,
      email: user.email,
      phone: `${user.countryCode || ""}${user.number || ""}`,
      gender: user.gender,
      dateOfBirth: user.dob || null,
      languages: userLangs.map((l) => ({ id: l.id, name: l.name })),
      joinedDate: user.createdAt.toDateString(),
    });
  } catch (err) {
    console.error("GET /user/profile error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const {
    email,
    firstName,
    lastName,
    gender,
    dateOfBirth,
    phone,
    languages: languageIds = [], // Now expecting array of language IDs
    image,
  } = body;

  if (!email) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  try {
    // Extract phone number and code
    let countryCode = null;
    let number = null;
    if (phone?.startsWith("+")) {
      const match = phone.match(/^(\+\d{1,4})\s?(.*)$/);
      if (match) {
        countryCode = match[1];
        number = match[2].trim();
      }
    }

    // Update user info
    await db
      .update(users)
      .set({
        name: firstName,
        lastName,
        gender,
        dob: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
        countryCode,
        number,
        image,
        lastChangeOfPitcture: image ? new Date() : undefined,
      })
      .where(eq(users.email, email));

    // Get user ID
    const [user] = await db.select().from(users).where(eq(users.email, email));
    const userId = user.id;

    // Delete existing userLanguages
    await db.delete(userLanguages).where(eq(userLanguages.userId, userId));

    // Insert new userLanguages
    if (languageIds.length > 0) {
      await db.insert(userLanguages).values(
        languageIds.map((id: string) => ({
          userId,
          languageId: id,
        }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /user/profile error", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
