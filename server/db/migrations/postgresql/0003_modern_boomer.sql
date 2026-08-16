ALTER TABLE "subscriptions" ADD COLUMN "annual_price" integer;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "suggestion_dismissed_at" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "suggestion_dismissed_amount" integer;