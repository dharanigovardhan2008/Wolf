CREATE TABLE "style_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"subtitle" text,
	"image_url" text,
	"image_public_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "style_category_id" uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "style_categories_slug_idx" ON "style_categories" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_style_category_id_style_categories_id_fk" FOREIGN KEY ("style_category_id") REFERENCES "public"."style_categories"("id") ON DELETE no action ON UPDATE no action;