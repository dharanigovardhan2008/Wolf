"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ currentSort }: { currentSort?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("sort", e.target.value);
    } else {
      params.delete("sort");
    }
    const query = params.toString();
    router.push(query ? `/shop?${query}` : "/shop");
  };

  return (
    <select
      defaultValue={currentSort ?? ""}
      onChange={handleChange}
      className="bg-transparent border border-white/20 text-white/60 text-xs px-3 py-2 rounded-sm focus:outline-none focus:border-white/40"
      aria-label="Sort products"
    >
      <option value="" className="bg-zinc-900 text-white">Sort: Featured</option>
      <option value="price-asc" className="bg-zinc-900 text-white">Price: Low to High</option>
      <option value="price-desc" className="bg-zinc-900 text-white">Price: High to Low</option>
    </select>
  );
}

