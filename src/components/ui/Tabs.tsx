import React, { useState } from "react";
export function Tabs({ tabs }: { tabs: { id: string; label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0].id);
  return <div>
    <div className="flex gap-8 border-b border-black/10 mb-8 overflow-x-auto">
      {tabs.map(t => (
        <button key={t.id} onClick={() => setActive(t.id)} className={`whitespace-nowrap pb-4 text-xs font-bold tracking-widest uppercase transition-colors ${active === t.id ? 'border-b-2 border-black text-primary' : 'text-muted hover:text-primary'}`}>{t.label}</button>
      ))}
    </div>
    <div>{tabs.find(t => t.id === active)?.content}</div>
  </div>;
}