import { auth } from "@/app/auth";
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { sql } from "drizzle-orm";

export const GET = auth(async (req) => {
  // Get age counts
  const ageCounts = await db
    .select({
      age: sql<number>`EXTRACT(YEAR FROM AGE(${users.dob}))`, // Calculate age
      count: sql<number>`COUNT(*)`,
    })
    .from(users)
    .where(sql`${users.dob} IS NOT NULL`) // Exclude users without DOB
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

  return new Response(JSON.stringify({ ageDistribution: ageGroups }), {
    status: 200,
  });
});
