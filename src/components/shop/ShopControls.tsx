"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { SlidersHorizontal, ChevronDown, X, Check } from "lucide-react";

interface ShopControlsProps {
  categories: string[];
  totalProducts: number;
}

export function ShopControls({ categories, totalProducts }: ShopControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  // Sync state if URL changes externally
  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  const currentCategory = searchParams.get("category") || "all";
  const currentSort = searchParams.get("sort") || "featured";
  const isCustomizable = searchParams.get("customizable") === "true";

  // Calculate active filters count
  let activeFilterCount = 0;
  if (currentCategory !== "all") activeFilterCount++;
  if (minPrice) activeFilterCount++;
  if (maxPrice) activeFilterCount++;
  if (isCustomizable) activeFilterCount++;

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setIsFiltersOpen(false);
  };

  const clearFilters = () => {
    router.push(pathname, { scroll: false });
    setIsFiltersOpen(false);
    setMinPrice("");
    setMaxPrice("");
  };

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-black/10 -mx-6 px-6 lg:mx-0 lg:px-0">
      
      {/* MAIN TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4 max-w-[1400px] mx-auto">
        
        {/* Left: Filter Toggle */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
          <button 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="group flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-black hover:opacity-70 transition-opacity"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-500 ease-out ${isFiltersOpen ? "rotate-180" : ""}`} />
          </button>

          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/40 md:hidden">
            {totalProducts} Piece{totalProducts !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Center: Quick Categories (Desktop) */}
        <div className="hidden md:flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 justify-center">
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => updateParam("category", cat === "all" ? null : cat)}
              className={`px-5 py-2 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full border transition-all duration-300 ${
                currentCategory === cat
                  ? "bg-black text-white border-black"
                  : "bg-transparent text-black/60 border-transparent hover:bg-neutral-100"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>

        {/* Right: Sort & Count */}
        <div className="hidden md:flex items-center gap-6 shrink-0">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/40">
            {totalProducts} Piece{totalProducts !== 1 ? 's' : ''}
          </span>
          <div className="w-px h-4 bg-black/10" />
          <select
            value={currentSort}
            onChange={(e) => updateParam("sort", e.target.value === "featured" ? null : e.target.value)}
            className="text-[10px] font-bold tracking-[0.2em] uppercase text-black bg-transparent border-none outline-none cursor-pointer hover:opacity-70 transition-opacity appearance-none"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Sort: Price Low-High</option>
            <option value="price-desc">Sort: Price High-Low</option>
          </select>
        </div>
      </div>

      {/* EXPANDABLE FILTER DRAWER */}
      <div 
        className={`w-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isFiltersOpen ? "max-h-[800px] border-t border-black/5 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="max-w-[1400px] mx-auto py-10 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Column 1: Categories */}
          <div>
            <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/40 mb-6">Categories</h3>
            <div className="flex flex-col gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateParam("category", cat === "all" ? null : cat)}
                  className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-left group"
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${currentCategory === cat ? 'border-black bg-black' : 'border-black/20 group-hover:border-black'}`}>
                    {currentCategory === cat && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className={currentCategory === cat ? "text-black" : "text-black/60 group-hover:text-black"}>
                    {cat === "all" ? "All Collection" : cat}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Price Range */}
          <div>
            <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/40 mb-6">Price Range (₹)</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-neutral-50 border border-black/10 rounded-md px-4 py-3 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black/30 focus:bg-white transition-all shadow-sm tabular-nums"
                />
              </div>
              <span className="text-black/30">—</span>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-neutral-50 border border-black/10 rounded-md px-4 py-3 text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black/30 focus:bg-white transition-all shadow-sm tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Column 3: Features */}
          <div>
            <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/40 mb-6">Features</h3>
            <button
              onClick={() => updateParam("customizable", isCustomizable ? null : "true")}
              className={`group flex items-center gap-3 px-5 py-4 w-full text-left text-xs font-bold tracking-[0.1em] uppercase rounded-xl border transition-all duration-300 ${
                isCustomizable
                  ? "bg-black text-white border-black shadow-lg shadow-black/10"
                  : "bg-white text-black border-black/10 hover:border-black/30 hover:bg-neutral-50"
              }`}
            >
              <div className={`w-2 h-2 rounded-full transition-colors ${isCustomizable ? "bg-white animate-pulse" : "bg-black/20 group-hover:bg-black/40"}`} />
              <div>
                <span className="block">Custom Engineered</span>
                <span className={`block text-[9px] mt-1 normal-case tracking-normal ${isCustomizable ? "text-white/60" : "text-black/40"}`}>
                  Show only 3D customizable apparel.
                </span>
              </div>
            </button>
          </div>

          {/* Column 4: Actions */}
          <div className="flex flex-col justify-end gap-3">
            <button
              onClick={applyFilters}
              className="w-full bg-black text-white px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase rounded-full shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Apply Filters
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="w-full bg-neutral-100 text-black px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase rounded-full hover:bg-neutral-200 transition-all flex items-center justify-center gap-2"
              >
                <X className="w-3.5 h-3.5" /> Clear All
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}