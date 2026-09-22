import React from "react";
export function Table({ children }: { children: React.ReactNode }) { return <div className="w-full overflow-auto"><table className="w-full text-left border-collapse">{children}</table></div>; }
export function Th({ children }: { children: React.ReactNode }) { return <th className="border-b border-black/10 py-4 px-4 text-xs font-bold uppercase tracking-wider text-muted">{children}</th>; }
export function Td({ children }: { children: React.ReactNode }) { return <td className="border-b border-black/5 py-4 px-4 text-sm text-primary">{children}</td>; }