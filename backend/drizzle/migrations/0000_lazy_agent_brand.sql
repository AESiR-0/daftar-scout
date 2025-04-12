CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "authenticator" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"created_by" varchar(255) DEFAULT 'system'
);
--> statement-breakpoint
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
CREATE TABLE "focus_sectors" (
	"id" serial PRIMARY KEY NOT NULL,
	"sector_name" text NOT NULL,
	"added_at" timestamp DEFAULT now(),
	"added_by" varchar(255) DEFAULT 'system'
);
--> statement-breakpoint
CREATE TABLE "founder_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"pitch_id" varchar(255),
	"pitch_answer_url" text NOT NULL,
	"question_id" integer,
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
	"ask_for_investor" text,
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
CREATE TABLE "pitch_team" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"designation" text NOT NULL,
	"has_approved" boolean DEFAULT false,
	"pitchId" text
);
--> statement-breakpoint
CREATE TABLE "feature_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"feature_name" varchar(255) NOT NULL,
	"description" text,
	"user_id" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE "daftar_scouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"scout_id" varchar(255),
	"daftar_id" varchar(255),
	"is_pending" boolean,
	"added_at" timestamp DEFAULT now()
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
CREATE TABLE "all_urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"is_finished" boolean DEFAULT false NOT NULL,
	"created_date" timestamp,
	"archived_date" timestamp
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
CREATE TABLE "url_source" (
	"id" serial PRIMARY KEY NOT NULL,
	"url_id" integer NOT NULL,
	"last_accessed" timestamp DEFAULT now(),
	"source" text NOT NULL,
	"created_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" integer PRIMARY KEY NOT NULL,
	"language_name" text NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "user_languages" (
	"user_id" text NOT NULL,
	"language_id" integer NOT NULL,
	CONSTRAINT "user_languages_user_id_language_id_pk" PRIMARY KEY("user_id","language_id")
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"ip" text NOT NULL,
	"postal_code" text,
	"city" text,
	"state" text,
	"country" text,
	"continent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"role" text DEFAULT 'temp' NOT NULL,
	"location" text,
	"gender" text,
	"last_change_of_picture" timestamp,
	"dob" date,
	"image" text,
	"country_code" varchar(5),
	"number" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_on" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communities" ADD CONSTRAINT "communities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daftar_investors" ADD CONSTRAINT "daftar_investors_daftar_id_daftar_id_fk" FOREIGN KEY ("daftar_id") REFERENCES "public"."daftar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daftar_investors" ADD CONSTRAINT "daftar_investors_investor_id_users_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daftar_structure" ADD CONSTRAINT "daftar_structure_daftar_id_daftar_id_fk" FOREIGN KEY ("daftar_id") REFERENCES "public"."daftar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daftar_structure" ADD CONSTRAINT "daftar_structure_structure_id_structure_id_fk" FOREIGN KEY ("structure_id") REFERENCES "public"."structure"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "structure" ADD CONSTRAINT "structure_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "focus_sectors" ADD CONSTRAINT "focus_sectors_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "founder_answers" ADD CONSTRAINT "founder_answers_pitch_id_pitch_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."pitch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "founder_answers" ADD CONSTRAINT "founder_answers_question_id_scout_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."scout_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "pitch_team" ADD CONSTRAINT "pitch_team_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_team" ADD CONSTRAINT "pitch_team_pitchId_pitch_id_fk" FOREIGN KEY ("pitchId") REFERENCES "public"."pitch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_tracking" ADD CONSTRAINT "feature_tracking_feature_id_feature_requests_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."feature_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_dev_analysis" ADD CONSTRAINT "post_dev_analysis_feature_id_feature_requests_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."feature_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_pitch_id_pitch_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."pitch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_scout_id_scouts_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("scout_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_status" ADD CONSTRAINT "report_status_report_id_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."report"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_type" ADD CONSTRAINT "report_type_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daftar_scouts" ADD CONSTRAINT "daftar_scouts_scout_id_scouts_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("scout_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daftar_scouts" ADD CONSTRAINT "daftar_scouts_daftar_id_daftar_id_fk" FOREIGN KEY ("daftar_id") REFERENCES "public"."daftar"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_scout_id_scouts_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("scout_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_approved" ADD CONSTRAINT "scout_approved_investor_id_users_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_approved" ADD CONSTRAINT "scout_approved_scout_id_scouts_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("scout_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_delete" ADD CONSTRAINT "scout_delete_investor_id_users_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_delete" ADD CONSTRAINT "scout_delete_scout_id_scouts_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("scout_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_documents" ADD CONSTRAINT "scout_documents_scout_id_scouts_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("scout_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_questions" ADD CONSTRAINT "scout_questions_scout_id_scouts_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("scout_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_updates" ADD CONSTRAINT "scout_updates_scout_id_scouts_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("scout_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scouts" ADD CONSTRAINT "scouts_daftar_id_daftar_id_fk" FOREIGN KEY ("daftar_id") REFERENCES "public"."daftar"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "critical_paths" ADD CONSTRAINT "critical_paths_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "url_source" ADD CONSTRAINT "url_source_url_id_all_urls_id_fk" FOREIGN KEY ("url_id") REFERENCES "public"."all_urls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_languages" ADD CONSTRAINT "user_languages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_languages" ADD CONSTRAINT "user_languages_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action;