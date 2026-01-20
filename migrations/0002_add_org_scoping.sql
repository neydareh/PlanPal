ALTER TABLE "events" ADD COLUMN "org_id" varchar;--> statement-breakpoint
ALTER TABLE "songs" ADD COLUMN "org_id" varchar;--> statement-breakpoint
ALTER TABLE "blockouts" ADD COLUMN "org_id" varchar;--> statement-breakpoint
UPDATE "events"
SET "org_id" = (SELECT "id" FROM "organizations" ORDER BY "created_at" LIMIT 1)
WHERE "org_id" IS NULL;--> statement-breakpoint
UPDATE "songs"
SET "org_id" = (SELECT "id" FROM "organizations" ORDER BY "created_at" LIMIT 1)
WHERE "org_id" IS NULL;--> statement-breakpoint
UPDATE "blockouts"
SET "org_id" = (SELECT "id" FROM "organizations" ORDER BY "created_at" LIMIT 1)
WHERE "org_id" IS NULL;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blockouts" ADD CONSTRAINT "blockouts_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_events_org_id" ON "events" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "IDX_songs_org_id" ON "songs" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "IDX_blockouts_org_id" ON "blockouts" USING btree ("org_id");
