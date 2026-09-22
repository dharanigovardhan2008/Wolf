"use client";

import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: string;
    actualPrice?: string | null;
    isCustomizable: boolean;
    shortDescription: string;
    category?: string;
    imageUrl: string | null;
    secondImageUrl?: string | null;
    imageAlt: string;
    colors: Array<{ id: string; name: string; hexCode: string }>;
  };
  className?: string;
  cardBackground?: string | null; // NEW
}

export function ProductCard({ product, className, cardBackground }: ProductCardProps) {
  const price = parseFloat(product.basePrice);
  const mrp = product.actualPrice ? parseFloat(product.actualPrice) : 0;
  const discount = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;

  return (
    <article className={cn("group", className)}>
      <Link href={`/shop/${product.slug}`} className="block rounded-3xl bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_16px_50px_rgba(0,0,0,0.10)]">
        <div 
          className="relative mb-4 aspect-[4/5] overflow-hidden rounded-2xl"
          style={{ backgroundColor: cardBackground || "transparent" }}
        >
          {product.imageUrl ? (
            <>
              <Image
                src={product.imageUrl}
                alt={product.imageAlt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={cn("object-contain p-6 transition-all duration-500", product.secondImageUrl ? "group-hover:opacity-0" : "group-hover:scale-105")}
              />
              {product.secondImageUrl && (
                <Image src={product.secondImageUrl} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-contain p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center font-heading text-4xl font-black text-black/10">WT</div>
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {discount > 0 && <span className="rounded-full bg-green-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">{discount}% off</span>}
            {product.isCustomizable && (
              <span className="flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                <Pencil className="h-3 w-3" /> Custom
              </span>
            )}
          </div>
        </div>

        <div className="px-2 pb-2">
          {product.category && <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-black/40">{product.category}</p>}
          <h3 className="mb-2 font-heading text-base font-bold leading-tight text-primary">{product.name}</h3>

          <div className="flex items-center justify-between">
            <p className="flex items-baseline gap-2">
              <span className="font-heading text-base font-bold">{formatPrice(price)}</span>
              {discount > 0 && <span className="text-sm text-black/35 line-through">{formatPrice(mrp)}</span>}
            </p>
            {product.colors.length > 0 && (
              <div className="flex items-center gap-1">
                {product.colors.slice(0, 4).map((c) => (
                  <span key={c.id} title={c.name} className="h-3.5 w-3.5 rounded-full border border-black/15" style={{ backgroundColor: c.hexCode }} />
                ))}
                {product.colors.length > 4 && <span className="text-[10px] font-bold text-muted">+{product.colors.length - 4}</span>}
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}