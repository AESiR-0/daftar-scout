// app/api/signout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { signOut } from "@/auth";
import { db } from "@/backend/database";
import { criticalPaths } from "@/backend/drizzle/models/url";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (session?.status == 'authenticated') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Finalize the critical path
    const activePath = await db
        .select()
        .from(criticalPaths)
        .where(
            and(
                eq(criticalPaths.userId, session?.idToken as string),
                eq(criticalPaths.isFinished, false)
            )
        )
        .limit(1);

    if (activePath.length > 0) {
        const sessionEnd = new Date();
        const sessionDuration = Math.floor(
            (sessionEnd.getTime() - activePath[0].sessionStart.getTime()) / 1000
        );

        await db
            .update(criticalPaths)
            .set({
                isFinished: true,
                sessionEnd,
                sessionDuration,
            })
            .where(eq(criticalPaths.id, activePath[0].id));
    }

    // Perform NextAuth sign-out (clears JWT cookie)
    await signOut({ redirect: false });

    return NextResponse.json({ message: "Signed out" }, { status: 200 });
}