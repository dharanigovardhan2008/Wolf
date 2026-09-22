import { notFound } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { products, productImages, productVariants, fabrics, colors, sizes, styleCategories } from "@/db/schema";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Product — Wolf Theory Admin" };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const [p] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!p) notFound();

  const imgs = await db.select().from(productImages).where(eq(productImages.productId, id));
  const vars = await db.select().from(productVariants).where(eq(productVariants.productId, id));
  
  // NEW: Fetch active styles
  const activeStyles = await db.select().from(styleCategories).where(eq(styleCategories.isActive, true)).orderBy(asc(styleCategories.sortOrder));
  
  const allFabrics = await db.select().from(fabrics);
  const allColors = await db.select().from(colors).orderBy(colors.sortOrder);
  const allSizes = await db.select().from(sizes).orderBy(sizes.sortOrder);

  const active = vars.filter((v) => v.isAvailable);
  const num = (v: string | null) => (v === null ? "" : String(parseFloat(v)));

  const initial = {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    styleCategoryId: p.styleCategoryId ?? "", // Assuming you have this field available per DB schemas requirement
    productType: p.productType,
    shortDescription: p.shortDescription,
    description: p.description,
    actualPrice: num(p.actualPrice),
    basePrice: num(p.basePrice),
    customizationPrice: num(p.customizationPrice),
    fabricId: p.fabricId ?? "",
    gsm: p.gsm ? String(p.gsm) : "",
    isCustomizable: p.isCustomizable,
    isFeatured: p.isFeatured,
    showInHero: p.showInHero ?? false,
    heroOrder: p.heroOrder ? String(p.heroOrder) : "",
    seoTitle: p.seoTitle ?? "",
    seoDescription: p.seoDescription ?? "",
    images: imgs
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder)
      .map((i) => ({ url: i.url, publicId: i.url })),
    selColors: [...new Set(active.map((v) => v.colorId))],
    selSizes: [...new Set(active.map((v) => v.sizeId))],
    stock: Object.fromEntries(active.map((v) => [`${v.colorId}:${v.sizeId}`, String(v.stock)])),
  };

  return (
    <div className="max-w-4xl p-6 text-[#111] md:p-8">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold">Edit Product</h1>
        <p className="text-sm text-gray-500">{p.name}</p>
      </div>
      <AdminProductForm
        product={initial as any}
        fabrics={allFabrics.map((f) => ({ id: f.id, name: f.name }))}
        colors={allColors.map((c) => ({ id: c.id, name: c.name, hexCode: c.hexCode }))}
        sizes={allSizes.map((s) => ({ id: s.id, name: s.name }))}
        styles={activeStyles.map(s => ({ id: s.id, name: s.name }))} // NEW
      />
    </div>
  );
}