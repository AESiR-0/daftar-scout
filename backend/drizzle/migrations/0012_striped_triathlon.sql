ALTER TABLE "users" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "scouts" DROP COLUMN "scout_sector";--> statement-breakpoint
ALTER TABLE "scouts" DROP COLUMN "scout_created_at";