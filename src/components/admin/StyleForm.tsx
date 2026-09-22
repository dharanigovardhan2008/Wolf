"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader, type UploadedImage } from "@/components/admin/ImageUploader";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const field = "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black transition-colors";
const label = "mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500";
const card = "rounded-3xl border border-black/5 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]";

type Initial = {
  id: string; name: string; slug: string; subtitle: string; sortOrder: number; isActive: boolean;
  image: UploadedImage | null;
  backgroundColor?: string | null; // NEW
};

export function StyleForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [backgroundColor, setBackgroundColor] = useState(initial?.backgroundColor ?? ""); // NEW
  const [images, setImages] = useState<UploadedImage[]>(initial?.image ? [initial.image] : []);

  async function submit() {
    setError("");
    if (!name.trim()) return setError("Style name is required.");
    if (images.length === 0) return setError("Upload an image for this style tile.");

    setBusy(true);
    try {
      const res = await fetch(initial ? `/api/admin/styles/${initial.id}` : "/api/admin/styles", {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug || slugify(name),
          subtitle: subtitle.trim() || null,
          imageUrl: images[0].url,
          imagePublicId: images[0].publicId,
          sortOrder,
          isActive,
          backgroundColor: backgroundColor.trim() || null, // NEW
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save the style.");
      router.push("/admin/styles");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the style.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <section className={card}>
        <h2 className="mb-4 text-base font-bold">Style details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={label} htmlFor="name">Name *</label>
            <input
              id="name" className={field} value={name}
              onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }}
              placeholder="T-Shirts"
            />
          </div>
          <div>
            <label className={label} htmlFor="slug">URL slug</label>
            <input id="slug" className={field} value={slug} onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }} />
          </div>
          <div className="md:col-span-2">
            <label className={label} htmlFor="subtitle">Subtitle</label>
            <input id="subtitle" className={field} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Daily essentials" maxLength={120} />
          </div>

          {/* NEW BACKGROUND COLOR FIELD */}
          <div className="md:col-span-2">
            <label className={label} htmlFor="bg">Card background color</label>
            <div className="flex items-center gap-3">
              <input
                id="bg" type="color"
                value={backgroundColor || "#f3f3f4"}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="h-11 w-14 cursor-pointer rounded-xl border border-black/10"
              />
              <input
                className={field} value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="Leave empty for transparent"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              If left empty, product images in this style show with no background — just the tee floating.
            </p>
          </div>

          <div>
            <label className={label} htmlFor="sort">Sort order</label>
            <input id="sort" type="number" min={0} className={field} value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)} />
            <p className="mt-1 text-xs text-gray-400">Lower numbers show first in the grid.</p>
          </div>
          <div className="flex items-end pb-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4" />
              Active (visible on the shop page)
            </label>
          </div>
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-1 text-base font-bold">Tile image *</h2>
        <p className="mb-4 text-sm text-gray-500">A dark, moody product photo works best (see reference). Portrait orientation, at least 800×1000px.</p>
        <ImageUploader value={images} onChange={setImages} max={1} endpoint="/api/admin/upload" />
      </section>

      {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button" disabled={busy} onClick={submit}
          className="rounded-full bg-black px-8 py-4 text-sm font-bold uppercase tracking-wide text-white hover:bg-black/90 disabled:opacity-50"
        >
          {busy ? "Saving…" : initial ? "Save changes" : "Create style"}
        </button>
      </div>
    </div>
  );
}