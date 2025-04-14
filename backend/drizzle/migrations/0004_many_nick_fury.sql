ALTER TABLE "scout_questions" ALTER COLUMN "is_custom" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "scout_questions" DROP COLUMN "scout_answer_sample_url";--> statement-breakpoint
ALTER TABLE "scout_questions" DROP COLUMN "is_sample";