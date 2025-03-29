import { db } from "@/backend/database";
import { getTimeSlot } from "./timeSlot";
import { criticalPaths } from "@/backend/drizzle/models/url";

export async function insertCriticalPath(id: string) {
    const sessionStart = new Date();
    const timeSlot = getTimeSlot(sessionStart);

    // Insert initial critical path entry
    await db.insert(criticalPaths).values({
        userId: id,
        sessionStart,
        criticalPath: "/dashboard",
        isFinished: false,
        sessionEnd: null,
    });
}