CREATE TABLE "video_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" varchar(255) NOT NULL,
	"user_id" varchar(255),
	"s3_key" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"logs" text,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"scout_id" varchar(255),
	"pitch_id" varchar(255),
	CONSTRAINT "video_jobs_job_id_unique" UNIQUE("job_id")
);
