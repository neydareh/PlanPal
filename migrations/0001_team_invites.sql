CREATE TYPE "public"."team_invite_status" AS ENUM('pending', 'accepted', 'declined', 'expired', 'revoked');--> statement-breakpoint

CREATE TABLE "team_invites" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" varchar NOT NULL,
	"email" varchar NOT NULL,
	"role" "user_role" NOT NULL,
	"member_function" "member_function",
	"message" text,
	"token_hash" varchar NOT NULL,
	"status" "team_invite_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_team_invites_team" ON "team_invites" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "IDX_team_invites_email" ON "team_invites" USING btree ("email");--> statement-breakpoint
CREATE INDEX "IDX_team_invites_status" ON "team_invites" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "IDX_team_invites_token_hash" ON "team_invites" USING btree ("token_hash");
