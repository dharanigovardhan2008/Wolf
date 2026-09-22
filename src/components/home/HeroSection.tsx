import Link from "next/link";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { products, productImages } from "@/db/schema";
import { HeroCarousel, type HeroItem } from "./HeroCarousel";

export async function HeroSection() {
  const live = and(eq(products.status, "PUBLISHED"), eq(products.isArchived, false));

  let rows = await db
    .select()
    .from(products)
    .where(and(live, eq(products.showInHero, true)))
    .orderBy(asc(products.heroOrder), desc(products.createdAt))
    .limit(5);

  // Fallback: latest published products (never a stock photo)
  if (rows.length === 0) {
    rows = await db.select().from(products).where(live).orderBy(desc(products.createdAt)).limit(3);
  }

  if (rows.length === 0) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-heading text-4xl font-extrabold uppercase tracking-tighter">Wolf Theory</h1>
        <p className="text-muted">New drops are coming soon.</p>
        <Link href="/customize" className="rounded-full bg-black px-8 py-4 text-sm font-bold uppercase tracking-widest text-white">
          Customize a tee
        </Link>
      </section>
    );
  }

  const imgs = await db.select().from(productImages).where(inArray(productImages.productId, rows.map((r) => r.id)));
  const mainImage = (id: string) =>
    (imgs.find((i) => i.productId === id && i.isPrimary) ??
      imgs.filter((i) => i.productId === id).sort((a, b) => a.sortOrder - b.sortOrder)[0])?.url ?? null;

  const items: HeroItem[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.shortDescription,
    category: r.category,
    image: mainImage(r.id),
    price: parseFloat(r.basePrice),
    actualPrice: r.actualPrice ? parseFloat(r.actualPrice) : null,
  }));

  return <HeroCarousel items={items} />;
}