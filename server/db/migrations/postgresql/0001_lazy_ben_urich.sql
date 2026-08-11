ALTER TABLE "subscriptions" ADD COLUMN "trial_duration_days" integer;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "automatic_conversion" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "trial_end_notified_at" timestamp;