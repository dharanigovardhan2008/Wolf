import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Layers, Palette, RotateCcw } from "lucide-react";

export function CustomizeSection() {
  return (
    <section className="py-24 bg-surface overflow-hidden border-t border-black/5" aria-labelledby="customize-heading">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-bold">The Differentiator</p>
            <h2
              id="customize-heading"
              className="text-4xl sm:text-6xl font-black uppercase leading-none mb-6 tracking-tighter text-primary"
            >
              DESIGN IN
              <br />
              <span className="text-black/50">FULL 3D.</span>
            </h2>
            <p className="text-muted leading-relaxed mb-8 max-w-md">
              Don&apos;t just imagine your design — see it come alive on a real 3D model. Rotate it. Zoom in.
              Place your graphics exactly where you want them. Front and back. Make it yours.
            </p>

            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-black/5 border border-black/5 rounded-full flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5 text-primary" />
                </div>
                <div className="pt-1">
                  <h3 className="text-sm font-bold mb-1">360° View</h3>
                  <p className="text-sm text-muted">Rotate your t-shirt in real time. Check every angle before you order.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-black/5 border border-black/5 rounded-full flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div className="pt-1">
                  <h3 className="text-sm font-bold mb-1">Upload & Place</h3>
                  <p className="text-sm text-muted">Drop in your PNG or image. Resize, rotate, and position it exactly right.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-black/5 border border-black/5 rounded-full flex items-center justify-center shrink-0">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <div className="pt-1">
                  <h3 className="text-sm font-bold mb-1">Add Text</h3>
                  <p className="text-sm text-muted">Pick your font, set the color, and style your message exactly how you see it.</p>
                </div>
              </div>
            </div>

            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 bg-black text-white px-8 py-4 text-[10px] font-bold tracking-widest uppercase hover:bg-black/90 transition-all rounded-full"
            >
              Start Designing
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right: Image */}
          <div className="relative">
            <div className="relative aspect-square max-w-lg mx-auto bg-[#eeeeef] rounded-card-lg overflow-hidden border border-black/5">
              <Image
                src="/images/customize-section.jpg"
                alt="3D t-shirt customizer interface"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tl from-white/50 to-transparent" />

              {/* Floating UI Elements */}
              <div className="absolute bottom-6 left-6 right-6 bg-surface/90 backdrop-blur-md border border-black/5 rounded-card p-6 shadow-float">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Live 3D Preview</p>
                    <p className="text-[10px] text-muted uppercase tracking-widest mt-1">See your design in real time</p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}