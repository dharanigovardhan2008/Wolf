import { db } from "@/db";
import { products, productImages } from "@/db/schema"; // ASSUMPTION: names
import { desc } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export default async function AdminProductsPage() {
  const rows = await db.select().from(products).orderBy(desc(products.createdAt));
  const images = await db.select().from(productImages);
  const mainImage = (id: string) =>
    (images.find((i) => i.productId === id && i.isPrimary) ?? images.find((i) => i.productId === id))?.url;

  return (
    <div className="p-6 md:p-8 text-[#111]">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="rounded-full bg-black px-6 py-3 text-sm font-bold text-white hover:bg-black/90">
          + Add product
        </Link>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-black/5 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs text-gray-500">
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {rows.length === 0 && (
              <tr><td colSpan={5} className="p-10 text-center text-sm text-gray-400">No products yet. Click “Add product”.</td></tr>
            )}
            {rows.map((p) => {
              const img = mainImage(p.id);
              return (
                <tr key={p.id} className="hover:bg-black/[0.02]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-gray-100">
                        {img && <Image src={img} alt={p.name} fill sizes="48px" className="object-cover" />}
                      </div>
                      <span className="text-sm font-semibold">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{p.category}</td>
                  <td className="p-4 text-sm font-medium">{formatPrice(parseFloat(p.basePrice))}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      p.status === "PUBLISHED" ? "bg-green-50 text-green-700"
                      : p.status === "DRAFT" ? "bg-amber-50 text-amber-700"
                      : "bg-gray-100 text-gray-600"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/products/${p.id}/edit`} className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold hover:bg-black/5">
                        Edit
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}