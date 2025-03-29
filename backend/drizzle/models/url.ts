import { pgTable, text, timestamp, integer, boolean, serial } from "drizzle-orm/pg-core";
import { users } from "./users"; // Assuming users table exists


export const criticalPaths = pgTable("critical_paths", {
    id: serial("id").primaryKey(), // Auto-incrementing ID
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }), // Foreign key to users
    sessionStart: timestamp("session_start", { mode: "date" }).notNull().defaultNow(), // Session start time
    sessionDuration: integer("session_duration"), // Duration in seconds (calculated on sign-out)
    criticalPath: text("critical_path").notNull().default(""), // Comma-separated URLs
    isFinished: boolean("is_finished").notNull().default(false), // Whether session is complete
    sessionEnd: timestamp("session_end", { mode: "date" }), // Nullable session end time
});
