import { db } from "@/db";
import { users, orders } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Customers — Wolf Theory Admin" };

export default async function AdminCustomersPage() {
  const allCustomers = await db
    .select()
    .from(users)
    .where(eq(users.role, "CUSTOMER"))
    .orderBy(users.createdAt);

  const customersWithOrders = await Promise.all(
    allCustomers.map(async (c: (typeof allCustomers)[0]) => {
      const [orderCount] = await db.select({ count: count() }).from(orders).where(eq(orders.userId, c.id));
      return { ...c, orderCount: orderCount.count };
    })
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Customers</h1>
        <p className="text-sm text-white/40">{allCustomers.length} customers</p>
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-xs text-white/40 px-4 py-3 font-normal">Customer</th>
              <th className="text-left text-xs text-white/40 px-4 py-3 font-normal hidden sm:table-cell">Phone</th>
              <th className="text-left text-xs text-white/40 px-4 py-3 font-normal">Orders</th>
              <th className="text-left text-xs text-white/40 px-4 py-3 font-normal hidden md:table-cell">Joined</th>
              <th className="text-left text-xs text-white/40 px-4 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {customersWithOrders.map((customer) => (
              <tr key={customer.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-4">
                  <p className="text-sm font-medium">{customer.name}</p>
                  <p className="text-xs text-white/40">{customer.email}</p>
                </td>
                <td className="px-4 py-4 hidden sm:table-cell text-sm text-white/50">
                  {customer.phone ?? "—"}
                </td>
                <td className="px-4 py-4 text-sm">{customer.orderCount}</td>
                <td className="px-4 py-4 hidden md:table-cell text-sm text-white/50">
                  {new Date(customer.createdAt).toLocaleDateString("en-IN")}
                </td>
                <td className="px-4 py-4">
                  <span className={`text-xs font-medium ${customer.isActive ? "text-green-400" : "text-red-400"}`}>
                    {customer.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {allCustomers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-white/30">No customers yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
