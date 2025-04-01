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
import { scouts } from "./scouts";
import { users } from "./users";

// 🏆 Pitch Model
export const pitch = pgTable("pitch", {
  id: varchar("id", { length: 255 }).primaryKey(),
  pitchName: varchar("pitch_name", { length: 255 }).notNull(),
  location: text("location"),
  scoutId: varchar("scout_id", { length: 255 }).references(
    () => scouts.scoutId
  ),
  demoLink: text("demo_link"),
  stage: text("stage"),
  askForInvestor: text("ask_for_investor"),
  createdAt: timestamp("created_at").defaultNow(),
  status: text("status"),
  isCompleted: boolean("is_completed").default(false),
  teamSize: integer("team_size"),
  isPaid: boolean("is_paid").default(false),
});

// 🚀 Focus Sectors
export const focusSectors = pgTable("focus_sectors", {
  id: serial("id").primaryKey(),
  sectorName: text("sector_name").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
  addedBy: varchar("added_by", { length: 255 })
    .references(() => users.id)
    .default("system"),
});

// 🔄 Focus Sector Relations (Many-to-Many with Pitch)
export const pitchFocusSectors = pgTable("pitch_focus_sectors", {
  id: serial("id").primaryKey(),
  focusSectorId: integer("focus_sector_id").references(() => focusSectors.id),
  pitchId: varchar("pitch_id", { length: 255 }).references(() => pitch.id),
});

// 📄 Pitch Documents
export const pitchDocs = pgTable("pitch_docs", {
  id: uuid("id").defaultRandom().primaryKey(),
  pitchId: varchar("pitch_id", { length: 255 }).references(() => pitch.id),
  docName: text("doc_name").notNull(),
  docType: text("doc_type").notNull(),
  docUrl: text("doc_url").notNull(),
  isPrivate: boolean("is_private").default(false),
  uploadedBy: varchar("uploaded_by", { length: 255 }).references(
    () => users.id
  ),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  isViewed: boolean("is_viewed").default(false),
});

// 💰 Offers
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  pitchId: varchar("pitch_id", { length: 255 }).references(() => pitch.id),
  offerDescription: text("offer_description").notNull(),
  offerBy: varchar("offer_by", { length: 255 }).references(() => users.id),
  offeredAt: timestamp("offered_at").defaultNow(),
  offerStatus: text("offer_status"),
});

// ✅ Offer Actions
export const offerActions = pgTable("offer_actions", {
  offerId: integer("offer_id").references(() => offers.id),
  isActionTaken: boolean("is_action_taken").default(false),
  action: varchar("action", { length: 255 }),
  actionTakenBy: varchar("action_taken_by", { length: 255 }).references(
    () => users.id
  ),
  actionTakenAt: timestamp("action_taken_at"),
});

// 🎤 founder Answers
export const founderAnswers = pgTable("founder_answers", {
  id: serial("id").primaryKey(),
  pitchId: varchar("pitch_id", { length: 255 }).references(() => pitch.id),
  pitchAnswerUrl: text("pitch_answer_url").notNull(),
  questionId: varchar("question_id", { length: 255 }).references(
    () => scouts.scoutId
  ),
  answerLanguage: text("answer_language"),
});

// ❌ Pitch Delete Requests
export const pitchDelete = pgTable("pitch_delete", {
  id: serial("id").primaryKey(),
  pitchId: varchar("pitch_id", { length: 255 }).references(() => pitch.id),
  founderId: varchar("founder_id", { length: 255 }).references(() => users.id),
  isAgreed: boolean("is_agreed").default(false),
});
// 📊 Investor Pitch (NEW MODEL)
export const investorPitch = pgTable("investor_pitch", {
  id: serial("id").primaryKey(),
  pitchId: varchar("pitch_id", { length: 255 }).references(() => pitch.id),
  scoutId: varchar("scout_id", { length: 255 }).references(
    () => scouts.scoutId
  ),
  investorId: varchar("investor_id", { length: 255 }).references(
    () => users.id
  ),
  believeRating: integer("believe_rating"), // Rating scale (e.g., 1-10)
  shouldMeet: boolean("should_meet").default(false),
  analysis: text("analysis"),
  isSubmitted: boolean("is_submitted").default(false),
  submittedOn: timestamp("submitted_on"),
  note: text("note"),
  status: text("status"),
  lastActionTakenOn: timestamp("last_action_taken_on"),
  isReported: boolean("is_reported").default(false),
  isActive: boolean("is_active").default(true),
  deletedOn: timestamp("deleted_on"),
  deal: boolean("deal").default(false),
});

// Founders Team
export const pitchTeam = pgTable("pitch_team", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  designation: text("designation").notNull(),
  pitchId: text("pitchId").references(() => pitch.id),
});

// 🔗 Relationships
export const pitchRelations = relations(pitch, ({ many, one }) => ({
  documents: many(pitchDocs),
  offers: many(offers),
  founderAnswers: many(founderAnswers),
  deleteRequests: many(pitchDelete),
  focusSectors: many(pitchFocusSectors),
  investorPitches: many(investorPitch), // Added new relation
  scout: one(scouts, { fields: [pitch.scoutId], references: [scouts.scoutId] }),
}));

export const focusSectorRelations = relations(focusSectors, ({ many }) => ({
  pitches: many(pitchFocusSectors),
}));

export const offerRelations = relations(offers, ({ many, one }) => ({
  actions: many(offerActions),
  pitch: one(pitch, { fields: [offers.pitchId], references: [pitch.id] }),
  offeredBy: one(users, { fields: [offers.offerBy], references: [users.id] }),
}));

export const investorAnswerRelations = relations(founderAnswers, ({ one }) => ({
  pitch: one(pitch, {
    fields: [founderAnswers.pitchId],
    references: [pitch.id],
  }),
  question: one(scouts, {
    fields: [founderAnswers.questionId],
    references: [scouts.scoutId],
  }),
}));

export const pitchDeleteRelations = relations(pitchDelete, ({ one }) => ({
  pitch: one(pitch, { fields: [pitchDelete.pitchId], references: [pitch.id] }),
  founder: one(users, {
    fields: [pitchDelete.founderId],
    references: [users.id],
  }),
}));

export const investorPitchRelations = relations(investorPitch, ({ one }) => ({
  pitch: one(pitch, {
    fields: [investorPitch.pitchId],
    references: [pitch.id],
  }),
  scout: one(scouts, {
    fields: [investorPitch.scoutId],
    references: [scouts.scoutId],
  }),
  investor: one(users, {
    fields: [investorPitch.investorId],
    references: [users.id],
  }),
}));
