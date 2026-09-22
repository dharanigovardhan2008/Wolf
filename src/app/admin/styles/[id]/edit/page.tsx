import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { styleCategories } from "@/db/schema";
import { StyleForm } from "@/components/admin/StyleForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Style — Wolf Theory Admin" };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditStylePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const [s] = await db.select().from(styleCategories).where(eq(styleCategories.id, id)).limit(1);
  if (!s) notFound();

  return (
    <div className="p-6 md:p-8 text-[#111]">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold">Edit Style</h1>
        <p className="text-sm text-gray-500">{s.name}</p>
      </div>
      <StyleForm
        initial={{
          id: s.id,
          name: s.name,
          slug: s.slug,
          subtitle: s.subtitle ?? "",
          sortOrder: s.sortOrder,
          isActive: s.isActive,
          image: s.imageUrl ? { url: s.imageUrl, publicId: s.imagePublicId ?? "" } : null,
        }}
      />
    </div>
  );
}