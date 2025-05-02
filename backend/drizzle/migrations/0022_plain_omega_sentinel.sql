ALTER TABLE "founder_answers" DROP CONSTRAINT "founder_answers_pitch_id_pitch_id_fk";
--> statement-breakpoint
ALTER TABLE "founder_answers" DROP CONSTRAINT "founder_answers_question_id_scout_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "investor_pitch" DROP CONSTRAINT "investor_pitch_pitch_id_pitch_id_fk";
--> statement-breakpoint
ALTER TABLE "offer_actions" DROP CONSTRAINT "offer_actions_offer_id_offers_id_fk";
--> statement-breakpoint
ALTER TABLE "offers" DROP CONSTRAINT "offers_pitch_id_pitch_id_fk";
--> statement-breakpoint
ALTER TABLE "pitch_delete" DROP CONSTRAINT "pitch_delete_pitch_id_pitch_id_fk";
--> statement-breakpoint
ALTER TABLE "pitch_docs" DROP CONSTRAINT "pitch_docs_pitch_id_pitch_id_fk";
--> statement-breakpoint
ALTER TABLE "pitch_focus_sectors" DROP CONSTRAINT "pitch_focus_sectors_focus_sector_id_focus_sectors_id_fk";
--> statement-breakpoint
ALTER TABLE "pitch_focus_sectors" DROP CONSTRAINT "pitch_focus_sectors_pitch_id_pitch_id_fk";
--> statement-breakpoint
ALTER TABLE "feature_tracking" DROP CONSTRAINT "feature_tracking_feature_id_feature_requests_id_fk";
--> statement-breakpoint
ALTER TABLE "post_dev_analysis" DROP CONSTRAINT "post_dev_analysis_feature_id_feature_requests_id_fk";
--> statement-breakpoint
ALTER TABLE "report" DROP CONSTRAINT "report_pitch_id_pitch_id_fk";
--> statement-breakpoint
ALTER TABLE "report" DROP CONSTRAINT "report_scout_id_scouts_scout_id_fk";
--> statement-breakpoint
ALTER TABLE "report_status" DROP CONSTRAINT "report_status_report_id_report_id_fk";
--> statement-breakpoint
ALTER TABLE "daftar_scouts" DROP CONSTRAINT "daftar_scouts_daftar_id_daftar_id_fk";
--> statement-breakpoint
ALTER TABLE "scout_documents" DROP CONSTRAINT "scout_documents_daftar_id_daftar_id_fk";
--> statement-breakpoint
ALTER TABLE "scouts" DROP CONSTRAINT "scouts_daftar_id_daftar_id_fk";
--> statement-breakpoint
ALTER TABLE "founder_answers" ADD CONSTRAINT "founder_answers_pitch_id_pitch_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."pitch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "founder_answers" ADD CONSTRAINT "founder_answers_question_id_scout_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."scout_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_pitch" ADD CONSTRAINT "investor_pitch_pitch_id_pitch_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."pitch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_actions" ADD CONSTRAINT "offer_actions_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_pitch_id_pitch_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."pitch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_delete" ADD CONSTRAINT "pitch_delete_pitch_id_pitch_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."pitch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_docs" ADD CONSTRAINT "pitch_docs_pitch_id_pitch_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."pitch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_focus_sectors" ADD CONSTRAINT "pitch_focus_sectors_focus_sector_id_focus_sectors_id_fk" FOREIGN KEY ("focus_sector_id") REFERENCES "public"."focus_sectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pitch_focus_sectors" ADD CONSTRAINT "pitch_focus_sectors_pitch_id_pitch_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."pitch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_tracking" ADD CONSTRAINT "feature_tracking_feature_id_feature_requests_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."feature_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_dev_analysis" ADD CONSTRAINT "post_dev_analysis_feature_id_feature_requests_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."feature_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_pitch_id_pitch_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."pitch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_scout_id_scouts_scout_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("scout_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_status" ADD CONSTRAINT "report_status_report_id_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."report"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daftar_scouts" ADD CONSTRAINT "daftar_scouts_daftar_id_daftar_id_fk" FOREIGN KEY ("daftar_id") REFERENCES "public"."daftar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_documents" ADD CONSTRAINT "scout_documents_daftar_id_daftar_id_fk" FOREIGN KEY ("daftar_id") REFERENCES "public"."daftar"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scouts" ADD CONSTRAINT "scouts_daftar_id_daftar_id_fk" FOREIGN KEY ("daftar_id") REFERENCES "public"."daftar"("id") ON DELETE cascade ON UPDATE no action;