import React from "react";
export function Pagination({ current, total, onPage }: { current: number; total: number; onPage: (p: number) => void }) {
  return <div className="flex items-center justify-center gap-2 mt-12">
    {[...Array(total)].map((_, i) => (
      <button key={i} onClick={() => onPage(i + 1)} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${current === i + 1 ? 'bg-black text-white' : 'bg-transparent text-primary hover:bg-black/5'}`}>{i + 1}</button>
    ))}
  </div>;
}