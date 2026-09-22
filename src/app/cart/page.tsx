"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, Minus, ArrowRight, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCartStore();

  const subtotal = getTotalPrice();
  const totalItems = getTotalItems();
  
  const freeShippingThreshold = 999;
  const shipping = subtotal >= freeShippingThreshold ? 0 : 99;
  const total = subtotal + shipping;
  
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercentage = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // --- UNIFIED ENGINEERING GRID PATTERN ---
  const StudioGridPattern = () => (
    <div className="fixed inset-0 pointer-events-none z-0 bg-[#fdfdfd]">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          backgroundPosition: 'center top'
        }}
      />
    </div>
  );

  // --- EMPTY STATE ---
  if (items.length === 0) {
    return (
      <main className="min-h-screen text-black selection:bg-black selection:text-white flex flex-col items-center justify-center px-6 py-24 relative">
        <StudioGridPattern />
        
        <div className="relative z-10 text-center max-w-2xl mx-auto flex flex-col items-center">
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-black/60 mb-6 bg-white px-4 py-1.5 rounded-sm border border-black/5 shadow-sm">
            Wolf Theory
          </span>
          <h1 className="font-heading text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
            Your Bag<br />
            <span className="text-black/20">Is Empty.</span>
          </h1>
          <p className="text-lg md:text-xl text-black/60 font-light mb-12 bg-white px-6 py-2.5 rounded-full border border-black/5 shadow-sm">
            Find something worth wearing. The studio is waiting.
          </p>
          <Link
            href="/shop"
            className="group relative inline-flex items-center justify-center gap-3 bg-black text-white px-10 py-5 text-xs font-bold tracking-[0.2em] uppercase transition-transform hover:scale-105 active:scale-95 rounded-full shadow-lg shadow-black/10"
          >
            Explore Collection
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </main>
    );
  }

  // --- POPULATED CART STATE ---
  return (
    <main className="min-h-screen text-black selection:bg-black selection:text-white relative pb-24">
      <StudioGridPattern />
      
      <div className="relative z-10 pt-24 md:pt-32 max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Header - Editorial Style */}
        <header className="mb-12 md:mb-16 flex flex-col gap-4 border-b border-black/5 pb-8">
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-black/50 mb-6 bg-white px-3 py-1.5 border border-black/5 shadow-sm">
              Checkout
            </span>
            <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
              Your <br className="md:hidden" />
              Selection.
            </h1>
          </div>
          <div>
            <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-black/60 bg-white px-4 py-2 border border-black/5 shadow-sm mt-4">
              {totalItems} Piece{totalItems !== 1 ? 's' : ''}
            </span>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-start relative">
          
          {/* LEFT: CART ITEMS */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            <div className="hidden md:grid grid-cols-12 gap-6 pb-4 border-b border-black/5 text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
              <div className="col-span-8">Product</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="flex flex-col">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group py-8 border-b border-black/5 flex flex-col md:grid md:grid-cols-12 gap-6 md:items-center"
                >
                  
                  {/* Product Details */}
                  <div className="md:col-span-8 flex gap-6 sm:gap-8 items-start sm:items-center">
                    <Link href={`/shop/${item.productSlug}`} className="shrink-0 relative w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-xl overflow-hidden block shadow-sm border border-black/5 p-1.5">
                      {item.imageUrl ? (
                        <div className="relative w-full h-full rounded-lg overflow-hidden">
                          <Image
                            src={item.imageUrl}
                            alt={item.productName}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 112px, 128px"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-full h-full rounded-lg"
                          style={{ backgroundColor: item.colorHex }}
                        />
                      )}
                    </Link>

                    <div className="flex flex-col flex-1 min-w-0 py-1">
                      <Link
                        href={`/shop/${item.productSlug}`}
                        className="text-lg sm:text-xl font-black tracking-tight uppercase hover:text-black/70 transition-colors line-clamp-2 mb-2"
                      >
                        {item.productName}
                      </Link>
                      
                      <div className="flex items-center text-xs font-medium text-black/50 mb-3 bg-white w-max px-2.5 py-1 border border-black/5 rounded-sm shadow-sm">
                        <span>{item.colorName}</span>
                        <span className="mx-2 text-black/20">|</span>
                        <span>Size: {item.sizeName}</span>
                      </div>
                      
                      {item.isCustomized && (
                        <div className="inline-flex items-center gap-2 mt-1 bg-white px-2.5 py-1 border border-black/5 rounded-sm shadow-sm w-max">
                          <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
                          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-black">
                            Custom Engineered
                          </span>
                        </div>
                      )}
                      
                      <p className="text-base font-bold mt-4 md:hidden bg-white px-3 py-1 inline-block border border-black/5 rounded-sm shadow-sm">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="md:col-span-2 flex items-center justify-between md:justify-center mt-4 md:mt-0">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 md:hidden">Quantity</span>
                    <div className="inline-flex items-center bg-white border border-black/10 shadow-sm rounded-full h-10 w-28">
                      <button
                        onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex-1 flex justify-center items-center text-black/50 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex-1 flex justify-center items-center text-black/50 hover:text-black transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Total & Remove */}
                  <div className="md:col-span-2 flex items-center justify-between md:justify-end md:flex-col md:items-end gap-4 mt-2 md:mt-0">
                    <p className="hidden md:block text-base font-bold tabular-nums bg-white px-3 py-1.5 border border-black/5 shadow-sm rounded-sm">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="group/btn flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-black/40 hover:text-red-500 transition-colors bg-white px-3 py-1.5 border border-black/5 shadow-sm rounded-sm md:bg-transparent md:border-transparent md:shadow-none md:px-0 md:py-0 md:mt-2"
                    >
                      <X className="w-3 h-3 group-hover/btn:rotate-90 transition-transform" />
                      <span>Remove</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-32 bg-white/80 backdrop-blur-2xl border border-black/5 rounded-3xl p-8 md:p-10 shadow-xl shadow-black/[0.02]">
              <h2 className="font-heading text-2xl font-black uppercase tracking-tight mb-8">
                Order Summary
              </h2>

              <div className="mb-8 p-5 bg-[#fafafa] border border-black/5 rounded-2xl shadow-inner">
                {amountToFreeShipping > 0 ? (
                  <>
                    <p className="text-xs font-medium text-black/80 mb-3">
                      Add <strong className="text-black font-bold tabular-nums">{formatPrice(amountToFreeShipping)}</strong> more to unlock <strong className="text-black">Free Shipping</strong>.
                    </p>
                    <div className="w-full h-1.5 bg-black/5 overflow-hidden rounded-full">
                      <div 
                        className="h-full bg-black transition-all duration-1000 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 text-black">
                    <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shrink-0 shadow-md shadow-black/20">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-xs font-bold tracking-[0.1em] uppercase">
                      Free Shipping Unlocked
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-8 text-sm border-b border-black/10 pb-8">
                <div className="flex justify-between items-center">
                  <span className="text-black/60 font-medium">Subtotal</span>
                  <span className="font-bold tabular-nums">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black/60 font-medium">Shipping</span>
                  <span className="font-bold tabular-nums">
                    {shipping === 0 ? "Complimentary" : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-10">
                <div>
                  <span className="block text-xl font-bold uppercase">Total</span>
                  <span className="block text-[10px] text-black/50 tracking-widest uppercase mt-1 font-semibold">Tax calculated at checkout</span>
                </div>
                <span className="text-3xl font-black tabular-nums">{formatPrice(total)}</span>
              </div>

              <div className="flex flex-col gap-4">
                <Link
                  href="/checkout"
                  className="group relative flex w-full items-center justify-between bg-black px-8 py-5 text-xs font-bold tracking-[0.2em] uppercase text-white transition-transform hover:scale-[1.02] active:scale-[0.98] rounded-full overflow-hidden shadow-lg shadow-black/10"
                >
                  <span className="relative z-10">Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/shop"
                  className="w-full text-center py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-black/50 hover:text-black transition-colors rounded-full border border-transparent hover:border-black/5 bg-transparent hover:bg-white"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}