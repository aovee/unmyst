CREATE TYPE "public"."price_history_source" AS ENUM('manual', 'import', 'correction');--> statement-breakpoint
CREATE TABLE "subscription_price_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"cycle" "cycle" NOT NULL,
	"share_count" integer DEFAULT 1 NOT NULL,
	"effective_from" date NOT NULL,
	"effective_to" date,
	"source" "price_history_source" DEFAULT 'manual' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscription_price_history" ADD CONSTRAINT "subscription_price_history_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "price_history_one_open_per_sub" ON "subscription_price_history" USING btree ("subscription_id") WHERE "subscription_price_history"."effective_to" is null;--> statement-breakpoint
-- Backfill: seed one open period per existing subscription, starting at its anchor date.
INSERT INTO "subscription_price_history"
	("subscription_id", "amount", "currency", "cycle", "share_count", "effective_from", "effective_to", "source")
SELECT "id", "amount", "currency", "cycle", "share_count", "anchor_date", NULL, 'manual'
FROM "subscriptions";