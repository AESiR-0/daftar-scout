ALTER TABLE "scout_approved" DROP CONSTRAINT "scout_approved_investor_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "scout_approved" ADD CONSTRAINT "scout_approved_investor_id_users_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;