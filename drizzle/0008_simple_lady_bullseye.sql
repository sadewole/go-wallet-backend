DROP INDEX "credit_request_user_pending_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "credit_request_credit_pending_idx" ON "credit_requests" USING btree ("credit_id") WHERE status = 'pending';