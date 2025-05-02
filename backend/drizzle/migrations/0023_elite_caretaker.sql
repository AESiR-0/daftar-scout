ALTER TABLE "scout_documents" DROP CONSTRAINT "scout_documents_scout_id_scouts_scout_id_fk";
--> statement-breakpoint
ALTER TABLE "scout_documents" ADD CONSTRAINT "scout_documents_scout_id_scouts_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("scout_id") ON DELETE cascade ON UPDATE no action;