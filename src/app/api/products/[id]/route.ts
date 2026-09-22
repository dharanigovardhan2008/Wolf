import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, eq, inArray, ne, count } from "drizzle-orm"; // added count
import { db } from "@/db";
import { products, productImages, productVariants, colors, sizes } from "@/db/schema";
import { auth } from "@/lib/auth";

const patchSchema = z
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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const d = parsed.data;

  if (d.status === "PUBLISHED" && (d.images.length === 0 || d.variants.length === 0)) {
    return NextResponse.json({ error: "Published products need images, colors and sizes" }, { status: 400 });
  }

  const clash = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.slug, d.slug), ne(products.id, id)))
    .limit(1);
  if (clash.length > 0) {
    return NextResponse.json({ error: "That URL slug is already used by another product." }, { status: 409 });
  }

  if (d.showInHero) {
    const [c] = await db.select({ count: count() }).from(products)
      .where(and(eq(products.showInHero, true), ne(products.id, id)));
    
    if (c.count >= 5) return NextResponse.json({ error: "Only 5 products can be in the hero. Remove one first." }, { status: 400 });
  }

  try {
    await db
      .update(products)
      .set({
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
        isArchived: false,
        seoTitle: d.seoTitle,
        seoDescription: d.seoDescription,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    await db.delete(productImages).where(eq(productImages.productId, id));
    if (d.images.length > 0) {
      await db.insert(productImages).values(
        d.images.map((img, i) => ({
          productId: id,
          url: img.url,
          alt: d.name,
          sortOrder: i,
          isPrimary: i === 0,
        }))
      );
    }

    const existing = await db.select().from(productVariants).where(eq(productVariants.productId, id));
    const key = (c: string, s: string) => `${c}:${s}`;
    const wanted = new Set(d.variants.map((v) => key(v.colorId, v.sizeId)));

    for (const v of existing) {
      if (!wanted.has(key(v.colorId, v.sizeId)) && v.isAvailable) {
        await db.update(productVariants).set({ isAvailable: false, stock: 0, updatedAt: new Date() }).where(eq(productVariants.id, v.id));
      }
    }

    const toInsert: typeof d.variants = [];
    for (const v of d.variants) {
      const match = existing.find((e) => e.colorId === v.colorId && e.sizeId === v.sizeId);
      if (match) {
        await db
          .update(productVariants)
          .set({ stock: v.stock, isAvailable: true, updatedAt: new Date() })
          .where(eq(productVariants.id, match.id));
      } else {
        toInsert.push(v);
      }
    }

    if (toInsert.length > 0) {
      const colorRows = await db.select().from(colors).where(inArray(colors.id, toInsert.map((v) => v.colorId)));
      const sizeRows = await db.select().from(sizes).where(inArray(sizes.id, toInsert.map((v) => v.sizeId)));
      const code = d.slug.toUpperCase().replace(/-/g, "").slice(0, 10);
      const tag = Math.random().toString(36).slice(2, 6).toUpperCase();
      await db.insert(productVariants).values(
        toInsert.map((v) => {
          const c = colorRows.find((x) => x.id === v.colorId)?.name ?? "C";
          const s = sizeRows.find((x) => x.id === v.sizeId)?.name ?? "S";
          return {
            productId: id,
            sku: `${code}-${tag}-${c}-${s}`.toUpperCase().replace(/[^A-Z0-9-]/g, ""),
            colorId: v.colorId,
            sizeId: v.sizeId,
            stock: v.stock,
          };
        })
      );
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/shop/${d.slug}`);
    return NextResponse.json({ id });
  } catch (err) {
    return NextResponse.json({ error: "Could not update the product. Please try again." }, { status: 500 });
  }
}