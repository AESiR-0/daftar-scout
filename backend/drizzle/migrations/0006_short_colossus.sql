ALTER TABLE "daftar_investors" ADD COLUMN "analysis_date" timestamp;--> statement-breakpoint
ALTER TABLE "pitch" ADD COLUMN "investor_status" text DEFAULT 'inbox';