export function ProductsSkeleton() {
  return (
    <section className="py-24 px-8 border-t border-black/5">
      <div className="flex items-end justify-between mb-16">
        <div>
          <div className="h-3 w-24 bg-black/10 rounded-full mb-4 animate-pulse" />
          <div className="h-12 w-64 bg-black/10 rounded-xl animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse flex flex-col">
            <div className="aspect-square bg-black/5 rounded-3xl mb-6" />
            <div className="px-2">
              <div className="h-4 bg-black/10 rounded-full mb-3 w-1/3" />
              <div className="h-6 bg-black/10 rounded-full mb-4 w-3/4" />
              <div className="h-4 bg-black/10 rounded-full w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
