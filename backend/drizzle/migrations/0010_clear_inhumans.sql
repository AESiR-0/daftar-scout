CREATE TABLE "support_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"support_name" varchar(255) NOT NULL,
	"description" text,
	"user_id" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;