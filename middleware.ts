// middleware.ts
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/app/auth";
import { db } from "@/backend/database";
import { criticalPaths } from "@/backend/drizzle/models/url";
import { eq, and } from "drizzle-orm";

export async function middleware(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.next(); // Skip if not authenticated
    }

    const url = request.nextUrl.pathname;

    // Find the active critical path entry for this user
    const activePath = await db
        .select()
        .from(criticalPaths)
        .where(
            and(
                eq(criticalPaths.userId, session.user.email), // change to id later, modify session.user intereface 
                eq(criticalPaths.isFinished, false)
            )
        )
        .limit(1);

    if (activePath.length > 0 && !activePath[0].isFinished) {
        // Append URL to criticalPath if not finished
        const updatedPath = activePath[0].criticalPath
            ? `${activePath[0].criticalPath}, ${url}`
            : url;

        await db
            .update(criticalPaths)
            .set({ criticalPath: updatedPath })
            .where(eq(criticalPaths.id, activePath[0].id));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"], // Apply to all pages
};