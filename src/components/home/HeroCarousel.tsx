"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export type HeroItem = {
  id: string; slug: string; name: string; description: string; category: string;
  image: string | null; price: number; actualPrice: number | null;
};

function Tee({ src, alt, priority }: { src: string | null; alt: string; priority?: boolean }) {
  return src ? (
    <Image src={src} alt={alt} fill priority={priority} fetchPriority={priority ? "high" : "auto"} sizes="(max-width:768px) 80vw, 450px" className="object-contain drop-shadow-2xl" />
  ) : (
    <div className="flex h-full w-full items-center justify-center font-heading text-6xl font-black text-black/10">WT</div>
  );
}

export function HeroCarousel({ items }: { items: HeroItem[] }) {
  const [i, setI] = useState(0);
  const n = items.length;
  const multi = n > 1;
  const go = (d: number) => setI((p) => (p + d + n) % n);
  const cur = items[i];
  const prev = items[(i - 1 + n) % n];
  const next = items[(i + 1) % n];
  const discount = cur.actualPrice && cur.actualPrice > cur.price ? Math.round((1 - cur.price / cur.actualPrice) * 100) : 0;
  const watermark = (cur.category.split(" ").pop() ?? "TEES").toUpperCase();

  return (
    <section className="relative flex min-h-[600px] w-full items-center justify-center overflow-hidden py-24 md:h-[85vh]">
      <AnimatePresence mode="wait">
        <motion.span
          key={watermark}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
          aria-hidden
          className="pointer-events-none absolute select-none font-heading text-[10rem] font-black tracking-tighter text-black/[0.04] md:text-[22rem]"
        >
          {watermark}
        </motion.span>
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-6 md:flex-row">
        <div className="order-2 flex flex-col items-start gap-5 md:order-1 md:w-2/5">
          <AnimatePresence mode="wait">
            <motion.div key={cur.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }}>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">{cur.category}</p>
              <h1 className="mb-4 font-heading text-4xl font-extrabold uppercase leading-[0.95] tracking-tighter md:text-6xl">{cur.name}</h1>
              <p className="max-w-sm text-sm leading-relaxed text-muted">{cur.description}</p>
              <p className="mt-5 flex items-baseline gap-3 font-heading">
                <span className="text-2xl font-bold">{formatPrice(cur.price)}</span>
                {discount > 0 && (
                  <>
                    <span className="text-base text-black/35 line-through">{formatPrice(cur.actualPrice!)}</span>
                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">{discount}% off</span>
                  </>
                )}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-4">
            <Link href={`/shop/${cur.slug}`} className="rounded-full bg-black px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-black/90">
              Explore more
            </Link>
            {multi && (
              <div className="flex gap-2">
                <button onClick={() => go(-1)} aria-label="Previous product" className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 hover:bg-black/5"><ArrowLeft className="h-5 w-5" /></button>
                <button onClick={() => go(1)} aria-label="Next product" className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 hover:bg-black/5"><ArrowRight className="h-5 w-5" /></button>
              </div>
            )}
          </div>
        </div>

        <div className="relative order-1 flex h-[340px] w-full items-center justify-center md:order-2 md:h-[520px] md:w-3/5">
          {multi && (
            <>
              <div className="absolute left-0 hidden aspect-square w-40 scale-75 opacity-40 blur-sm md:block lg:w-56"><Tee src={prev.image} alt="" /></div>
              <div className="absolute right-0 hidden aspect-square w-40 scale-75 opacity-40 blur-sm md:block lg:w-56"><Tee src={next.image} alt="" /></div>
            </>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={cur.id}
              initial={{ opacity: 0, scale: 0.85, x: 40 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.85, x: -40 }}
              transition={{ duration: 0.5 }}
              drag={multi ? "x" : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2}
              onDragEnd={(_, info) => { if (info.offset.x < -60) go(1); else if (info.offset.x > 60) go(-1); }}
              className="relative z-20 aspect-square w-full max-w-[300px] cursor-grab md:max-w-[460px]"
            >
              <Tee src={cur.image} alt={cur.name} priority />
              <div className="pointer-events-none absolute -bottom-6 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-[100%] bg-black/10 blur-xl" />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}