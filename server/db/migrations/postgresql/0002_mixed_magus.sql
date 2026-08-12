ALTER TABLE "subscriptions" RENAME COLUMN "name" TO "service";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "description" text;