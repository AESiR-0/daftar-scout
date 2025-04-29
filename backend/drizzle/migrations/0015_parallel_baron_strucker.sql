ALTER TABLE "pitch" ALTER COLUMN "investor_status" SET DEFAULT 'Inbox';--> statement-breakpoint
ALTER TABLE "pitch" ALTER COLUMN "investor_status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pitch_team" ADD CONSTRAINT "pitch_team_pitchId_pitch_id_fk" FOREIGN KEY ("pitchId") REFERENCES "public"."pitch"("id") ON DELETE cascade ON UPDATE no action;