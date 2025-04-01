import { auth } from "@/auth";
import { db } from "@/backend/database";
import { structure } from "@/backend/drizzle/models/daftar";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const structures = await db.select().from(structure);
  return new Response(JSON.stringify(structures), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
