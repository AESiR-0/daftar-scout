import { pgTable, serial, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";

export const videoJobs = pgTable("video_jobs", {
  id: serial("id").primaryKey(),
  jobId: varchar("job_id", { length: 255 }).notNull().unique(),
  userId: varchar("user_id", { length: 255 }),
  s3Key: text("s3_key").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, complete, failed
  logs: text("logs"), // optional: store logs
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"), 
  questionId: integer("question_id"),
  scoutId: varchar("scout_id", { length: 255 }),
  pitchId: varchar("pitch_id", { length: 255 }),
}); 