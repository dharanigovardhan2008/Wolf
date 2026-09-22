import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, inArray, count } from "drizzle-orm"; // added count
import { db } from "@/db";
import { products, productImages, productVariants, colors, sizes } from "@/db/schema";
import { auth } from "@/lib/auth";

const schema = z
  .object({
    name: z.string().trim().min(2).max(150),
    slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/),
    category: z.string().min(1),
    productType: z.string().min(1),
    shortDescription: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1),
    actualPrice: z.number().positive().nullable(),
    basePrice: z.number().positive(),
    customizationPrice: z.number().min(0),
    fabricId: z.string().uuid().nullable(),
    gsm: z.number().int().positive().nullable(),
    isCustomizable: z.boolean(),
    isFeatured: z.boolean(),
    showInHero: z.boolean().default(false), // ADDED
    heroOrder: z.number().int().min(1).max(5).nullable().optional(), // ADDED
    status: z.enum(["DRAFT", "PUBLISHED"]),
    seoTitle: z.string().nullable(),
    seoDescription: z.string().nullable(),
    images: z.array(z.object({ url: z.string().url() })).max(8),
    variants: z.array(
      z.object({ colorId: z.string().uuid(), sizeId: z.string().uuid(), stock: z.number().int().min(0) })
    ),
  })
  .refine((d) => d.actualPrice === null || d.basePrice <= d.actualPrice, {
    message: "Final price cannot be higher than the actual price",
  });

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const d = parsed.data;

  if (d.status === "PUBLISHED" && (d.images.length === 0 || d.variants.length === 0)) {
    return NextResponse.json({ error: "Published products need images, colors and sizes" }, { status: 400 });
  }

  const existing = await db.select({ id: products.id }).from(products).where(eq(products.slug, d.slug)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "That URL slug is already used. Change it and try again." }, { status: 409 });
  }

  // Enforce Max 5 limit for the Hero Section
  if (d.showInHero) {
    const [c] = await db.select({ count: count() }).from(products)
      .where(eq(products.showInHero, true));
    
    if (c.count >= 5) return NextResponse.json({ error: "Only 5 products can be in the hero. Remove one first." }, { status: 400 });
  }

  let productId: string | null = null;
  try {
    const [created] = await db
      .insert(products)
      .values({
        name: d.name,
        slug: d.slug,
        description: d.description,
        shortDescription: d.shortDescription,
        category: d.category,
        productType: d.productType,
        basePrice: d.basePrice.toFixed(2),
        actualPrice: d.actualPrice !== null ? d.actualPrice.toFixed(2) : null,
        customizationPrice: d.customizationPrice.toFixed(2),
        fabricId: d.fabricId,
        gsm: d.gsm,
        isCustomizable: d.isCustomizable,
        isFeatured: d.isFeatured,
        showInHero: d.showInHero, // ADDED
        heroOrder: d.heroOrder ?? null, // ADDED
        status: d.status,
        seoTitle: d.seoTitle,
        seoDescription: d.seoDescription,
      })
      .returning({ id: products.id });
    productId = created.id;

    if (d.images.length > 0) {
      await db.insert(productImages).values(
        d.images.map((img, i) => ({
          productId: created.id,
          url: img.url,
          alt: d.name,
          sortOrder: i,
          isPrimary: i === 0,
        }))
      );
    }

    if (d.variants.length > 0) {
      const colorRows = await db.select().from(colors).where(inArray(colors.id, d.variants.map((v) => v.colorId)));
      const sizeRows = await db.select().from(sizes).where(inArray(sizes.id, d.variants.map((v) => v.sizeId)));
      const code = d.slug.toUpperCase().replace(/-/g, "").slice(0, 10);
      const tag = Math.random().toString(36).slice(2, 6).toUpperCase();

      await db.insert(productVariants).values(
        d.variants.map((v) => {
          const c = colorRows.find((x) => x.id === v.colorId)?.name ?? "C";
          const s = sizeRows.find((x) => x.id === v.sizeId)?.name ?? "S";
          return {
            productId: created.id,
            sku: `${code}-${tag}-${c}-${s}`.toUpperCase().replace(/[^A-Z0-9-]/g, ""),
            colorId: v.colorId,
            sizeId: v.sizeId,
            stock: v.stock,
          };
        })
      );
    }

    revalidatePath("/"); // Update home hero cache
    revalidatePath("/shop");
    
    return NextResponse.json({ id: created.id });
  } catch (err) {
    if (productId) await db.delete(products).where(eq(products.id, productId)).catch(() => {});
    return NextResponse.json({ error: "Could not save the product. Please try again." }, { status: 500 });
  }
}