CREATE TYPE "public"."subscription_status" AS ENUM('active', 'paused', 'canceled');--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "status" "subscription_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "paused_at" date;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "resume_at" date;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "canceled_at" date;