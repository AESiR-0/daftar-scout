import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/database";
import { auth } from "@/auth";
import { users } from "@/backend/drizzle/models/users";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { user } = session;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (!user?.email) {
      return NextResponse.json(
        { error: "Invalid user email" },
        { status: 400 }
      );
    }
    const ageCounts = await db
      .select({
        age: sql<number>`EXTRACT(YEAR FROM AGE(${users.dob}))`.as("age"), // Calculate age
        count: sql<number>`COUNT(*)`.as("count"),
      })
      .from(users)
      .groupBy(sql<number>`EXTRACT(YEAR FROM AGE(${users.dob}))`);

    // Initialize age groups
    const ageGroups = {
      "Under 15": 0,
      "Under 20": 0,
      "Under 25": 0,
      "Under 30": 0,
      "Under 45": 0,
      "Under 50": 0,
      "Under 55": 0,
      "Under 60": 0,
      "Under 70": 0,
      "Under 80": 0,
      "Above 80": 0,
    };

    // Categorize users into age groups
    ageCounts.forEach(({ age, count }) => {
      if (age < 15) ageGroups["Under 15"] += count;
      else if (age < 20) ageGroups["Under 20"] += count;
      else if (age < 25) ageGroups["Under 25"] += count;
      else if (age < 30) ageGroups["Under 30"] += count;
      else if (age < 45) ageGroups["Under 45"] += count;
      else if (age < 50) ageGroups["Under 50"] += count;
      else if (age < 55) ageGroups["Under 55"] += count;
      else if (age < 60) ageGroups["Under 60"] += count;
      else if (age < 70) ageGroups["Under 70"] += count;
      else if (age < 80) ageGroups["Under 80"] += count;
      else ageGroups["Above 80"] += count;
    });
    // Return the pitches as JSON
    return NextResponse.json(ageCounts, { status: 200 });
  } catch (error) {
    console.error("Error fetching pitches:", error);
    return NextResponse.json(
      { error: "Failed to fetch pitches" },
      { status: 500 }
    );
  }
}
