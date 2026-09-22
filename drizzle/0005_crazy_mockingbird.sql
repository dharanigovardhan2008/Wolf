ALTER TABLE "product_images" ADD COLUMN "color_id" uuid;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_color_id_colors_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."colors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "images_color_id_idx" ON "product_images" USING btree ("color_id");