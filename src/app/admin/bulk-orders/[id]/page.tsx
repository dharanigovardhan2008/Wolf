import { db } from "@/db";
import { bulkOrders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { BulkOrderActions } from "./BulkOrderActions";

export const metadata: Metadata = { title: "Bulk Order Detail — Wolf Theory Admin" };

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

const statusColors: Record<string, string> = {
  NEW: "bg-amber-50 text-amber-700",
  CONTACTED: "bg-blue-50 text-blue-700",
  QUOTATION_SENT: "bg-indigo-50 text-indigo-700",
  NEGOTIATION: "bg-purple-50 text-purple-700",
  CONFIRMED: "bg-green-50 text-green-700",
  IN_PRODUCTION: "bg-cyan-50 text-cyan-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export default async function BulkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [order] = await db
    .select()
    .from(bulkOrders)
    .where(eq(bulkOrders.id, id))
    .limit(1);

  if (!order) notFound();

  const card = "bg-white rounded-3xl border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]";

  const sizeDistribution = order.sizeDistribution as Record<string, number> | null;

  return (
    <div className="p-6 md:p-8 text-[#111]">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/bulk-orders" className="text-sm text-gray-500 hover:text-black transition-colors mb-2 inline-block">
          ← Back to Bulk Orders
        </Link>
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[order.status] ?? "bg-gray-100 text-gray-600"}`}>
            {statusLabels[order.status] ?? order.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Submitted {order.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column — Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className={`${card} p-6`}>
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted font-semibold mb-4">Contact Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoRow label="Name" value={order.name} />
              <InfoRow label="Organization" value={order.organization} />
              {order.college && <InfoRow label="College" value={order.college} />}
              {order.eventName && <InfoRow label="Event" value={order.eventName} />}
              <InfoRow label="Email" value={order.email} isLink={`mailto:${order.email}`} />
              <InfoRow label="Phone" value={order.phone} isLink={`tel:${order.phone}`} />
            </div>
          </div>

          {/* Order Details */}
          <div className={`${card} p-6`}>
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted font-semibold mb-4">Order Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoRow label="Quantity" value={`${order.quantity} pieces`} />
              <InfoRow label="T-Shirt Type" value={order.tshirtType} />
              {order.fabricPreference && <InfoRow label="Fabric" value={order.fabricPreference} />}
              <InfoRow label="Colors" value={order.colors} />
            </div>
            {sizeDistribution && Object.values(sizeDistribution).some((v) => v > 0) && (
              <div className="mt-4">
                <p className="text-xs text-muted mb-2">Size Distribution</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(sizeDistribution)
                    .filter(([, v]) => v > 0)
                    .map(([size, count]) => (
                      <span key={size} className="bg-gray-50 rounded-lg px-3 py-1.5 text-xs font-semibold">
                        {size}: <span className="text-primary">{count}</span>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Design */}
          <div className={`${card} p-6`}>
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted font-semibold mb-4">Design</h2>
            {order.designDescription && (
              <p className="text-sm text-gray-600 mb-4">{order.designDescription}</p>
            )}
            <div className="grid grid-cols-2 gap-4">
              {order.frontDesignUrl ? (
                <div>
                  <p className="text-xs text-muted mb-2">Front Design</p>
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                    <Image src={order.frontDesignUrl} alt="Front design" fill className="object-cover" sizes="300px" />
                  </div>
                </div>
              ) : (
                <div className="aspect-square rounded-2xl bg-gray-50 flex items-center justify-center">
                  <p className="text-xs text-gray-400">No front design uploaded</p>
                </div>
              )}
              {order.backDesignUrl ? (
                <div>
                  <p className="text-xs text-muted mb-2">Back Design</p>
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                    <Image src={order.backDesignUrl} alt="Back design" fill className="object-cover" sizes="300px" />
                  </div>
                </div>
              ) : (
                <div className="aspect-square rounded-2xl bg-gray-50 flex items-center justify-center">
                  <p className="text-xs text-gray-400">No back design uploaded</p>
                </div>
              )}
            </div>
          </div>

          {/* Logistics */}
          <div className={`${card} p-6`}>
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted font-semibold mb-4">Logistics & Budget</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {order.deliveryDate && (
                <InfoRow
                  label="Needed By"
                  value={order.deliveryDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                />
              )}
              {order.deliveryAddress && <InfoRow label="Delivery Address" value={order.deliveryAddress} />}
              {order.budgetRange && <InfoRow label="Budget Range" value={order.budgetRange} />}
              {order.additionalRequirements && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted mb-1">Additional Requirements</p>
                  <p className="text-sm">{order.additionalRequirements}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column — Actions */}
        <div className="space-y-6">
          <BulkOrderActions
            orderId={order.id}
            currentStatus={order.status}
            currentNotes={order.adminNotes ?? ""}
            currentQuotation={order.quotationAmount ?? ""}
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, isLink }: { label: string; value: string; isLink?: string }) {
  return (
    <div>
      <p className="text-xs text-muted mb-0.5">{label}</p>
      {isLink ? (
        <a href={isLink} className="text-sm font-medium hover:underline text-primary">{value}</a>
      ) : (
        <p className="text-sm font-medium">{value}</p>
      )}
    </div>
  );
}

