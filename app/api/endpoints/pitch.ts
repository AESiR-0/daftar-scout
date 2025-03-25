// import { NextResponse } from "next/server";
// import { db } from "@/backend/database";
// import { pitch } from "@/backend/drizzle/models/pitch";
// import { eq } from "drizzle-orm";

// export async function GET(req: Request, { params }: { params: { id: string } }) {
//     const pitchData = await db.select().from(pitch).({
//         where: (pitch, { eq }) => eq(pitch.id, params.id),
//     });

//     if (!pitchData) return NextResponse.json({ error: "Pitch not found" }, { status: 404 });

//     return NextResponse.json(pitchData);
// }
