import { db } from "@/backend/database";
import { userSessions } from "@/backend/drizzle/models/users";
import { getLocationViaIp } from "@/lib/helper/getLocation";

export async function POST(req: Request) {
  const { userId } = await req.json();
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1"; // Get user IP

  // Fetch location details
  const location = await getLocationViaIp(ip);

  // Insert session into the database
  await db.insert(userSessions).values({
    userId,
    ip,
    ...location,
  });

  return new Response(JSON.stringify({ message: "Session stored" }), {
    status: 200,
  });
}
