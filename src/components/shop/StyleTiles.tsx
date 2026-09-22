
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { styleCategories } from "@/db/schema";

export async function StyleTiles({
  activeSlug,
}: {
  activeSlug?: string;
}) {
  const rows = await db
    .select()
    .from(styleCategories)
    .where(eq(styleCategories.isActive, true))
    .orderBy(asc(styleCategories.sortOrder));

  if (rows.length === 0) return null;

  return (
    <section className="mb-16">
      {/* Section heading */}
      <div className="mb-10 text-center">
        <p className="mb-3 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
          <span className="h-px w-8 bg-black/20" />
          Wolf Theory
          <span className="h-px w-8 bg-black/20" />
        </p>

        <h2 className="font-heading text-4xl font-black uppercase tracking-tighter md:text-6xl">
          Shop by Style
        </h2>

        <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-black/40">
          Find your next essential
        </p>
      </div>

      {/* Style tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((s) => {
          const isActive = activeSlug === s.slug;

          return (
            <Link
              key={s.id}
              href={
                isActive
                  ? "/shop"
                  : `/shop/style/${s.slug}`
              }
              className={`group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-black shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_16px_50px_rgba(0,0,0,0.16)] ${
                isActive
                  ? "ring-2 ring-black ring-offset-2"
                  : ""
              }`}
            >
              {/* Style image */}
              {s.imageUrl && (
                <Image
                  src={s.imageUrl}
                  alt={s.name}
                  fill
                  sizes="(max-width:768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}

              {/* Dark gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              {/* Tile content */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                <div>
                  <p className="font-heading text-xl font-black uppercase tracking-tight text-white">
                    {s.name}
                  </p>

                  {s.subtitle && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                      {s.subtitle}
                    </p>
                  )}
                </div>

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition-colors group-hover:bg-white group-hover:text-black">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

