import { notFound } from "next/navigation";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  products,
  productImages,
  productVariants,
  colors,
  sizes,
  fabrics,
  styleCategories,
  storeSettings,
} from "@/db/schema";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product) {
    return {
      title: "Product Not Found | WOLF THEORY",
    };
  }

  return {
    title: product.seoTitle || `${product.name} | WOLF THEORY`,
    description: product.seoDescription || product.shortDescription,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // Fetch product
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product || product.isArchived || product.status !== "PUBLISHED") {
    notFound();
  }

  // Fetch images with colorId
  const images = await db
    .select({
      id: productImages.id,
      url: productImages.url,
      alt: productImages.alt,
      isPrimary: productImages.isPrimary,
      sortOrder: productImages.sortOrder,
      colorId: productImages.colorId,
    })
    .from(productImages)
    .where(eq(productImages.productId, product.id))
    .orderBy(productImages.sortOrder);

  // Fetch variants - only available ones
  const variantRows = await db
    .select({
      id: productVariants.id,
      sku: productVariants.sku,
      stock: productVariants.stock,
      isAvailable: productVariants.isAvailable,
      priceAdjustment: productVariants.priceAdjustment,
      colorId: productVariants.colorId,
      sizeId: productVariants.sizeId,
    })
    .from(productVariants)
    .where(eq(productVariants.productId, product.id));

  // Get unique color IDs and size IDs from variants
  const colorIds = [...new Set(variantRows.map((v) => v.colorId))];
  const sizeIds = [...new Set(variantRows.map((v) => v.sizeId))];

  // Fetch colors
  const productColors =
    colorIds.length > 0
      ? await db
          .select()
          .from(colors)
          .where(inArray(colors.id, colorIds))
      : [];

  // Fetch sizes
  const productSizes =
    sizeIds.length > 0
      ? await db
          .select()
          .from(sizes)
          .where(inArray(sizes.id, sizeIds))
          .orderBy(sizes.sortOrder)
      : [];

  // Build variants with color and size data
  const variants = variantRows.map((v) => {
    const color = productColors.find((c) => c.id === v.colorId);
    const size = productSizes.find((s) => s.id === v.sizeId);
    return {
      id: v.id,
      sku: v.sku,
      colorId: v.colorId,
      sizeId: v.sizeId,
      priceAdjustment: v.priceAdjustment,
      stock: v.stock,
      isAvailable: v.isAvailable,
      color: color
        ? { id: color.id, name: color.name, hexCode: color.hexCode }
        : { id: "", name: "Unknown", hexCode: "#000000" },
      size: size
        ? { id: size.id, name: size.name }
        : { id: "", name: "Unknown" },
    };
  });

  // Fetch fabric info if exists
  let fabric = null;
  if (product.fabricId) {
    [fabric] = await db
      .select()
      .from(fabrics)
      .where(eq(fabrics.id, product.fabricId))
      .limit(1);
  }

  // Fetch store settings for free shipping threshold
  const [settings] = await db.select().from(storeSettings).limit(1);

  // Prepare data for client component
  const productData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    basePrice: product.basePrice,
    actualPrice: product.actualPrice,
    customizationPrice: product.customizationPrice,
    isCustomizable: product.isCustomizable,
    gsm: product.gsm,
    productType: product.productType,
    category: product.category,
  };

  const imagesData = images.map((img) => ({
    id: img.id,
    url: img.url,
    alt: img.alt,
    isPrimary: img.isPrimary,
    colorId: img.colorId, // Include colorId for image-color sync
  }));

  const colorsData = productColors.map((c) => ({
    id: c.id,
    name: c.name,
    hexCode: c.hexCode,
  }));

  const sizesData = productSizes.map((s) => ({
    id: s.id,
    name: s.name,
    sortOrder: s.sortOrder,
  }));

  const fabricData = fabric
    ? {
        name: fabric.name,
        description: fabric.description,
        composition: fabric.composition,
        gsm: fabric.gsm,
      }
    : null;

  return (
    <ProductDetailClient
      product={productData}
      images={imagesData}
      variants={variants}
      colors={colorsData}
      sizes={sizesData}
      fabric={fabricData}
      freeShippingThreshold={
        settings?.freeShippingThreshold
          ? parseFloat(settings.freeShippingThreshold)
          : null
      }
    />
  );
}