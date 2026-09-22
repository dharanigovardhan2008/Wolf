import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function BulkOrderCTA() {
  return (
    <section className="py-24 px-8 border-t border-black/5" aria-labelledby="bulk-heading">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden bg-black text-white rounded-[40px] p-8 sm:p-24 shadow-float">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 text-[30rem] font-black leading-none text-white pointer-events-none select-none -translate-y-24 translate-x-12">
              W
            </div>
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <Logo variant="mark" tone="light" className="h-6" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/50 border-l border-white/20 pl-4">
                For Colleges, Events & Teams
              </span>
            </div>
            <h2
              id="bulk-heading"
              className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none mb-6"
            >
              MADE FOR YOUR
              <br />
              <span className="text-white/50">CREW.</span>
            </h2>
            <p className="text-white/60 mb-12 text-lg leading-relaxed max-w-md">
              Custom apparel for colleges, hackathons, sports teams, and communities. 
              Minimum 25 units. Dedicated design support. Competitive pricing. 
              Get a quote in 24 hours.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/bulk-orders"
                className="group inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 text-[10px] font-bold tracking-widest uppercase hover:bg-white/90 transition-all rounded-full"
              >
                Get a Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border border-white/20 px-8 py-4 text-[10px] text-white font-bold tracking-widest uppercase hover:bg-white/10 transition-all rounded-full"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
