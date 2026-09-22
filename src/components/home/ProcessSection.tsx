export function ProcessSection() {
  const steps = [
    {
      number: "01",
      title: "Choose Your Base",
      description: "Pick the t-shirt style, fabric weight, and color that matches your vision.",
    },
    {
      number: "02",
      title: "Open the 3D Studio",
      description: "Launch our 3D design editor and see your canvas come alive.",
    },
    {
      number: "03",
      title: "Design Your Way",
      description: "Upload images, add text, choose fonts, rotate — full creative control.",
    },
    {
      number: "04",
      title: "Order & Wear",
      description: "Happy with it? Add to cart and we'll bring your design to life.",
    },
  ];

  return (
    <section className="py-24 px-8 border-t border-black/5" aria-labelledby="process-heading">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-bold">How It Works</p>
          <h2
            id="process-heading"
            className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-primary"
          >
            Four Steps to Your Perfect Tee
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, i) => (
            <div key={step.number} className="relative group">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(100%+16px)] w-[calc(100%-32px)] h-px border-t border-dashed border-black/10 -z-0" />
              )}

              <div className="text-6xl font-black text-black/5 mb-6 leading-none transition-colors group-hover:text-black/10">
                {step.number}
              </div>
              <h3 className="text-lg font-bold text-primary mb-3">{step.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
