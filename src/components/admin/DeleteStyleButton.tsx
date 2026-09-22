"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteStyleButton({ id, name, productCount }: { id: string; name: string; productCount: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (productCount > 0) {
      window.alert(`Unassign ${productCount} product(s) from "${name}" before deleting this style.`);
      return;
    }
    if (!window.confirm(`Delete the style "${name}"? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/styles/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
    else {
      const data = await res.json().catch(() => null);
      window.alert(data?.error || "Could not delete the style.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      aria-label={`Delete ${name}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" /> {busy ? "Deleting…" : "Delete"}
    </button>
  );
}