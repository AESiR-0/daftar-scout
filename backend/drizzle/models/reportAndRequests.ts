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
import { pitch } from "./pitch";
import { scouts } from "./scouts";

export const featureRequests = pgTable("feature_requests", {
  id: serial("id").primaryKey(),
  featureName: text("feature_name").notNull(),
  userId: text("user_id") // Change from integer() to text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
});

export const featureTracking = pgTable("feature_tracking", {
  id: serial("id").primaryKey(),
  featureId: integer("feature_id")
    .references(() => featureRequests.id)
    .notNull(),
  priority: text("priority").default("Medium"), // High, Medium, Low
  status: text("status").default("Requested"), // Requested, Under Review, Approved, etc.
  reason: text("reason"), // Nullable
  estimatedTime: integer("estimated_time"), // Days
  complexity: text("complexity").default("Moderate"), // Simple, Moderate, Complex
  releaseDate: timestamp("release_date"),
});

export const postDevAnalysis = pgTable("post_dev_analysis", {
  id: serial("id").primaryKey(),
  featureId: integer("feature_id")
    .references(() => featureRequests.id)
    .notNull(),
  userAdoptionRate: integer("user_adoption_rate").default(0),
  impact: text("impact"), // Scale, Revenue
  customerSatisfaction: integer("customer_satisfaction").default(0), // 1-5 scale
  feedback: text("feedback"), // Nullable
  solvedBy: text("solved_by"), // Agent, AI, Team Name
});

export const featureRequestsRelations = relations(
  featureRequests,
  ({ many }) => ({
    tracking: many(featureTracking),
    analysis: many(postDevAnalysis),
  })
);

// Report Table (For Pitch Reports)
export const report = pgTable("report", {
  id: serial("id").primaryKey(),
  reportedBy: text("reported_by")
    .references(() => users.id)
    .notNull(),
  pitchId: text("pitch_id")
    .references(() => pitch.id)
    .notNull(), // Pitches being reported
  reportDescription: text("report_description"),
  scoutId: text("scout_id")
    .references(() => scouts.scoutId)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Report Type Table
export const reportType = pgTable("report_type", {
  id: serial("id").primaryKey(),
  reportType: text("report_type").notNull(), // Bug, Violation, etc.
  addedBy: text("added_by")
    .references(() => users.id)
    .default("system"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Report Status Table
export const reportStatus = pgTable("report_status", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id")
    .references(() => report.id)
    .notNull(),
  status: text("status").notNull(), // Open, Under Review, Closed
});

// Relations
export const reportRelations = relations(report, ({ one }) => ({
  reportType: one(reportType, {
    fields: [report.id],
    references: [reportType.id],
  }),
  reportStatus: one(reportStatus, {
    fields: [report.id],
    references: [reportStatus.reportId],
  }),
}));
