ALTER TABLE "scout_documents" DROP CONSTRAINT "scout_documents_uploaded_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "scout_documents" ADD CONSTRAINT "scout_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;