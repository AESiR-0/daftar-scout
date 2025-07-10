CREATE TABLE IF NOT EXISTS  "account" (
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
CREATE TABLE  IF NOT EXISTS "authenticator" (
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
CREATE TABLE IF NOT EXISTS "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "communities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"created_by" varchar(255) DEFAULT 'system'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "daftar" (
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
CREATE TABLE IF NOT EXISTS "daftar_investors" (
	"id" serial PRIMARY KEY NOT NULL,
	"daftar_id" varchar(255),
	"investor_id" varchar(255),
	"status" varchar(50),
	"designation" varchar(100),
	"join_date" timestamp DEFAULT now(),
	"join_type" varchar(50) DEFAULT 'invite',
	"analysis_date" timestamp,
	"approves_delete" boolean
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "daftar_structure" (
	"id" serial PRIMARY KEY NOT NULL,
	"daftar_id" varchar(255),
	"structure_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "structure" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"user_id" text NOT NULL,
	"calendar_event_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"location" text,
	"meet_link" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text,
	"description" text,
	"type" text NOT NULL,
	"role" text NOT NULL,
	"subtype" text,
	"targeted_users" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "focus_sectors" (
	"id" serial PRIMARY KEY NOT NULL,
	"sector_name" text NOT NULL,
	"added_at" timestamp DEFAULT now(),
	"added_by" varchar(255) DEFAULT 'system'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "founder_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"pitch_id" varchar(255),
	"pitch_answer_url" text NOT NULL,
	"compressed_pitch_answer_url" text,
	"question_id" integer,
	"answer_language" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "investor_pitch" (
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
CREATE TABLE IF NOT EXISTS "offer_actions" (
	"offer_id" integer,
	"is_action_taken" boolean DEFAULT false,
	"action" varchar(255),
	"action_taken_by" varchar(255),
	"action_taken_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"pitch_id" varchar(255),
	"offer_description" text NOT NULL,
	"offer_by" varchar(255),
	"offered_at" timestamp DEFAULT now(),
	"offer_status" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pitch" (
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
	"is_paid" boolean DEFAULT false,
	"is_locked" boolean DEFAULT false,
	"investor_status" text DEFAULT 'Inbox' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pitch_delete" (
	"id" serial PRIMARY KEY NOT NULL,
	"pitch_id" varchar(255),
	"founder_id" varchar(255),
	"is_agreed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pitch_docs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pitch_id" varchar(255),
	"doc_name" text NOT NULL,
	"doc_type" text NOT NULL,
	"doc_url" text NOT NULL,
	"size" integer,
	"is_private" boolean DEFAULT false,
	"uploaded_by" varchar(255),
	"uploaded_at" timestamp DEFAULT now(),
	"is_viewed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pitch_focus_sectors" (
	"id" serial PRIMARY KEY NOT NULL,
	"focus_sector_id" integer,
	"pitch_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pitch_team" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"invitation_accepted" boolean,
	"designation" text NOT NULL,
	"has_approved" boolean DEFAULT false,
	"pitchId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"support_name" varchar(255) NOT NULL,
	"description" text,
	"user_id" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feature_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"feature_name" varchar(255) NOT NULL,
	"description" text,
	"user_id" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feature_tracking" (
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
CREATE TABLE IF NOT EXISTS "post_dev_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"feature_id" integer NOT NULL,
	"user_adoption_rate" integer DEFAULT 0,
	"impact" text,
	"customer_satisfaction" integer DEFAULT 0,
	"feedback" text,
	"solved_by" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report" (
	"id" serial PRIMARY KEY NOT NULL,
	"reported_by" text NOT NULL,
	"pitch_id" text NOT NULL,
	"report_description" text,
	"scout_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type" text NOT NULL,
	"added_by" text DEFAULT 'system',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "daftar_scouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"scout_id" varchar(255),
	"daftar_id" varchar(255),
	"is_pending" boolean DEFAULT true NOT NULL,
	"added_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"scout_id" varchar(255),
	"faq_question" text NOT NULL,
	"faq_answer" text,
	"faq_added_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scout_approved" (
	"id" serial PRIMARY KEY NOT NULL,
	"investor_id" varchar(255),
	"scout_id" varchar(255),
	"is_approved" boolean DEFAULT false,
	"approved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scout_delete" (
	"investor_id" varchar(255),
	"scout_id" varchar(255),
	"is_agreed" boolean DEFAULT false,
	"agreed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scout_documents" (
	"doc_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doc_name" text DEFAULT '' NOT NULL,
	"doc_url" text NOT NULL,
	"doc_type" text,
	"size" integer,
	"scout_id" varchar(255),
	"daftar_id" varchar(255),
	"uploaded_by" varchar(255),
	"is_private" boolean DEFAULT false,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scout_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"scout_id" varchar(255),
	"scout_question" text NOT NULL,
	"scout_answer_sample_url" text,
	"language" text,
	"is_custom" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scout_updates" (
	"id" serial PRIMARY KEY NOT NULL,
	"scout_id" varchar(255),
	"update_info" text NOT NULL,
	"update_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scouts" (
	"scout_id" varchar(255) PRIMARY KEY NOT NULL,
	"daftar_id" varchar(255),
	"scout_name" text NOT NULL,
	"scout_details" text,
	"target_aud_location" text,
	"target_aud_age_start" integer,
	"target_aud_age_end" integer,
	"targeted_gender" text,
	"scout_community" text,
	"scout_stage" text,
	"investor_pitch" text,
	"compressed_investor_pitch" text,
	"scout_sector" jsonb,
	"is_approved_by_all" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"deleted_on" timestamp,
	"status" text DEFAULT 'Planning',
	"last_day_to_pitch" date,
	"program_launch_date" date,
	"delete_is_agreed_by_all" boolean DEFAULT false,
	"delete_request_date" date,
	"scout_created_at" timestamp DEFAULT now(),
	"is_locked" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "all_urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"is_finished" boolean DEFAULT false NOT NULL,
	"created_date" timestamp,
	"archived_date" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "critical_paths" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"session_start" timestamp DEFAULT now() NOT NULL,
	"session_duration" integer,
	"critical_path" text DEFAULT '' NOT NULL,
	"is_finished" boolean DEFAULT false NOT NULL,
	"session_end" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "url_source" (
	"id" serial PRIMARY KEY NOT NULL,
	"url_id" integer NOT NULL,
	"last_accessed" timestamp DEFAULT now(),
	"source" text NOT NULL,
	"created_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "languages" (
	"id" integer PRIMARY KEY NOT NULL,
	"language_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "unregistered_users" (
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
CREATE TABLE IF NOT EXISTS "user_languages" (
	"user_id" text NOT NULL,
	"language_id" integer NOT NULL,
	CONSTRAINT "user_languages_user_id_language_id_pk" PRIMARY KEY("user_id","language_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_sessions" (
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
CREATE TABLE IF NOT EXISTS "users" (
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
	"is_archived" boolean DEFAULT false NOT NULL,
	"deleted_on" timestamp,
	"journal" text,
	"hour_24_mail" boolean DEFAULT false,
	"day_7_mail" boolean DEFAULT false,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);