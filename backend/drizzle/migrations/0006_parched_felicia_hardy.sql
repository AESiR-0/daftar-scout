ALTER TABLE "investor_answers" RENAME TO "founder_answers";--> statement-breakpoint
ALTER TABLE "founder_answers" DROP CONSTRAINT "investor_answers_pitch_id_pitch_id_fk";
--> statement-breakpoint
ALTER TABLE "founder_answers" DROP CONSTRAINT "investor_answers_question_id_scouts_scout_id_fk";
--> statement-breakpoint
ALTER TABLE "founder_answers" ADD CONSTRAINT "founder_answers_pitch_id_pitch_id_fk" FOREIGN KEY ("pitch_id") REFERENCES "public"."pitch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "founder_answers" ADD CONSTRAINT "founder_answers_question_id_scouts_scout_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."scouts"("scout_id") ON DELETE no action ON UPDATE no action;