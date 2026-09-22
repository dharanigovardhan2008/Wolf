import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { products, productImages, productVariants, colors, sizes } from "@/db/schema";
import { auth } from "@/lib/auth";

const createSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/),
    category: z.string().min(1),
    styleCategoryId: z.string().uuid().nullable().optional(),
    productType: z.string().min(1),
    shortDescription: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1),
    actualPrice: z.coerce.number().positive().nullable().optional(),
    basePrice: z.coerce.number().positive(),
    customizationPrice: z.coerce.number().min(0),
    fabricId: z.string().uuid().nullable().optional(),
    gsm: z.coerce.number().int().positive().nullable().optional(),
    isCustomizable: z.boolean(),
    isFeatured: z.boolean(),
    status: z.enum(["DRAFT", "PUBLISHED"]),
    seoTitle: z.string().nullable().optional(),
    seoDescription: z.string().nullable().optional(),
    images: z
      .array(
        z.object({
          url: z.string().url(),
          colorId: z.string().uuid().nullable().optional(),
        })
      )
      .max(8)
      .optional()
      .default([]),
    variants: z
      .array(
        z.object({ 
          colorId: z.string().uuid(), 
          sizeId: z.string().uuid(), 
          stock: z.coerce.number().int().min(0)
        })
      )
      .optional()
      .default([]),
  })
  .refine((d) => !d.actualPrice || d.basePrice <= d.actualPrice, {
    message: "Final price cannot be higher than the actual price",
  });

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    console.error("Product POST validation failed:", JSON.stringify(parsed.error.issues, null, 2));
    console.error("Body received:", JSON.stringify(body, null, 2));
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const d = parsed.data;

  if (d.status === "PUBLISHED" && (d.images.length === 0 || d.variants.length === 0)) {
    return NextResponse.json({ error: "Published products need images, colors and sizes" }, { status: 400 });
  }

  const clash = await db.select({ id: products.id }).from(products).where(eq(products.slug, d.slug)).limit(1);
  if (clash.length > 0) {
    return NextResponse.json({ error: "That URL slug is already used by another product." }, { status: 409 });
  }

  try {
    const [created] = await db
      .insert(products)
      .values({
        name: d.name,
        slug: d.slug,
        description: d.description,
        shortDescription: d.shortDescription,
        category: d.category,
        styleCategoryId: d.styleCategoryId ?? null,
        productType: d.productType,
        basePrice: d.basePrice.toFixed(2),
        actualPrice: d.actualPrice != null ? d.actualPrice.toFixed(2) : null,
        customizationPrice: d.customizationPrice.toFixed(2),
        fabricId: d.fabricId ?? null,
        gsm: d.gsm ?? null,
        isCustomizable: d.isCustomizable,
        isFeatured: d.isFeatured,
        status: d.status,
        isArchived: false,
        seoTitle: d.seoTitle ?? null,
        seoDescription: d.seoDescription ?? null,
      })
      .returning({ id: products.id });

    const id = created.id;

    if (d.images.length > 0) {
      await db.insert(productImages).values(
        d.images.map((img, i) => ({
          productId: id,
          url: img.url,
          alt: d.name,
          colorId: img.colorId ?? null,
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
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error("create product failed", err);
    return NextResponse.json({ error: "Could not create the product. Please try again." }, { status: 500 });
  }
}