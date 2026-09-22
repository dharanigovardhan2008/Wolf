import { db } from "@/db";
import { bulkOrders } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Bulk Orders — Wolf Theory Admin" };

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

type BulkOrderStatus = "NEW" | "CONTACTED" | "QUOTATION_SENT" | "NEGOTIATION" | "CONFIRMED" | "IN_PRODUCTION" | "COMPLETED" | "CANCELLED";

export default async function AdminBulkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const filterStatus = params.status;

  const validStatuses = Object.keys(statusLabels);
  const isValidFilter = filterStatus && validStatuses.includes(filterStatus);

  const allOrders = isValidFilter
    ? await db
        .select()
        .from(bulkOrders)
        .where(eq(bulkOrders.status, filterStatus as BulkOrderStatus))
        .orderBy(desc(bulkOrders.createdAt))
    : await db
        .select()
        .from(bulkOrders)
        .orderBy(desc(bulkOrders.createdAt));

  const card = "bg-white rounded-3xl border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]";

  return (
    <div className="p-6 md:p-8 text-[#111]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Bulk Orders</h1>
          <p className="text-sm text-gray-500">
            {allOrders.length} enquir{allOrders.length !== 1 ? "ies" : "y"}
            {isValidFilter ? ` — ${statusLabels[filterStatus]}` : ""}
          </p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/bulk-orders"
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            !isValidFilter ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </Link>
        {Object.entries(statusLabels).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/bulk-orders?status=${key}`}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filterStatus === key ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {allOrders.length === 0 ? (
        <div className={`${card} p-12 text-center`}>
          <p className="text-gray-400 text-sm">No bulk orders found</p>
        </div>
      ) : (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="text-left text-xs text-gray-500 p-4 font-medium">Order #</th>
                  <th className="text-left text-xs text-gray-500 p-4 font-medium">Name</th>
                  <th className="text-left text-xs text-gray-500 p-4 font-medium hidden md:table-cell">Organization</th>
                  <th className="text-left text-xs text-gray-500 p-4 font-medium">Qty</th>
                  <th className="text-left text-xs text-gray-500 p-4 font-medium">Status</th>
                  <th className="text-left text-xs text-gray-500 p-4 font-medium hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {allOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-black/[0.02] transition-colors">
                    <td className="p-4">
                      <Link
                        href={`/admin/bulk-orders/${order.id}`}
                        className="text-sm font-mono font-semibold hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium">{order.name}</p>
                      <p className="text-xs text-gray-500">{order.email}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600 hidden md:table-cell">{order.organization}</td>
                    <td className="p-4 text-sm font-semibold">{order.quantity}</td>
                    <td className="p-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          statusColors[order.status] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {statusLabels[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500 hidden md:table-cell">
                      {order.createdAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
