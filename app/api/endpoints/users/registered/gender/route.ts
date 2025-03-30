import { auth } from "@/auth";
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { eq, sql } from "drizzle-orm";

export const GET = auth(async function GET(req) {
  const genderCounts = await db
    .select({
      gender: users.gender,
      count: sql<number>`COUNT(*)`,
    })
    .from(users)
    .groupBy(users.gender);

  const result = genderCounts.reduce(
    (acc, item) => {
      const genderKey = (item?.gender as keyof typeof acc) || "male";
      acc[genderKey] = item.count;
      return acc;
    },
    { male: 0, female: 0, trans: 0, others: 0 }
  );

  return new Response(JSON.stringify(result), { status: 200 });
});
