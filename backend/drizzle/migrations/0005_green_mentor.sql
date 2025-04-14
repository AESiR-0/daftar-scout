ALTER TABLE "scout_documents" ADD COLUMN "size" integer;--> statement-breakpoint
ALTER TABLE "scout_documents" ADD COLUMN "daftar_id" varchar(255);--> statement-breakpoint
ALTER TABLE "scout_documents" ADD CONSTRAINT "scout_documents_daftar_id_daftar_id_fk" FOREIGN KEY ("daftar_id") REFERENCES "public"."daftar"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_documents" ADD CONSTRAINT "scout_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;