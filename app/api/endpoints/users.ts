import { NextResponse } from "next/server";
import { db } from "@/backend/database";
import { users } from "@/backend/drizzle/models/users";

export async function GET() {
  const allUsers = await db.select().from(users);
  return NextResponse.json(allUsers);
}
