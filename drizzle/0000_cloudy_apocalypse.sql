CREATE TABLE IF NOT EXISTS "evidence" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"market_id" integer,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"text" text,
	"evidence_type" text DEFAULT 'yes' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "markets" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"initial_evidence" text,
	"starting_odds" numeric NOT NULL,
	"creator_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"participants" integer DEFAULT 0 NOT NULL,
	"total_liquidity" numeric DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"market_id" integer NOT NULL,
	"probability" numeric NOT NULL,
	"amount" numeric NOT NULL,
	"position" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"reputation" integer DEFAULT 0 NOT NULL,
	"upvotes_received" integer DEFAULT 0 NOT NULL,
	"downvotes_received" integer DEFAULT 0 NOT NULL,
	"balance" numeric DEFAULT '1000' NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"evidence_id" integer NOT NULL,
	"is_upvote" boolean NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evidence" ADD CONSTRAINT "evidence_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evidence" ADD CONSTRAINT "evidence_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "markets" ADD CONSTRAINT "markets_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "predictions" ADD CONSTRAINT "predictions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "predictions" ADD CONSTRAINT "predictions_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_evidence_id_evidence_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
