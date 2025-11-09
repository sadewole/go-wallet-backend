CREATE TYPE "public"."application_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'suspended', 'closed');--> statement-breakpoint
CREATE TYPE "public"."timeline_entity_type" AS ENUM('credit_application', 'credit_request');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('drawdown', 'repayment', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "credit_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bvn" text NOT NULL,
	"business_docs" json DEFAULT '[]'::json NOT NULL,
	"application_amount" integer NOT NULL,
	"approved_amount" integer,
	"approved_date" timestamp,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_amount" integer NOT NULL,
	"approved_amount" integer,
	"credit_id" uuid NOT NULL,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_timeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" timeline_entity_type NOT NULL,
	"entity_id" uuid NOT NULL,
	"status" "application_status" NOT NULL,
	"changed_by" uuid,
	"note" text,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"credit_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"type" "transaction_type" NOT NULL,
	"running_balance" integer NOT NULL,
	"description" text,
	"reference" text,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "credit_transactions_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "credits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"limit" integer NOT NULL,
	"spendable_amount" integer NOT NULL,
	"outstanding" integer NOT NULL,
	"available" integer NOT NULL,
	"status" "status" DEFAULT 'active' NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "credits_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "role" DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "credit_id" uuid;--> statement-breakpoint
ALTER TABLE "credit_applications" ADD CONSTRAINT "credit_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_requests" ADD CONSTRAINT "credit_requests_credit_id_credits_id_fk" FOREIGN KEY ("credit_id") REFERENCES "public"."credits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_timeline" ADD CONSTRAINT "credit_timeline_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_credit_id_credits_id_fk" FOREIGN KEY ("credit_id") REFERENCES "public"."credits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credits" ADD CONSTRAINT "credits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_applications_user_id_idx" ON "credit_applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credit_applications_status_idx" ON "credit_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "credit_applications_bvn_idx" ON "credit_applications" USING btree ("bvn");--> statement-breakpoint
CREATE INDEX "credit_applications_created_at_idx" ON "credit_applications" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_applications_user_pending_idx" ON "credit_applications" USING btree ("user_id") WHERE status = 'pending';--> statement-breakpoint
CREATE INDEX "credit_request_credit_id_idx" ON "credit_requests" USING btree ("credit_id");--> statement-breakpoint
CREATE INDEX "credit_request_status_idx" ON "credit_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "credit_request_created_at_idx" ON "credit_requests" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_request_user_pending_idx" ON "credit_requests" USING btree ("credit_id") WHERE status = 'pending';--> statement-breakpoint
CREATE INDEX "credit_timeline_entity_idx" ON "credit_timeline" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "credit_timeline_status_idx" ON "credit_timeline" USING btree ("status");--> statement-breakpoint
CREATE INDEX "credit_timeline_created_at_idx" ON "credit_timeline" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "credit_timeline_changed_by_idx" ON "credit_timeline" USING btree ("changed_by");--> statement-breakpoint
CREATE INDEX "credit_timeline_entity_composite_idx" ON "credit_timeline" USING btree ("entity_type","entity_id","created_at");--> statement-breakpoint
CREATE INDEX "credit_tx_credit_id_idx" ON "credit_transactions" USING btree ("credit_id");--> statement-breakpoint
CREATE INDEX "credit_tx_type_idx" ON "credit_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "credit_tx_created_at_idx" ON "credit_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "credit_tx_reference_idx" ON "credit_transactions" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "credit_tx_credit_created_idx" ON "credit_transactions" USING btree ("credit_id","created_at");--> statement-breakpoint
CREATE INDEX "credits_user_id_idx" ON "credits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credits_status_idx" ON "credits" USING btree ("status");--> statement-breakpoint
CREATE INDEX "credits_user_status_idx" ON "credits" USING btree ("user_id","status");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_credit_id_credits_id_fk" FOREIGN KEY ("credit_id") REFERENCES "public"."credits"("id") ON DELETE no action ON UPDATE no action;