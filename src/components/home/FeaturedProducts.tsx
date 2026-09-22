import Link from "next/link";
import { db } from "@/db";
import { products, productImages, productVariants, colors } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ProductCard } from "@/components/product/ProductCard";
import { ArrowRight } from "lucide-react";

export async function FeaturedProducts() {
  let productData: Array<{
    id: string;
    name: string;
    slug: string;
    basePrice: string;
    isCustomizable: boolean;
    shortDescription: string;
    imageUrl: string | null;
    imageAlt: string;
    colors: Array<{ id: string; name: string; hexCode: string }>;
  }> = [];

  try {
    const featuredProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        basePrice: products.basePrice,
        isCustomizable: products.isCustomizable,
        shortDescription: products.shortDescription,
      })
      .from(products)
      .where(and(eq(products.isFeatured, true), eq(products.status, "PUBLISHED")))
      .limit(4);

    productData = await Promise.all(
      featuredProducts.map(async (product: (typeof featuredProducts)[0]) => {
        const [primaryImage] = await db
          .select()
          .from(productImages)
          .where(and(eq(productImages.productId, product.id), eq(productImages.isPrimary, true)))
          .limit(1);

        const variantColors = await db
          .select({ color: colors })
          .from(productVariants)
          .innerJoin(colors, eq(productVariants.colorId, colors.id))
          .where(eq(productVariants.productId, product.id));

        const uniqueColors = variantColors.reduce(
          (acc: typeof variantColors, curr: (typeof variantColors)[0]) => {
            if (!acc.find((c: (typeof variantColors)[0]) => c.color.id === curr.color.id)) acc.push(curr);
            return acc;
          },
          []
        );

        return {
          ...product,
          imageUrl: primaryImage?.url ?? null,
          imageAlt: primaryImage?.alt ?? product.name,
          colors: uniqueColors.map((vc: (typeof variantColors)[0]) => ({
            id: vc.color.id,
            name: vc.color.name,
            hexCode: vc.color.hexCode,
          })),
        };
      })
    );
  } catch (err) {
    console.error("FeaturedProducts query error:", err);
    productData = [];
  }

  if (productData.length === 0) {
    return null;
  }

  return (
    <section className="py-24 px-8 border-t border-black/5" aria-labelledby="featured-heading">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted mb-4">The Collection</p>
          <h2
            id="featured-heading"
            className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-primary leading-none"
          >
            Featured Drops
          </h2>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center bg-transparent border border-black/20 text-black hover:bg-black/5 rounded-full px-8 py-3 text-[10px] font-bold tracking-widest uppercase transition-all"
        >
          View All Products
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {productData.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
