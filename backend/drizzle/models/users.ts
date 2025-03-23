import { pgTable, varchar, primaryKey, text, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(), // ID with role-based prefix
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").unique().notNull(),
  role: text("role").notNull(), // Founder, Investor, etc.
  location: text("location"), // Nullable (IP-based)
  gender: text("gender"), // Nullable
  dob: date("dob"),
  number: varchar("number", { length: 20 }), // Nullable
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  deletedOn: timestamp("deleted_on"), // Nullable
});

export const languages = pgTable("languages", {
  id: integer("id").primaryKey(),
  language_name: text("language_name").notNull()
})

export const userLanguages = pgTable(
  "user_languages",
  {
    userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    languageId: integer("language_id").notNull().references(() => languages.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.languageId] }), // Composite Primary Key
  })
);