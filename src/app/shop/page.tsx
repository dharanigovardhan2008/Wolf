import { db } from "@/db";
import { products, productImages, productVariants, colors, styleCategories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ProductCard } from "@/components/product/ProductCard";
import { ShopControls } from "@/components/shop/ShopControls";
import { StyleTiles } from "@/components/shop/StyleTiles";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | WOLF THEORY",
  description: "Browse Wolf Theory's premium custom streetwear collection. Engineered for the driven.",
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    customizable?: string;
    sort?: string;
    q?: string;
    style?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const { category, minPrice, maxPrice, customizable, sort, q, style } = params;

  let allProducts: Array<{
    id: string;
    name: string;
    slug: string;
    basePrice: string;
    actualPrice: string | null;
    isCustomizable: boolean;
    shortDescription: string;
    category: string;
    productType: string;
    styleCategoryId: string | null;
  }> = [];

  try {
    allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        basePrice: products.basePrice,
        actualPrice: products.actualPrice,
        isCustomizable: products.isCustomizable,
        shortDescription: products.shortDescription,
        category: products.category,
        productType: products.productType,
        styleCategoryId: products.styleCategoryId,
      })
      .from(products)
      .where(and(eq(products.status, "PUBLISHED"), eq(products.isArchived, false)));
  } catch (err) {
    console.error("Shop products query error:", err);
    allProducts = [];
  }

  let styleName: string | null = null;
  let byStyle = allProducts;

  if (style) {
    const [match] = await db
      .select()
      .from(styleCategories)
      .where(eq(styleCategories.slug, style))
      .limit(1);
    if (match) {
      styleName = match.name;
      byStyle = allProducts.filter((p) => p.styleCategoryId === match.id);
    } else {
      byStyle = [];
    }
  }

  const filtered = byStyle.filter((p) => {
    if (category && category !== "all" && p.category !== category) return false;
    if (minPrice && parseFloat(p.basePrice) < parseFloat(minPrice)) return false;
    if (maxPrice && parseFloat(p.basePrice) > parseFloat(maxPrice)) return false;
    if (customizable === "true" && !p.isCustomizable) return false;
    if (q) {
      const query = q.toLowerCase();
      return p.name.toLowerCase().includes(query) ||
        p.shortDescription.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.productType.toLowerCase().includes(query);
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return parseFloat(a.basePrice) - parseFloat(b.basePrice);
    if (sort === "price-desc") return parseFloat(b.basePrice) - parseFloat(a.basePrice);
    return 0;
  });

  const productData = await Promise.all(
    sorted.map(async (product) => {
      const imagesList = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(productImages.sortOrder)
        .limit(2);

      const primaryImage = imagesList.find((i) => i.isPrimary) || imagesList[0];
      const secondImage = imagesList.find((i) => i.id !== primaryImage?.id);

      const variantColors = await db
        .select({ color: colors })
        .from(productVariants)
        .innerJoin(colors, eq(productVariants.colorId, colors.id))
        .where(eq(productVariants.productId, product.id));

      const uniqueColors = variantColors.reduce((acc: typeof variantColors, curr) => {
        if (!acc.find((c) => c.color.id === curr.color.id)) acc.push(curr);
        return acc;
      }, []);

      return {
        ...product,
        imageUrl: primaryImage?.url ?? null,
        secondImageUrl: secondImage?.url ?? null,
        imageAlt: primaryImage?.alt ?? product.name,
        colors: uniqueColors.map((vc) => ({
          id: vc.color.id,
          name: vc.color.name,
          hexCode: vc.color.hexCode,
        })),
      };
    })
  );

  const categories: string[] = ["all", ...Array.from(new Set<string>(allProducts.map((p) => p.category)))];

  const StudioGridPattern = () => (
    <div className="fixed inset-0 pointer-events-none z-0 bg-[#fdfdfd]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          backgroundPosition: "center top",
        }}
      />
    </div>
  );

  return (
    <main className="min-h-screen text-black selection:bg-black selection:text-white relative pb-32">
      <StudioGridPattern />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 pt-32">
        <StyleTiles activeSlug={style} />
      </div>

      <header className="relative z-10 pb-12 px-6 lg:px-12 max-w-[1400px] mx-auto border-b border-black/10">
        <div className="max-w-3xl">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-black/50 mb-6 bg-white px-3 py-1.5 rounded-sm border border-black/5 shadow-sm">
            The Collection
          </span>
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
            {q ? (
              <>
                <span className="block text-2xl md:text-4xl text-black/40 mb-2">Results for</span>
                &quot;{q}&quot;
              </>
            ) : styleName ? (
              styleName
            ) : (
              "Shop All."
            )}
          </h1>
          {styleName && (
            <Link
              href="/shop"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-black/5"
            >
              Clear style filter ×
            </Link>
          )}
          {!q && !styleName && (
            <p className="mt-6 text-base md:text-lg text-black/60 font-medium max-w-lg leading-relaxed">
              Explore the collection. Choose your piece. Make it yours.
            </p>
          )}
        </div>
      </header>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 pt-8">
        <ShopControls categories={categories} totalProducts={productData.length} />

        {productData.length === 0 ? (
          <div className="mt-16 py-32 flex flex-col items-center justify-center text-center bg-white/60 backdrop-blur-sm rounded-3xl border border-black/5 shadow-sm">
            <h2 className="font-heading text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
              Nothing Matched.
            </h2>
            <p className="text-black/50 font-medium mb-10 max-w-md">
              The configuration you&apos;re looking for doesn&apos;t exist in our current lineup. Try adjusting your parameters.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-black text-white px-10 py-5 text-xs font-bold tracking-[0.2em] uppercase transition-transform hover:scale-105 active:scale-95 rounded-full shadow-lg shadow-black/10"
            >
              Clear All Filters
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 sm:gap-x-8 sm:gap-y-16">
            {productData.map((product) => (
              <div key={product.id} className="group">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-32 pt-24 border-t border-black/10 flex flex-col items-center text-center">
          <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-black/50 mb-6 bg-white px-4 py-1.5 rounded-full border border-black/5 shadow-sm">
            The Studio
          </span>
          <h2 className="font-heading text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
            Make It <br className="sm:hidden" /> Yours.
          </h2>
          <p className="text-black/60 font-medium mb-10 max-w-md text-lg">
            Don&apos;t just choose a piece. Create it. Design your own statement with our interactive 3D studio.
          </p>
          <Link
            href="/shop?category=Custom+Tee"
            className="inline-flex items-center justify-center bg-white text-black border border-black/10 px-10 py-5 text-xs font-bold tracking-[0.2em] uppercase transition-all hover:border-black hover:bg-neutral-50 active:scale-95 rounded-full shadow-lg shadow-black/5"
          >
            Create Your Tee
            <svg className="w-4 h-4 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}