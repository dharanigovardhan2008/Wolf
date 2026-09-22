import Link from "next/link";
import Image from "next/image";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { styleCategories, products } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { DeleteStyleButton } from "@/components/admin/DeleteStyleButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Styles — Wolf Theory Admin" };
export const dynamic = "force-dynamic";

export default async function AdminStylesPage() {
  const rows = await db.select().from(styleCategories).orderBy(asc(styleCategories.sortOrder));
  const withCounts = await Promise.all(
    rows.map(async (r) => {
      const [c] = await db.select({ count: count() }).from(products).where(eq(products.styleCategoryId, r.id));
      return { ...r, productCount: c.count };
    })
  );

  return (
    <div className="p-6 md:p-8 text-[#111]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Styles</h1>
          <p className="text-sm text-gray-500">Manage the &quot;Shop by Style&quot; tiles shown on the shop page.</p>
        </div>
        <Link href="/admin/styles/new" className="rounded-full bg-black px-6 py-3 text-sm font-bold text-white hover:bg-black/90">
          + Add style
        </Link>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-black/5 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs text-gray-500">
              <th className="p-4 font-medium">Style</th>
              <th className="p-4 font-medium">Subtitle</th>
              <th className="p-4 font-medium">Products</th>
              <th className="p-4 font-medium">Order</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {withCounts.length === 0 && (
              <tr><td colSpan={6} className="p-10 text-center text-sm text-gray-400">No styles yet. Click “Add style”.</td></tr>
            )}
            {withCounts.map((s) => (
              <tr key={s.id} className="hover:bg-black/[0.02]">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-gray-100">
                      {s.imageUrl && <Image src={s.imageUrl} alt={s.name} fill sizes="48px" className="object-cover" />}
                    </div>
                    <span className="text-sm font-semibold">{s.name}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">{s.subtitle || "—"}</td>
                <td className="p-4 text-sm text-gray-600">{s.productCount}</td>
                <td className="p-4 text-sm text-gray-600">{s.sortOrder}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/styles/${s.id}/edit`} className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold hover:bg-black/5">
                      Edit
                    </Link>
                    <DeleteStyleButton id={s.id} name={s.name} productCount={s.productCount} />
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