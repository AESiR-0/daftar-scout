ALTER TABLE "pitch_docs" DROP CONSTRAINT "pitch_docs_uploaded_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "pitch_docs" ADD CONSTRAINT "pitch_docs_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;