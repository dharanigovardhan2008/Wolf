"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

const STATUS_FLOW = [
  "NEW",
  "CONTACTED",
  "QUOTATION_SENT",
  "NEGOTIATION",
  "CONFIRMED",
  "IN_PRODUCTION",
  "COMPLETED",
  "CANCELLED",
] as const;

const statusLabels: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUOTATION_SENT: "Quotation Sent",
  NEGOTIATION: "Negotiation",
  CONFIRMED: "Confirmed",
  IN_PRODUCTION: "In Production",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function BulkOrderActions({
  orderId,
  currentStatus,
  currentNotes,
  currentQuotation,
}: {
  orderId: string;
  currentStatus: string;
  currentNotes: string;
  currentQuotation: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [adminNotes, setAdminNotes] = useState(currentNotes);
  const [quotationAmount, setQuotationAmount] = useState(currentQuotation);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSave() {
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`/api/admin/bulk-orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminNotes: adminNotes || null,
          quotationAmount: quotationAmount ? parseFloat(quotationAmount) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message ?? "Failed to update");
        return;
      }

      setMessage("Updated successfully");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const card = "bg-white rounded-3xl border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]";

  return (
    <>
      {/* Status Update */}
      <div className={`${card} p-6`}>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted font-semibold mb-4">Update Status</h2>
        <div className="space-y-3">
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                status === s
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Quotation & Notes */}
      <div className={`${card} p-6`}>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted font-semibold mb-4">Business</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="quotation" className="block text-sm font-medium text-primary mb-1.5">
              Quotation Amount (₹)
            </label>
            <input
              id="quotation"
              type="number"
              step="0.01"
              min="0"
              value={quotationAmount}
              onChange={(e) => setQuotationAmount(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
              placeholder="Total quote amount"
            />
          </div>

          <div>
            <label htmlFor="adminNotes" className="block text-sm font-medium text-primary mb-1.5">
              Admin Notes
            </label>
            <textarea
              id="adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all resize-none"
              placeholder="Internal notes about this order…"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-primary text-white py-3 rounded-full text-sm font-bold tracking-wide uppercase hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}

