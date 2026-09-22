import Link from "next/link";
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return <nav className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-muted mb-6">
    {items.map((item, i) => (
      <div key={i} className="flex items-center gap-2">
        {item.href ? <Link href={item.href} className="hover:text-primary transition-colors">{item.label}</Link> : <span className="text-primary">{item.label}</span>}
        {i < items.length - 1 && <span>/</span>}
      </div>
    ))}
  </nav>;
}