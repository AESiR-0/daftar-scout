CREATE TABLE "pitch_team" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"designation" text NOT NULL,
	"pitchId" text
);
--> statement-breakpoint
CREATE TABLE "critical_paths" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"session_start" timestamp DEFAULT now() NOT NULL,
	"session_duration" integer,
	"critical_path" text DEFAULT '' NOT NULL,
	"is_finished" boolean DEFAULT false NOT NULL,
	"session_end" timestamp
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "pitch_team" ADD CONSTRAINT "pitch_team_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_team" ADD CONSTRAINT "pitch_team_pitchId_pitch_id_fk" FOREIGN KEY ("pitchId") REFERENCES "public"."pitch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "critical_paths" ADD CONSTRAINT "critical_paths_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;