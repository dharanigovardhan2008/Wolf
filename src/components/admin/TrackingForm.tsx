"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TrackingFormProps {
  orderId: string;
  initialTrackingUrl?: string;
  initialTrackingNumber?: string;
  initialCourierName?: string;
}

export function TrackingForm({ 
  orderId, 
  initialTrackingUrl = "",
  initialTrackingNumber = "",
  initialCourierName = ""
}: TrackingFormProps) {
  const router = useRouter();
  const [trackingUrl, setTrackingUrl] = useState(initialTrackingUrl);
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber);
  const [courierName, setCourierName] = useState(initialCourierName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/tracking`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingUrl: trackingUrl || null,
          trackingNumber: trackingNumber || null,
          courierName: courierName || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update tracking");
      }

      setMessage({ type: "success", text: "Tracking information updated successfully!" });
      router.refresh();
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Failed to update tracking" 
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="courierName" className="block text-sm font-medium text-gray-700 mb-1">
          Courier Name
        </label>
        <input
          type="text"
          id="courierName"
          value={courierName}
          onChange={(e) => setCourierName(e.target.value)}
          placeholder="e.g., FedEx, DHL, BlueDart, Delhivery"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div>
        <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Tracking Number
        </label>
        <input
          type="text"
          id="trackingNumber"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="e.g., 1234567890"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      <div>
        <label htmlFor="trackingUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Tracking URL <span className="text-gray-400 font-normal">(Required for customer tracking)</span>
        </label>
        <input
          type="url"
          id="trackingUrl"
          value={trackingUrl}
          onChange={(e) => setTrackingUrl(e.target.value)}
          placeholder="https://track.courier.com/..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm ${
          message.type === "success" 
            ? "bg-green-50 text-green-700 border border-green-200" 
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-full bg-black px-6 py-3 text-sm font-bold text-white hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {saving ? "Saving..." : initialTrackingUrl ? "Update Tracking" : "Add Tracking"}
      </button>
    </form>
  );
}