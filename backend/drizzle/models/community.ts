// make a model for communities with drizzle in postgres
import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by", { length: 255 })
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .default("system"),
});
