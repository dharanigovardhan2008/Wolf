import { db } from "@/db";
import { fabrics, colors, sizes, styleCategories } from "@/db/schema";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Product — Wolf Theory Admin" };

export default async function NewProductPage() {
  const allFabrics = await db.select().from(fabrics);
  const allColors = await db.select().from(colors).orderBy(colors.sortOrder);
  const allSizes = await db.select().from(sizes).orderBy(sizes.sortOrder);
  
  // NEW: Fetch active styles
  const activeStyles = await db.select().from(styleCategories).where(eq(styleCategories.isActive, true)).orderBy(asc(styleCategories.sortOrder));

  return (
    <div className="p-6 md:p-8 max-w-4xl text-[#111]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">New Product</h1>
        <p className="text-sm text-gray-500">Fill in the details, upload images, then save as draft or publish.</p>
      </div>
      <AdminProductForm
        fabrics={allFabrics.map((f) => ({ id: f.id, name: f.name }))}
        colors={allColors.map((c) => ({ id: c.id, name: c.name, hexCode: c.hexCode }))}
        sizes={allSizes.map((s) => ({ id: s.id, name: s.name }))}
        styles={activeStyles.map(s => ({ id: s.id, name: s.name }))} // NEW
      />
    </div>
  );
}