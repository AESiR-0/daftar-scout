CREATE TABLE "unregistered_users" (
	"id" text PRIMARY KEY NOT NULL,
	"ip" text NOT NULL,
	"browser" text NOT NULL,
	"os" text NOT NULL,
	"device" text NOT NULL,
	"user_agent" text NOT NULL,
	"location_data" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "focus_sectors" ADD COLUMN "added_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "focus_sectors" ADD COLUMN "added_by" varchar(255) DEFAULT 'system';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_change_of_picture" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "country_code" varchar(5);--> statement-breakpoint
ALTER TABLE "focus_sectors" ADD CONSTRAINT "focus_sectors_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;