import { db } from "@/db";
import { orders, orderItems, products, productVariants, colors, sizes } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Orders — Wolf Theory Admin" };

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status } = await searchParams;

  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

  // Get order items count for each order
  const orderItemsData = await db.select().from(orderItems);
  const itemCounts = new Map<string, number>();
  for (const item of orderItemsData) {
    const current = itemCounts.get(item.orderId) ?? 0;
    itemCounts.set(item.orderId, current + item.quantity);
  }

  const filtered = status 
    ? allOrders.filter((o) => o.status === status) 
    : allOrders;

  const statusStyles: Record<string, string> = {
    NEW: "bg-amber-50 text-amber-700 border-amber-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
    PROCESSING: "bg-indigo-50 text-indigo-700 border-indigo-200",
    SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
    DELIVERED: "bg-green-50 text-green-700 border-green-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
    REFUNDED: "bg-orange-50 text-orange-700 border-orange-200",
  };

  const statuses = ["NEW", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

  return (
    <div className="p-6 md:p-8 text-[#111]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Orders</h1>
          <p className="text-sm text-gray-500">
            {filtered.length} {filtered.length === 1 ? 'order' : 'orders'}
            {status && ` · ${status.toLowerCase()}`}
          </p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="mb-6 rounded-2xl border border-black/5 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/orders"
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              !status 
                ? "bg-black text-white shadow-sm" 
                : "border border-black/10 bg-white text-gray-600 hover:bg-black/5"
            }`}
          >
            All ({allOrders.length})
          </Link>
          {statuses.map((s) => {
            const count = allOrders.filter((o) => o.status === s).length;
            return (
              <Link
                key={s}
                href={`/admin/orders?status=${s}`}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  status === s 
                    ? "bg-black text-white shadow-sm" 
                    : "border border-black/10 bg-white text-gray-600 hover:bg-black/5"
                }`}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()} ({count})
              </Link>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-3xl border border-black/5 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs text-gray-500">
              <th className="p-4 font-medium">Order</th>
              <th className="p-4 font-medium hidden md:table-cell">Customer</th>
              <th className="p-4 font-medium">Items</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium hidden sm:table-cell">Date</th>
              <th className="p-4 font-medium text-right">Total</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-10 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg 
                      className="mb-3 h-12 w-12 text-gray-300" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      />
                    </svg>
                    <p className="text-sm font-semibold text-gray-900 mb-1">No orders found</p>
                    <p className="text-sm text-gray-400">
                      {status ? `No orders with status "${status}"` : "Orders will appear here once customers place them"}
                    </p>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map((order) => (
              <tr 
                key={order.id} 
                className="hover:bg-black/[0.02] transition-colors"
              >
                <td className="p-4">
                  <Link 
                    href={`/admin/orders/${order.id}`} 
                    className="font-mono text-sm font-semibold text-black hover:text-black/60 transition-colors"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <div>
                    <p className="text-sm font-semibold text-black">{order.shippingName}</p>
                    <p className="text-xs text-gray-500">{order.shippingEmail}</p>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-gray-600">
                    {itemCounts.get(order.id) ?? 0} {(itemCounts.get(order.id) ?? 0) === 1 ? 'item' : 'items'}
                  </span>
                </td>
                <td className="p-4">
                  <span 
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      statusStyles[order.status] ?? "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-4 hidden sm:table-cell">
                  <div>
                    <p className="text-sm font-medium text-black">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <span className="text-sm font-semibold text-black">
                    {formatPrice(parseFloat(order.total))}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Link 
                      href={`/admin/orders/${order.id}`} 
                      className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold hover:bg-black/5 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}