import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = { 
  title: "Who We Are | WOLF THEORY",
  description: "Wolf Theory is a modern streetwear brand focused on self-expression, youth culture, and 3D-customized apparel."
};

export default function AboutPage() {
  return (
    <main className="w-full bg-black selection:bg-white selection:text-black">
      
      {/* 01 — HERO */}
      <section className="relative min-h-screen flex flex-col justify-end pb-24 md:pb-32 px-6 md:px-12 pt-32 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 z-0">
          {/* Subtle noise/grain or dark editorial image placeholder */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
          <div className="w-full h-full bg-neutral-950" />
        </div>

        <div className="relative z-20 max-w-screen-2xl mx-auto w-full flex flex-col items-start">
          <Reveal direction="fade">
            <span className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-white/50 mb-8 md:mb-12">
              Wolf Theory
            </span>
          </Reveal>
          
          <Reveal delay={0.1}>
            <h1 className="font-heading text-[clamp(4rem,10vw,12rem)] leading-[0.85] font-black uppercase tracking-tighter mb-8 md:mb-12">
              Wear<br />
              Your<br />
              Theory.
            </h1>
          </Reveal>
          
          <Reveal delay={0.2} className="flex flex-col sm:flex-row gap-6 md:gap-12 items-start sm:items-center w-full">
            <p className="text-lg md:text-2xl text-white/70 max-w-md font-light">
              Built for people who create their own identity.
            </p>
            <div className="flex flex-wrap gap-4 sm:ml-auto">
              <Link href="/shop" className="px-8 py-4 text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-neutral-200 transition-colors">
                Explore Collection
              </Link>
              <Link href="/shop?category=Custom+Tee" className="px-8 py-4 text-xs font-bold uppercase tracking-widest border border-white/20 text-white hover:border-white transition-colors">
                Create Your Own
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 02 — THE IDEA */}
      <section className="py-32 md:py-64 px-6 md:px-12 bg-white text-black">
        <div className="max-w-screen-2xl mx-auto">
          <Reveal>
            <h2 className="font-heading text-[clamp(3rem,7vw,8rem)] leading-[0.9] font-black uppercase tracking-tighter max-w-5xl mb-12">
              You don't have to fit the template.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-xl md:text-3xl text-black/60 max-w-2xl font-light leading-relaxed">
              Wolf Theory exists for people who want what they wear to feel personal.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 03 — WHO WE ARE */}
      <section className="py-24 md:py-48 px-6 md:px-12 bg-neutral-50 text-black">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32">
          <Reveal>
            <h3 className="text-3xl md:text-5xl font-bold uppercase tracking-tight leading-tight max-w-xl">
              A modern apparel brand built around self-expression.
            </h3>
          </Reveal>
          
          <div className="space-y-12 md:space-y-16 text-lg md:text-xl text-black/70 font-light leading-relaxed">
            <Reveal delay={0.1}>
              <p>
                Clothing has always been a proxy for identity. But somewhere along the line, streetwear became about wearing someone else's logo rather than expressing your own perspective.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p>
                We started Wolf Theory because we saw a gap between youth culture's desire to create and the static nature of traditional fashion. We build heavy-duty uniform pieces for the creative communities, college networks, and individuals shaping modern culture.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <p>
                Whether you're designing a single piece for yourself, or outfitting an entire organization, we provide the blank canvas, the technology, and the quality to make it real.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 04 — WHO WE BUILD FOR */}
      <section className="py-32 md:py-48 px-6 md:px-12 bg-white text-black border-t border-neutral-200 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
          <Reveal>
            <span className="block text-xs font-bold uppercase tracking-[0.2em] text-black/40">
              The Audience
            </span>
          </Reveal>
          
          <div className="w-full md:w-3/4 flex flex-col">
            {[
              "Students",
              "Creators",
              "Clubs",
              "Events",
              "Teams",
              "Communities"
            ].map((item, i) => (
              <Reveal key={item} delay={i * 0.05} className="group border-b border-black/10 last:border-0">
                <div className="py-6 md:py-10 flex items-end justify-between transition-opacity duration-300 hover:opacity-50 cursor-default">
                  <h4 className="font-heading text-5xl md:text-8xl font-black uppercase tracking-tighter">
                    {item}
                  </h4>
                  <span className="text-sm md:text-lg font-mono text-black/30 mb-2 md:mb-4">
                    0{i + 1}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 05 — CUSTOMIZATION EXPERIENCE */}
      <section className="py-32 md:py-48 px-6 md:px-12 bg-neutral-900 text-white">
        <div className="max-w-screen-2xl mx-auto flex flex-col items-center text-center">
          <Reveal>
            <h2 className="font-heading text-[clamp(4rem,9vw,10rem)] leading-[0.85] font-black uppercase tracking-tighter mb-24">
              Make It Yours.
            </h2>
          </Reveal>
          
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 border-t border-white/10 pt-16">
            {[
              { step: "01", title: "Choose", desc: "Select a premium heavyweight base." },
              { step: "02", title: "Customize", desc: "Upload art, add text, adjust placement." },
              { step: "03", title: "Preview", desc: "See your design map accurately in 3D." },
              { step: "04", title: "Wear", desc: "Delivered exactly as you engineered it." }
            ].map((phase, i) => (
              <Reveal key={phase.step} delay={i * 0.1} className="flex flex-col items-center md:items-start text-center md:text-left">
                <span className="text-xs font-bold tracking-[0.2em] text-white/40 mb-4">{phase.step}</span>
                <h5 className="text-xl font-bold uppercase tracking-widest mb-4">{phase.title}</h5>
                <p className="text-sm text-white/60 font-light">{phase.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 06 — 3D STUDIO */}
      <section className="relative py-32 md:py-48 px-6 md:px-12 bg-black text-white overflow-hidden min-h-screen flex items-center">
        <div className="max-w-screen-2xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 flex flex-col gap-12 z-10">
            <Reveal>
              <h2 className="font-heading text-[clamp(3rem,6vw,7rem)] leading-none font-black uppercase tracking-tighter">
                Your Idea.<br />
                In 3D.
              </h2>
            </Reveal>
            
            <Reveal delay={0.1}>
              <ul className="space-y-6 text-lg md:text-xl text-white/70 font-light border-l border-white/20 pl-6">
                <li>Change garment colors instantly.</li>
                <li>Upload your own artwork & vectors.</li>
                <li>Add custom typography.</li>
                <li>Resize, rotate, and position freely.</li>
                <li>Independent front and back styling.</li>
                <li>Real-time 3D rendering.</li>
              </ul>
            </Reveal>

            <Reveal delay={0.2}>
              <Link href="/shop?category=Custom+Tee" className="inline-block px-8 py-4 text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-neutral-200 transition-colors">
                Launch Studio
              </Link>
            </Reveal>
          </div>
          
          {/* 3D Viewer Container */}
          <Reveal delay={0.3} className="order-1 lg:order-2 relative aspect-square w-full bg-neutral-900 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
            {/* INSTRUCTION FOR DEV: Replace this entire div with your actual 3D <Canvas> component */}
            <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 to-neutral-800" />
            <div className="relative z-10 flex flex-col items-center gap-4 text-white/30">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2-1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Interactive Render Engine</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 07 — THE WOLF THEORY STANDARD */}
      <section className="py-32 md:py-48 px-6 md:px-12 bg-white text-black">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
          <Reveal className="md:w-1/3 md:sticky md:top-32">
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">
              The Standard
            </h2>
          </Reveal>
          
          <div className="md:w-2/3 flex flex-col space-y-24">
            {[
              {
                num: "01",
                title: "Identity",
                text: "What you wear should feel like you. We provide the architecture; you provide the perspective."
              },
              {
                num: "02",
                title: "Design",
                text: "Every detail has a reason to exist. From the drape of the heavy cotton to the digital interface used to customize it."
              },
              {
                num: "03",
                title: "Freedom",
                text: "Start with an idea. Make it yours. The barrier between concept and physical product has been removed."
              },
              {
                num: "04",
                title: "Community",
                text: "Built for the people creating what comes next. Designed to scale from an individual statement to a unified movement."
              }
            ].map((principle, i) => (
              <Reveal key={principle.num} delay={0.1}>
                <div className="flex flex-col gap-6">
                  <span className="text-xs font-bold text-black/40 tracking-widest">{principle.num}</span>
                  <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">{principle.title}</h3>
                  <p className="text-xl md:text-2xl text-black/60 font-light max-w-xl leading-relaxed">{principle.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 08 — CULTURE / COMMUNITY (Visuals) */}
      <section className="py-24 px-6 md:px-12 bg-neutral-100">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* INSTRUCTION FOR DEV: Replace these bg-neutral-200 divs with <Image /> components using your real editorial photography */}
          <Reveal className="aspect-[4/5] bg-neutral-200 flex items-end p-8">
            <span className="text-xs font-bold uppercase tracking-widest text-black/50">Campus Architecture</span>
          </Reveal>
          <Reveal delay={0.1} className="aspect-[4/5] bg-neutral-300 md:-translate-y-12 flex items-end p-8">
            <span className="text-xs font-bold uppercase tracking-widest text-black/50">The Studio</span>
          </Reveal>
          <Reveal delay={0.2} className="aspect-[4/5] bg-neutral-200 flex items-end p-8">
            <span className="text-xs font-bold uppercase tracking-widest text-black/50">Creator Network</span>
          </Reveal>
        </div>
      </section>

      {/* 09 — FINAL CTA */}
      <section className="py-48 md:py-64 px-6 md:px-12 bg-black text-white text-center flex flex-col items-center">
        <Reveal>
          <h2 className="font-heading text-[clamp(3rem,8vw,9rem)] leading-[0.9] font-black uppercase tracking-tighter mb-16 max-w-5xl mx-auto">
            Make Something<br />
            That's Yours.
          </h2>
        </Reveal>
        
        <Reveal delay={0.1} className="flex flex-col sm:flex-row gap-6 w-full justify-center">
          <Link href="/shop" className="px-10 py-5 text-sm font-bold uppercase tracking-widest bg-white text-black hover:bg-neutral-200 transition-colors w-full sm:w-auto">
            Shop Wolf Theory
          </Link>
          <Link href="/shop?category=Custom+Tee" className="px-10 py-5 text-sm font-bold uppercase tracking-widest border border-white/20 text-white hover:border-white transition-colors w-full sm:w-auto">
            Create Your Tee
          </Link>
          <Link href="/contact" className="px-10 py-5 text-sm font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors w-full sm:w-auto">
            Bulk / Event Orders
          </Link>
        </Reveal>
      </section>

    </main>
  );
}