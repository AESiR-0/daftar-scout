ALTER TABLE "communities" DROP CONSTRAINT "communities_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "focus_sectors" DROP CONSTRAINT "focus_sectors_added_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "investor_pitch" DROP CONSTRAINT "investor_pitch_investor_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "offer_actions" DROP CONSTRAINT "offer_actions_action_taken_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "offers" DROP CONSTRAINT "offers_offer_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "pitch_delete" DROP CONSTRAINT "pitch_delete_founder_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "pitch_team" DROP CONSTRAINT "pitch_team_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "support_requests" DROP CONSTRAINT "support_requests_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "feature_requests" DROP CONSTRAINT "feature_requests_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "report" DROP CONSTRAINT "report_reported_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "report_type" DROP CONSTRAINT "report_type_added_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "scout_delete" DROP CONSTRAINT "scout_delete_investor_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "communities" ADD CONSTRAINT "communities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "focus_sectors" ADD CONSTRAINT "focus_sectors_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_pitch" ADD CONSTRAINT "investor_pitch_investor_id_users_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_actions" ADD CONSTRAINT "offer_actions_action_taken_by_users_id_fk" FOREIGN KEY ("action_taken_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_offer_by_users_id_fk" FOREIGN KEY ("offer_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_delete" ADD CONSTRAINT "pitch_delete_founder_id_users_id_fk" FOREIGN KEY ("founder_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_team" ADD CONSTRAINT "pitch_team_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_requests" ADD CONSTRAINT "feature_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_type" ADD CONSTRAINT "report_type_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_delete" ADD CONSTRAINT "scout_delete_investor_id_users_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;