import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  serial,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { scouts } from "./scouts"; // Import scouts table for relation
import { users } from "./users"; // Import users model

export const daftar = pgTable("daftar", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: text("name").notNull(),
  profileUrl: text("profile_url"),
  structure: text("structure"),
  website: text("website"),
  type: text("type"),
  bigPicture: text("big_picture"),
  createdAt: timestamp("created_at").default(sql`now()`),
  isActive: boolean("is_active").default(true),
  location: text("location"),
  scoutCount: integer("scout_count").default(0), // Updated via trigger
  teamSize: integer("team_size"),
  deletedOn: timestamp("deleted_on"),
});

export const structure = pgTable("structure", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`now()`),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "cascade",
  }),
});

export const daftarStructure = pgTable("daftar_structure", {
  id: serial("id").primaryKey(),
  daftarId: varchar("daftar_id", { length: 255 }).references(() => daftar.id, {
    onDelete: "cascade",
  }),
  structureId: integer("structure_id").references(() => structure.id, {
    onDelete: "cascade",
  }),
});

export const daftarInvestors = pgTable("daftar_investors", {
  id: serial("id").primaryKey(),
  daftarId: varchar("daftar_id", { length: 255 }).references(() => daftar.id, {
    onDelete: "cascade",
  }),
  investorId: varchar("investor_id", { length: 255 }).references(
    () => users.id,
    { onDelete: "cascade" }
  ),
  status: varchar("status", { length: 50 }),
  designation: varchar("designation", { length: 100 }),
  joinDate: timestamp("join_date").defaultNow(),
  joinType: varchar("join_type", { length: 50 }).default("invite"),
  analysiOn: timestamp("analysis_date"),
  approvesDelete: boolean("approves_delete"),
});

export const daftarInvestorsRelations = relations(
  daftarInvestors,
  ({ one }) => ({
    daftar: one(daftar, {
      fields: [daftarInvestors.daftarId],
      references: [daftar.id],
    }),
    investor: one(users, {
      fields: [daftarInvestors.investorId],
      references: [users.id],
    }),
  })
);
