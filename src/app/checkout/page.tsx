"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/components/ui/Toaster";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ArrowRight } from "lucide-react";

const checkoutSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid pincode is required").max(6),
  country: z.string().min(1).default("India"),
  gstNumber: z.string().optional(),
  companyName: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

// --- ENGINEERING GRID PATTERN ---
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

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    defaultValues: { country: "India" },
  });

  const subtotal = getTotalPrice();
  const freeShippingThreshold = 999;
  const shipping = subtotal >= freeShippingThreshold ? 0 : 99;
  const total = subtotal + shipping;

  async function onSubmit(data: CheckoutForm) {
    if (items.length === 0) {
      toast("Your cart is empty", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            isCustomized: item.isCustomized,
          })),
          shipping: data,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        toast(result.error?.message ?? "Failed to create order", "error");
        setIsProcessing(false);
        return;
      }

      clearCart();
      router.push(`/order-success?orderId=${result.data.orderId}&orderNumber=${result.data.orderNumber}`);
    } catch {
      toast("Something went wrong. Please try again.", "error");
      setIsProcessing(false);
    }
  }

  // --- EMPTY STATE ---
  if (items.length === 0) {
    return (
      <main className="min-h-screen text-black selection:bg-black selection:text-white flex flex-col items-center justify-center px-6 py-24 relative">
        <StudioGridPattern />
        <div className="relative z-10 text-center max-w-2xl mx-auto flex flex-col items-center">
          <h1 className="font-heading text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
            Nothing to<br />
            <span className="text-black/20">Checkout.</span>
          </h1>
          <Link
            href="/shop"
            className="group relative inline-flex items-center justify-center gap-3 bg-black text-white px-10 py-5 text-xs font-bold tracking-[0.2em] uppercase transition-transform hover:scale-105 active:scale-95 rounded-full shadow-lg shadow-black/10"
          >
            Back to Shop
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </main>
    );
  }

  const inputClassName = "w-full bg-white/60 backdrop-blur-sm border border-black/10 rounded-md px-4 py-3.5 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black/30 focus:bg-white transition-all shadow-sm";
  const labelClassName = "block text-[10px] font-bold uppercase tracking-[0.2em] text-black/60 mb-2";

  return (
    <main className="min-h-screen text-black selection:bg-black selection:text-white relative pb-24">
      <StudioGridPattern />
      
      {/* Premium Minimal Header - FIXED */}
      <header className="relative z-10 border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <div className="hover:opacity-70 transition-opacity">
            <Logo variant="compact" tone="dark" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            <h1 className="text-[10px] font-bold tracking-[0.3em] uppercase text-black">
              Secure Checkout
            </h1>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 md:pt-16">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* LEFT: FORM (COL 1-7) */}
          <div className="lg:col-span-7 xl:col-span-7">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
              
              {/* Section 1: Shipping Information */}
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight mb-8 pb-4 border-b border-black/5">
                  Shipping Information
                </h2>
                <div className="space-y-6">
                  
                  <div>
                    <label className={labelClassName} htmlFor="name">Full Name *</label>
                    <input
                      {...register("name")}
                      id="name"
                      placeholder="Your full name"
                      className={inputClassName}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-2 font-medium">{errors.name.message}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClassName} htmlFor="email">Email *</label>
                      <input
                        {...register("email")}
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className={inputClassName}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-2 font-medium">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className={labelClassName} htmlFor="phone">Phone *</label>
                      <input
                        {...register("phone")}
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        className={inputClassName}
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-2 font-medium">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className={labelClassName} htmlFor="addressLine1">Address *</label>
                    <input
                      {...register("addressLine1")}
                      id="addressLine1"
                      placeholder="House/Flat No., Street Name"
                      className={inputClassName}
                    />
                    {errors.addressLine1 && <p className="text-red-500 text-xs mt-2 font-medium">{errors.addressLine1.message}</p>}
                  </div>

                  <div>
                    <label className={labelClassName} htmlFor="addressLine2">Area / Locality</label>
                    <input
                      {...register("addressLine2")}
                      id="addressLine2"
                      placeholder="Area, Landmark (optional)"
                      className={inputClassName}
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-6">
                    <div>
                      <label className={labelClassName} htmlFor="city">City *</label>
                      <input
                        {...register("city")}
                        id="city"
                        placeholder="Mumbai"
                        className={inputClassName}
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-2 font-medium">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className={labelClassName} htmlFor="state">State *</label>
                      <input
                        {...register("state")}
                        id="state"
                        placeholder="Maharashtra"
                        className={inputClassName}
                      />
                      {errors.state && <p className="text-red-500 text-xs mt-2 font-medium">{errors.state.message}</p>}
                    </div>
                    <div>
                      <label className={labelClassName} htmlFor="pincode">Pincode *</label>
                      <input
                        {...register("pincode")}
                        id="pincode"
                        placeholder="400001"
                        maxLength={6}
                        className={inputClassName}
                      />
                      {errors.pincode && <p className="text-red-500 text-xs mt-2 font-medium">{errors.pincode.message}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Optional Details */}
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight mb-8 pb-4 border-b border-black/5">
                  Additional Details
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className={labelClassName} htmlFor="gstNumber">GST Number (Optional)</label>
                    <input
                      {...register("gstNumber")}
                      id="gstNumber"
                      placeholder="27XXXXX1234X1ZX"
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className={labelClassName} htmlFor="notes">Order Notes (Optional)</label>
                    <textarea
                      {...register("notes")}
                      id="notes"
                      placeholder="Any special delivery instructions..."
                      rows={3}
                      className={`${inputClassName} resize-none`}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Submit Button */}
              <div className="lg:hidden">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-black text-white py-5 text-xs font-bold tracking-[0.2em] uppercase hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-xl shadow-black/10 flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing Securely...
                    </>
                  ) : (
                    <>
                      Pay {formatPrice(total)}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[10px] uppercase tracking-widest text-black/40 text-center mt-6">
                  By placing this order, you agree to our Terms & Conditions.
                </p>
              </div>
            </form>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="lg:col-span-5 xl:col-span-5">
            <div className="sticky top-32 bg-white/80 border border-black/5 rounded-3xl p-8 shadow-xl shadow-black/[0.02] backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-black/5">
                <h2 className="font-heading text-2xl font-black uppercase tracking-tight">
                  Summary
                </h2>
                <Link href="/cart" className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/40 hover:text-black transition-colors underline decoration-black/20 underline-offset-4">
                  Edit Bag
                </Link>
              </div>

              {/* Items */}
              <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-black/10">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-white border border-black/5 rounded-2xl shadow-sm">
                    <div className="w-20 h-20 bg-neutral-100 rounded-xl shrink-0 relative overflow-hidden border border-black/5">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: item.colorHex }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-sm font-bold uppercase truncate">{item.productName}</p>
                      <p className="text-xs text-black/50 mt-1">{item.colorName} / {item.sizeName}</p>
                      {item.isCustomized && (
                        <p className="text-[10px] font-bold tracking-widest uppercase text-black/40 mt-1">Custom Engineered</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 flex flex-col justify-center">
                      <p className="text-sm font-bold tabular-nums">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-xs font-medium text-black/40 mt-1">Qty {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="bg-[#fafafa] p-6 rounded-2xl border border-black/5 space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-black/60 font-medium">Subtotal</span>
                  <span className="font-bold tabular-nums">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-black/60 font-medium">Shipping</span>
                  <span className="font-bold tabular-nums">
                    {shipping === 0 ? "Complimentary" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="border-t border-black/10 pt-4 flex justify-between items-end">
                  <div>
                    <span className="block text-xl font-bold uppercase">Total</span>
                    <span className="block text-[10px] text-black/40 tracking-widest uppercase mt-1">INR (Inclusive of Taxes)</span>
                  </div>
                  <span className="text-2xl font-black tabular-nums">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Desktop Submit */}
              <div className="hidden lg:block">
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isProcessing}
                  className="w-full bg-black text-white py-5 text-xs font-bold tracking-[0.2em] uppercase hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-xl shadow-black/10 flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing Securely...
                    </>
                  ) : (
                    <>
                      Proceed to Payment
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Trust */}
              <div className="mt-8 pt-6 border-t border-black/5">
                <p className="text-[10px] leading-relaxed text-black/40 text-center">
                  <strong className="text-black/60 uppercase tracking-widest block mb-1">Secure Checkout</strong>
                  Orders are processed securely. We accept UPI, Cards, and Net Banking via Razorpay.
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}