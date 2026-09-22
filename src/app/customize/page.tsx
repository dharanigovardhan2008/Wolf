import Link from "next/link";
import Image from "next/image";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { products, productImages } from "@/db/schema";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CustomizeIndexPage() {
  const rows = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.isCustomizable, true),
        eq(products.status, "PUBLISHED"),
        eq(products.isArchived, false)
      )
    )
    .orderBy(desc(products.createdAt));

  const imgs = rows.length
    ? await db.select().from(productImages).where(inArray(productImages.productId, rows.map((r) => r.id)))
    : [];
  const mainImage = (id: string) =>
    (imgs.find((i) => i.productId === id && i.isPrimary) ?? imgs.find((i) => i.productId === id))?.url;

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-36">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Step 1</p>
      <h1 className="mb-2 font-heading text-4xl font-extrabold tracking-tight md:text-5xl">Choose your tee</h1>
      <p className="mb-10 text-black/60">Pick a base tee, then add your design, text and colors.</p>

      {rows.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <p className="mb-4 text-black/60">No customizable tees are available yet.</p>
          <Link href="/shop" className="rounded-full bg-black px-8 py-4 text-sm font-bold uppercase tracking-widest text-white">Shop tees</Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {rows.map((p) => {
            const img = mainImage(p.id);
            return (
              <li key={p.id}>
                <Link href={`/customize/${p.id}`} className="block rounded-3xl bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_16px_50px_rgba(0,0,0,0.10)]">
                  <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-2xl bg-[#f3f3f4]">
                    {img && <Image src={img} alt={p.name} fill sizes="25vw" className="object-contain p-6" />}
                  </div>
                  <p className="px-2 font-heading font-bold">{p.name}</p>
                  <p className="px-2 pb-2 text-sm text-black/60">From {formatPrice(parseFloat(p.basePrice))}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}