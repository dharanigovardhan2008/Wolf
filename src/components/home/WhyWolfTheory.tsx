import { Shield, Zap, Paintbrush, Package } from "lucide-react";

export function WhyWolfTheory() {
  const reasons = [
    {
      icon: Paintbrush,
      title: "Real Creative Control",
      description:
        "Not a template. Not a filter. A real design studio in your browser — 3D model and all.",
    },
    {
      icon: Shield,
      title: "Premium Build Quality",
      description:
        "Heavyweight fabrics. Precise printing. Every order is built to last and made to impress.",
    },
    {
      icon: Zap,
      title: "Made for the Culture",
      description:
        "Designed for college students, creators, and communities. From one to a thousand units.",
    },
    {
      icon: Package,
      title: "Bulk & Custom Orders",
      description:
        "Running an event, club, or fest? We handle bulk orders with dedicated support and pricing.",
    },
  ];

  return (
    <section className="py-24 bg-[#eeeeef] border-t border-black/5 rounded-3xl mx-8 mb-24" aria-labelledby="why-heading">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-bold">The Reason</p>
          <h2
            id="why-heading"
            className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-primary"
          >
            Why Wolf Theory
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.title}
                className="p-8 bg-surface border border-black/5 rounded-card shadow-soft hover:shadow-float transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-black/5 border border-black/5 rounded-full flex items-center justify-center mb-6">
                  <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold mb-3">{reason.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{reason.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
