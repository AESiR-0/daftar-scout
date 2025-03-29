import { db } from "@/backend/database";
import { faqs } from "@/backend/drizzle/models/scouts";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const result = await db.select().from(faqs);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
