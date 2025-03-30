import { auth } from "@/auth";
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";
import { eq, sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }
    const { user } = session;
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }
    if (!user?.email) {
      return new Response(JSON.stringify({ error: "Invalid user email" }), {
        status: 400,
      });
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    return new Response(JSON.stringify({ error: "Authentication failed" }), {
      status: 500,
    });
  }
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
}
