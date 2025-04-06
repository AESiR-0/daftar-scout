CREATE TABLE "daftar_structure" (
	"id" serial PRIMARY KEY NOT NULL,
	"daftar_id" varchar(255),
	"structure_id" integer
);
--> statement-breakpoint
CREATE TABLE "structure" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "all_urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"is_finished" boolean DEFAULT false NOT NULL,
	"created_date" timestamp,
	"archived_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "url_source" (
	"id" serial PRIMARY KEY NOT NULL,
	"url_id" integer NOT NULL,
	"last_accessed" timestamp DEFAULT now(),
	"source" text NOT NULL,
	"created_date" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "feature_requests" DROP CONSTRAINT "feature_requests_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "pitch" ALTER COLUMN "ask_for_investor" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "pitch" ALTER COLUMN "ask_for_investor" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "feature_requests" ALTER COLUMN "feature_name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "feature_requests" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "feature_requests" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "feature_requests" ADD COLUMN "status" varchar(50) DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "feature_requests" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "daftar_structure" ADD CONSTRAINT "daftar_structure_daftar_id_daftar_id_fk" FOREIGN KEY ("daftar_id") REFERENCES "public"."daftar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daftar_structure" ADD CONSTRAINT "daftar_structure_structure_id_structure_id_fk" FOREIGN KEY ("structure_id") REFERENCES "public"."structure"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "structure" ADD CONSTRAINT "structure_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "url_source" ADD CONSTRAINT "url_source_url_id_all_urls_id_fk" FOREIGN KEY ("url_id") REFERENCES "public"."all_urls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_requests" DROP COLUMN "requested_at";