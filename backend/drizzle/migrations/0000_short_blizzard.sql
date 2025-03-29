CREATE TABLE "daftar" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"profile_url" text,
	"structure" text,
	"website" text,
	"type" text,
	"big_picture" text,
	"created_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	"location" text,
	"scout_count" integer DEFAULT 0,
	"team_size" integer,
	"deleted_on" timestamp
);
--> statement-breakpoint
CREATE TABLE "daftar_investors" (
	"id" serial PRIMARY KEY NOT NULL,
	"daftar_id" varchar(255),
	"investor_id" varchar(255),
	"status" varchar(50),
	"designation" varchar(100),
	"join_date" timestamp DEFAULT now(),
	"join_type" varchar(50) DEFAULT 'invite'
);
--> statement-breakpoint
CREATE TABLE "focus_sectors" (
	"id" serial PRIMARY KEY NOT NULL,
	"sector_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investor_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"pitch_id" varchar(255),
	"pitch_answer_url" text NOT NULL,
	"question_id" varchar(255),
	"answer_language" text
);
--> statement-breakpoint
CREATE TABLE "investor_pitch" (
	"id" serial PRIMARY KEY NOT NULL,
	"pitch_id" varchar(255),
	"scout_id" varchar(255),
	"investor_id" varchar(255),
	"believe_rating" integer,
	"should_meet" boolean DEFAULT false,
	"analysis" text,
	"is_submitted" boolean DEFAULT false,
	"submitted_on" timestamp,
	"note" text,
	"status" text,
	"last_action_taken_on" timestamp,
	"is_reported" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"deleted_on" timestamp,
	"deal" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "offer_actions" (
	"offer_id" integer,
	"is_action_taken" boolean DEFAULT false,
	"action" varchar(255),
	"action_taken_by" varchar(255),
	"action_taken_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"pitch_id" varchar(255),
	"offer_description" text NOT NULL,
	"offer_by" varchar(255),
	"offered_at" timestamp DEFAULT now(),
	"offer_status" text
);
--> statement-breakpoint
CREATE TABLE "pitch" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"pitch_name" varchar(255) NOT NULL,
	"location" text,
	"scout_id" varchar(255),
	"demo_link" text,
	"stage" text,
	"ask_for_investor" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"status" text,
	"is_completed" boolean DEFAULT false,
	"team_size" integer,
	"is_paid" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "pitch_delete" (
	"id" serial PRIMARY KEY NOT NULL,
	"pitch_id" varchar(255),
	"founder_id" varchar(255),
	"is_agreed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "pitch_docs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pitch_id" varchar(255),
	"doc_name" text NOT NULL,
	"doc_type" text NOT NULL,
	"doc_url" text NOT NULL,
	"is_private" boolean DEFAULT false,
	"uploaded_by" varchar(255),
	"uploaded_at" timestamp DEFAULT now(),
	"is_viewed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "pitch_focus_sectors" (
	"id" serial PRIMARY KEY NOT NULL,
	"focus_sector_id" integer,
	"pitch_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"scout_id" varchar(255),
	"faq_question" text NOT NULL,
	"faq_answer" text,
	"faq_added_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scout_approved" (
	"investor_id" varchar(255),
	"scout_id" varchar(255),
	"is_approved" boolean DEFAULT false,
	"approved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "scout_delete" (
	"investor_id" varchar(255),
	"scout_id" varchar(255),
	"is_agreed" boolean DEFAULT false,
	"agreed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "scout_documents" (
	"doc_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doc_url" text NOT NULL,
	"doc_type" text,
	"scout_id" varchar(255),
	"is_private" boolean DEFAULT false,
	"uploaded_by" varchar(255),
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scout_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"scout_id" varchar(255),
	"scout_question" text NOT NULL,
	"scout_answer_sample_url" text,
	"language" text,
	"is_custom" boolean DEFAULT false,
	"is_sample" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "scout_updates" (
	"id" serial PRIMARY KEY NOT NULL,
	"scout_id" varchar(255),
	"update_info" text NOT NULL,
	"update_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scouts" (
	"scout_id" varchar(255) PRIMARY KEY NOT NULL,
	"daftar_id" varchar(255),
	"scout_name" text NOT NULL,
	"scout_details" text,
	"target_aud_location" text,
	"target_aud_age_start" integer,
	"target_aud_age_end" integer,
	"scout_community" text,
	"scout_stage" text,
	"scout_sector" text,
	"scout_created_at" timestamp DEFAULT now(),
	"investor_pitch" text,
	"is_approved_by_all" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"deleted_on" timestamp,
	"status" text,
	"last_day_to_pitch" date,
	"program_launch_date" date,
	"delete_is_agreed_by_all" boolean DEFAULT false,
	"delete_request_date" date
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" integer PRIMARY KEY NOT NULL,
	"language_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_languages" (
	"user_id" varchar(255) NOT NULL,
	"language_id" integer NOT NULL,
	CONSTRAINT "user_languages_user_id_language_id_pk" PRIMARY KEY("user_id","language_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"location" text,
	"gender" text,
	"dob" date,
	"number" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_on" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "daftar_investors" ADD CONSTRAINT "daftar_investors_daftar_id_daftar_id_fk" FOREIGN KEY ("daftar_id") REFERENCES "public"."daftar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daftar_investors" ADD CONSTRAINT "daftar_investors_investor_id_users_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_answers" ADD CONSTRAINT "investor_answers_pitch_id_pitch_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."pitch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_answers" ADD CONSTRAINT "investor_answers_question_id_scouts_scout_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."scouts"("scout_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_pitch" ADD CONSTRAINT "investor_pitch_pitch_id_pitch_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."pitch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_pitch" ADD CONSTRAINT "investor_pitch_scout_id_scouts_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("scout_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_pitch" ADD CONSTRAINT "investor_pitch_investor_id_users_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_actions" ADD CONSTRAINT "offer_actions_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_actions" ADD CONSTRAINT "offer_actions_action_taken_by_users_id_fk" FOREIGN KEY ("action_taken_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_pitch_id_pitch_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."pitch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_offer_by_users_id_fk" FOREIGN KEY ("offer_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch" ADD CONSTRAINT "pitch_scout_id_scouts_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("scout_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_delete" ADD CONSTRAINT "pitch_delete_pitch_id_pitch_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."pitch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_delete" ADD CONSTRAINT "pitch_delete_founder_id_users_id_fk" FOREIGN KEY ("founder_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_docs" ADD CONSTRAINT "pitch_docs_pitch_id_pitch_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."pitch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_docs" ADD CONSTRAINT "pitch_docs_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_focus_sectors" ADD CONSTRAINT "pitch_focus_sectors_focus_sector_id_focus_sectors_id_fk" FOREIGN KEY ("focus_sector_id") REFERENCES "public"."focus_sectors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_focus_sectors" ADD CONSTRAINT "pitch_focus_sectors_pitch_id_pitch_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."pitch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_scout_id_scouts_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("scout_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_approved" ADD CONSTRAINT "scout_approved_investor_id_users_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_approved" ADD CONSTRAINT "scout_approved_scout_id_scouts_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("scout_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_delete" ADD CONSTRAINT "scout_delete_investor_id_users_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_delete" ADD CONSTRAINT "scout_delete_scout_id_scouts_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("scout_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_documents" ADD CONSTRAINT "scout_documents_scout_id_scouts_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("scout_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_questions" ADD CONSTRAINT "scout_questions_scout_id_scouts_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("scout_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_updates" ADD CONSTRAINT "scout_updates_scout_id_scouts_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("scout_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scouts" ADD CONSTRAINT "scouts_daftar_id_daftar_id_fk" FOREIGN KEY ("daftar_id") REFERENCES "public"."daftar"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_languages" ADD CONSTRAINT "user_languages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_languages" ADD CONSTRAINT "user_languages_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;