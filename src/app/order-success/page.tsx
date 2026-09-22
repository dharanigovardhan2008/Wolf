import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

interface Props {
  searchParams: Promise<{ orderId?: string; orderNumber?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { orderNumber } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>

        <h1 className="font-display text-4xl font-bold uppercase mb-4">Order Placed!</h1>
        
        {orderNumber && (
          <div className="mb-4 px-4 py-2 bg-white/5 border border-white/10 rounded-sm inline-block">
            <p className="text-xs text-white/40 mb-0.5">Order Number</p>
            <p className="font-mono font-semibold">{orderNumber}</p>
          </div>
        )}

        <p className="text-white/60 mb-2">
          Thank you for your order! We&apos;re getting it ready.
        </p>
        <p className="text-sm text-white/40 mb-10">
          You&apos;ll receive a confirmation email shortly with your order details and tracking information.
        </p>

        <div className="space-y-3">
          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 w-full border border-white/20 text-white px-6 py-3 text-sm font-semibold tracking-widest uppercase hover:border-white hover:bg-white/5 transition-all rounded-sm"
          >
            <Package className="w-4 h-4" />
            View My Orders
          </Link>
          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 w-full text-white/50 hover:text-white text-sm transition-colors py-2"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* What happens next */}
        <div className="mt-12 text-left p-6 bg-zinc-900 border border-white/10 rounded-sm">
          <h2 className="text-sm font-semibold mb-4">What happens next?</h2>
          <div className="space-y-3">
            {[
              "Order confirmed and payment processed",
              "Design review (for customized orders)",
              "Printing & quality check",
              "Packed and shipped to you",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] text-white/50">{i + 1}</span>
                </div>
                <p className="text-sm text-white/60">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
