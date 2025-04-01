import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { users } from "./users"; // Assuming users table exists

export const criticalPaths = pgTable("critical_paths", {
  id: serial("id").primaryKey(), // Auto-incrementing ID
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Foreign key to users
  sessionStart: timestamp("session_start", { mode: "date" })
    .notNull()
    .defaultNow(), // Session start time
  sessionDuration: integer("session_duration"), // Duration in seconds (calculated on sign-out)
  criticalPath: text("critical_path").notNull().default(""), // Comma-separated URLs
  isFinished: boolean("is_finished").notNull().default(false), // Whether session is complete
  sessionEnd: timestamp("session_end", { mode: "date" }), // Nullable session end time
});

export const allUrls = pgTable("all_urls", {
  id: serial("id").primaryKey(), // Auto-incrementing ID
  url: text("url").notNull(), // URL string
  isArchived: boolean("is_finished").notNull().default(false), // Whether session is complete
  createdDate: timestamp("created_date", { mode: "date" }),
  archivedDate: timestamp("archived_date", { mode: "date" }), // Nullable session end time
});

export const urlTracking = pgTable("url_source", {
  id: serial("id").primaryKey(), // Auto-incrementing ID
  urlId: integer("url_id")
    .notNull()
    .references(() => allUrls.id, { onDelete: "cascade" }), // Foreign key to all_urls
  lastAccessed: timestamp("last_accessed", { mode: "date" }).defaultNow(), // Last accessed time
  source: text("source").notNull(), // Source of the URL (e.g., email, social media)
  createdDate: timestamp("created_date", { mode: "date" }).defaultNow(), // Creation date
});
