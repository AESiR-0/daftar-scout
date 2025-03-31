CREATE TABLE "communities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"created_by" varchar(255) DEFAULT 'system'
);
--> statement-breakpoint
CREATE TABLE "feature_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"feature_name" text NOT NULL,
	"user_id" integer NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"feature_id" integer NOT NULL,
	"priority" text DEFAULT 'Medium',
	"status" text DEFAULT 'Requested',
	"reason" text,
	"estimated_time" integer,
	"complexity" text DEFAULT 'Moderate',
	"release_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "post_dev_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"feature_id" integer NOT NULL,
	"user_adoption_rate" integer DEFAULT 0,
	"impact" text,
	"customer_satisfaction" integer DEFAULT 0,
	"feedback" text,
	"solved_by" text
);
--> statement-breakpoint
CREATE TABLE "report" (
	"id" serial PRIMARY KEY NOT NULL,
	"reported_by" text NOT NULL,
	"pitch_id" text NOT NULL,
	"report_description" text,
	"scout_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type" text NOT NULL,
	"added_by" text DEFAULT 'system',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "communities" ADD CONSTRAINT "communities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_requests" ADD CONSTRAINT "feature_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_tracking" ADD CONSTRAINT "feature_tracking_feature_id_feature_requests_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."feature_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_dev_analysis" ADD CONSTRAINT "post_dev_analysis_feature_id_feature_requests_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."feature_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_pitch_id_pitch_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."pitch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_scout_id_scouts_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("scout_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_status" ADD CONSTRAINT "report_status_report_id_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."report"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_type" ADD CONSTRAINT "report_type_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;