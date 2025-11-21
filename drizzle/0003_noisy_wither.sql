ALTER TABLE "credit_applications" RENAME TO "limit_applications";--> statement-breakpoint
ALTER TABLE "limit_applications" RENAME COLUMN "user_id" TO "credit_id";--> statement-breakpoint
ALTER TABLE "limit_applications" DROP CONSTRAINT "credit_applications_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "credit_applications_user_id_idx";--> statement-breakpoint
DROP INDEX "credit_applications_status_idx";--> statement-breakpoint
DROP INDEX "credit_applications_bvn_idx";--> statement-breakpoint
DROP INDEX "credit_applications_created_at_idx";--> statement-breakpoint
DROP INDEX "credit_applications_user_pending_idx";--> statement-breakpoint
ALTER TABLE "limit_applications" ADD CONSTRAINT "limit_applications_credit_id_credits_id_fk" FOREIGN KEY ("credit_id") REFERENCES "public"."credits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "limit_applications_credit_id_idx" ON "limit_applications" USING btree ("credit_id");--> statement-breakpoint
CREATE INDEX "limit_applications_status_idx" ON "limit_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "limit_applications_bvn_idx" ON "limit_applications" USING btree ("bvn");--> statement-breakpoint
CREATE INDEX "limit_applications_created_at_idx" ON "limit_applications" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "limit_applications_credit_pending_idx" ON "limit_applications" USING btree ("credit_id") WHERE status = 'pending';