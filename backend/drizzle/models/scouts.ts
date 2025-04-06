import {
  pgTable,
  varchar,
  text,
  integer,
  boolean,
  serial,
  uuid,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { daftar } from "./daftar";
import { users } from "./users";

export const scouts = pgTable("scouts", {
  scoutId: varchar("scout_id", { length: 255 }).primaryKey(),
  daftarId: varchar("daftar_id", { length: 255 }).references(() => daftar.id),
  scoutName: text("scout_name").notNull(),
  scoutDetails: text("scout_details"),
  targetAudLocation: text("target_aud_location"),
  targetAudAgeStart: integer("target_aud_age_start"),
  targetAudAgeEnd: integer("target_aud_age_end"),
  scoutCommunity: text("scout_community"),
  scoutStage: text("scout_stage"),
  scoutSector: text("scout_sector"),
  scoutCreatedAt: timestamp("scout_created_at").defaultNow(),
  investorPitch: text("investor_pitch"),
  isApprovedByAll: boolean("is_approved_by_all").default(false),
  isArchived: boolean("is_archived").default(false),
  deletedOn: timestamp("deleted_on"),
  status: text("status"),
  lastDayToPitch: date("last_day_to_pitch"),
  programLaunchDate: date("program_launch_date"),
  deleteIsAgreedByAll: boolean("delete_is_agreed_by_all").default(false),
  deleteRequestDate: date("delete_request_date"),
});

export const scoutQuestions = pgTable("scout_questions", {
  id: serial("id").primaryKey(),
  scoutId: varchar("scout_id", { length: 255 }).references(
    () => scouts.scoutId
  ),
  scoutQuestion: text("scout_question").notNull(),
  scoutAnswerSampleUrl: text("scout_answer_sample_url"),
  language: text("language"),
  isCustom: boolean("is_custom").default(false),
  isSample: boolean("is_sample").default(false),
});

export const daftarScouts = pgTable("daftar_scouts", {
  id: serial("id").primaryKey(),
  scoutId: varchar("scout_id", { length: 255 }).references(
    () => scouts.scoutId
  ),
  daftarId: varchar("daftar_id", { length: 255 }).references(() => daftar.id),
});

export const scoutDocuments = pgTable("scout_documents", {
  docId: uuid("doc_id").defaultRandom().primaryKey(),
  docUrl: text("doc_url").notNull(),
  docTypeL: text("doc_type"),
  scoutId: varchar("scout_id", { length: 255 }).references(
    () => scouts.scoutId
  ),
  isPrivate: boolean("is_private").default(false),
  uploadedBy: varchar("uploaded_by", { length: 255 }),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  scoutId: varchar("scout_id", { length: 255 }).references(
    () => scouts.scoutId
  ),
  faqQuestion: text("faq_question").notNull(),
  faqAnswer: text("faq_answer"),
  faqAddedAt: timestamp("faq_added_at").defaultNow(),
});

export const scoutApproved = pgTable("scout_approved", {
  investorId: varchar("investor_id", { length: 255 }).references(
    () => users.id
  ),
  scoutId: varchar("scout_id", { length: 255 }).references(
    () => scouts.scoutId
  ),
  isApproved: boolean("is_approved").default(false),
  approvedAt: timestamp("approved_at"),
});

export const scoutDelete = pgTable("scout_delete", {
  investorId: varchar("investor_id", { length: 255 }).references(
    () => users.id
  ),
  scoutId: varchar("scout_id", { length: 255 }).references(
    () => scouts.scoutId
  ),
  isAgreed: boolean("is_agreed").default(false),
  agreedAt: timestamp("agreed_at"),
});

export const scoutUpdates = pgTable("scout_updates", {
  id: serial("id").primaryKey(),
  scoutId: varchar("scout_id", { length: 255 }).references(
    () => scouts.scoutId
  ),
  updateInfo: text("update_info").notNull(),
  updateDate: timestamp("update_date").defaultNow(),
});

export const scoutRelations = relations(scouts, ({ many }) => ({
  questions: many(scoutQuestions),
  documents: many(scoutDocuments),
  faqs: many(faqs),
  approvals: many(scoutApproved),
  deletions: many(scoutDelete),
  updates: many(scoutUpdates),
}));

export const daftarRelations = relations(daftar, ({ many }) => ({
  scouts: many(scouts),
}));

export const scoutInvestorsRelations = relations(scoutApproved, ({ one }) => ({
  scout: one(scouts, {
    fields: [scoutApproved.scoutId],
    references: [scouts.scoutId],
  }),
  investor: one(users, {
    fields: [scoutApproved.investorId],
    references: [users.id],
  }),
}));
