import { db } from "@/db";
import { orders, users, products, productVariants, bulkOrders } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { ShoppingCart, Users, Package, TrendingUp, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — Wolf Theory Admin" };

export default async function AdminDashboard() {
  const [totalOrdersResult] = await db.select({ count: count() }).from(orders);
  const [totalCustomersResult] = await db.select({ count: count() }).from(users).where(eq(users.role, "CUSTOMER"));
  const [totalProductsResult] = await db.select({ count: count() }).from(products).where(eq(products.status, "PUBLISHED"));
  const [pendingOrdersResult] = await db.select({ count: count() }).from(orders).where(eq(orders.status, "NEW"));
  const [newBulkOrdersResult] = await db.select({ count: count() }).from(bulkOrders).where(eq(bulkOrders.status, "NEW"));

  const allOrders = await db
    .select({ total: orders.total, status: orders.paymentStatus })
    .from(orders);
  const totalRevenue = allOrders
    .filter((o) => o.status === "CAPTURED")
    .reduce((sum, o) => sum + parseFloat(o.total), 0);

  const variants = await db
    .select({
      id: productVariants.id,
      stock: productVariants.stock,
      reservedStock: productVariants.reservedStock,
      lowStockThreshold: productVariants.lowStockThreshold,
    })
    .from(productVariants);

  const lowStockItems = variants.filter(
    (v) => v.stock - v.reservedStock <= v.lowStockThreshold && v.stock > 0
  );
  const outOfStockItems = variants.filter((v) => v.stock - v.reservedStock <= 0);

  const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(8);

  const metrics = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Orders", value: String(totalOrdersResult.count), icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50", href: "/admin/orders" },
    { label: "Customers", value: String(totalCustomersResult.count), icon: Users, color: "text-purple-600", bg: "bg-purple-50", href: "/admin/customers" },
    { label: "Live Products", value: String(totalProductsResult.count), icon: Package, color: "text-amber-600", bg: "bg-amber-50", href: "/admin/products" },
  ];

  const statusColors: Record<string, string> = {
    NEW: "bg-amber-50 text-amber-700",
    CONFIRMED: "bg-blue-50 text-blue-700",
    PROCESSING: "bg-blue-50 text-blue-700",
    SHIPPED: "bg-purple-50 text-purple-700",
    DELIVERED: "bg-green-50 text-green-700",
    CANCELLED: "bg-red-50 text-red-700",
  };

  const card = "bg-white rounded-3xl border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]";

  return (
    <div className="p-6 md:p-8 text-[#111]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of Wolf Theory operations</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const inner = (
            <div className={`${card} p-5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-shadow`}>
              <div className={`w-10 h-10 ${metric.bg} rounded-full flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <p className="text-2xl font-bold mb-1">{metric.value}</p>
              <p className="text-sm text-gray-500">{metric.label}</p>
            </div>
          );
          return metric.href ? (
            <Link key={metric.label} href={metric.href}>{inner}</Link>
          ) : (
            <div key={metric.label}>{inner}</div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className={`lg:col-span-2 ${card} p-5`}>
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Alerts
          </h2>
          <div className="space-y-3">
            {pendingOrdersResult.count > 0 && (
              <Link href="/admin/orders?status=NEW" className="flex items-center justify-between p-3 bg-amber-50 rounded-2xl hover:bg-amber-100 transition-colors">
                <p className="text-sm text-amber-800">{pendingOrdersResult.count} pending order{pendingOrdersResult.count !== 1 ? "s" : ""} awaiting action</p>
                <span className="text-xs text-amber-800">View →</span>
              </Link>
            )}
            {newBulkOrdersResult.count > 0 && (
              <Link href="/admin/bulk-orders" className="flex items-center justify-between p-3 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors">
                <p className="text-sm text-blue-800">{newBulkOrdersResult.count} new bulk enquir{newBulkOrdersResult.count !== 1 ? "ies" : "y"}</p>
                <span className="text-xs text-blue-800">View →</span>
              </Link>
            )}
            {lowStockItems.length > 0 && (
              <Link href="/admin/inventory" className="flex items-center justify-between p-3 bg-orange-50 rounded-2xl hover:bg-orange-100 transition-colors">
                <p className="text-sm text-orange-800">{lowStockItems.length} variant{lowStockItems.length !== 1 ? "s" : ""} running low on stock</p>
                <span className="text-xs text-orange-800">View →</span>
              </Link>
            )}
            {outOfStockItems.length > 0 && (
              <div className="p-3 bg-red-50 rounded-2xl">
                <p className="text-sm text-red-800">{outOfStockItems.length} variant{outOfStockItems.length !== 1 ? "s" : ""} out of stock</p>
              </div>
            )}
            {pendingOrdersResult.count === 0 && newBulkOrdersResult.count === 0 && lowStockItems.length === 0 && outOfStockItems.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">All clear — no alerts</p>
            )}
          </div>
        </div>

        <div className={`${card} p-5`}>
          <h2 className="text-sm font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/admin/products/new" className="block p-3 rounded-full bg-black text-white text-sm font-semibold text-center hover:bg-black/90 transition-colors">
              + Add New Product
            </Link>
            {[
              ["/admin/products", "Manage Products"],
              ["/admin/orders", "View All Orders"],
              ["/admin/bulk-orders", "Bulk Enquiries"],
              ["/admin/settings", "Store Settings"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="block p-3 rounded-full border border-black/10 text-sm text-gray-600 hover:text-black hover:bg-black/5 text-center transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-gray-500 hover:text-black transition-colors">View all →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="text-left text-xs text-gray-500 pb-3 font-medium">Order</th>
                  <th className="text-left text-xs text-gray-500 pb-3 font-medium">Customer</th>
                  <th className="text-left text-xs text-gray-500 pb-3 font-medium">Status</th>
                  <th className="text-right text-xs text-gray-500 pb-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-black/[0.02]">
                    <td className="py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-sm font-mono hover:underline">{order.orderNumber}</Link>
                    </td>
                    <td className="py-3 text-sm text-gray-600">{order.shippingName}</td>
                    <td className="py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-sm font-medium">{formatPrice(parseFloat(order.total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}