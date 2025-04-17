import { pgTable, text, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),

  type: text("type").notNull(),
  role: text("role").notNull(),

  targeted_users: text("targeted_users")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),

  payload: jsonb("payload"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
