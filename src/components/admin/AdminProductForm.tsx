"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toaster";
import { slugify } from "@/lib/utils";
import { ImageUploader, type UploadedImage } from "@/components/admin/ImageUploader";

interface Props {
  fabrics: Array<{ id: string; name: string }>;
  colors: Array<{ id: string; name: string; hexCode: string }>;
  sizes: Array<{ id: string; name: string }>;
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    category: string;
    productType: string;
    basePrice: string;
    customizationPrice: string;
    fabricId: string | null;
    gsm: number | null;
    isCustomizable: boolean;
    isFeatured: boolean;
    status: string;
    images?: Array<{ url: string; publicId?: string; colorId?: string | null }>;
    variants?: Array<{ colorId: string; sizeId: string; stock: number }>;
  };
}

type VariantCell = { checked: boolean; stock: number };
type VariantGrid = Record<string, VariantCell>;

function gridKey(colorId: string, sizeId: string) {
  return `${colorId}:${sizeId}`;
}

function buildInitialGrid(
  colors: Array<{ id: string }>,
  sizes: Array<{ id: string }>,
  existing: Array<{ colorId: string; sizeId: string; stock: number }> = []
): VariantGrid {
  const grid: VariantGrid = {};
  for (const c of colors) {
    for (const s of sizes) {
      const match = existing.find((v) => v.colorId === c.id && v.sizeId === s.id);
      grid[gridKey(c.id, s.id)] = match
        ? { checked: true, stock: match.stock }
        : { checked: false, stock: 0 };
    }
  }
  return grid;
}

export function AdminProductForm({ fabrics, colors, sizes, product }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [images, setImages] = useState<UploadedImage[]>(
    (product?.images ?? []).map((img) => ({
      url: img.url,
      publicId: img.publicId ?? img.url,
      colorId: img.colorId ?? null,
    }))
  );

  // Which colors this product actually comes in.
  const initialSelectedColors = new Set(
    (product?.variants ?? []).map((v) => v.colorId)
  );
  const [selectedColorIds, setSelectedColorIds] = useState<Set<string>>(initialSelectedColors);

  const [variantGrid, setVariantGrid] = useState<VariantGrid>(
    buildInitialGrid(colors, sizes, product?.variants ?? [])
  );

  const [formData, setFormData] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    shortDescription: product?.shortDescription ?? "",
    category: product?.category ?? "T-Shirts",
    productType: product?.productType ?? "oversized",
    basePrice: product?.basePrice ?? "599",
    customizationPrice: product?.customizationPrice ?? "149",
    fabricId: product?.fabricId ?? "",
    gsm: product?.gsm ?? 220,
    isCustomizable: product?.isCustomizable ?? true,
    isFeatured: product?.isFeatured ?? false,
    status: product?.status ?? "DRAFT",
  });

  function handleNameChange(name: string) {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: product ? prev.slug : slugify(name),
    }));
  }

  function toggleColorSelected(colorId: string) {
    setSelectedColorIds((prev) => {
      const next = new Set(prev);
      if (next.has(colorId)) {
        next.delete(colorId);
        // Uncheck every variant cell for this color so it's dropped from the payload
        setVariantGrid((grid) => {
          const updated = { ...grid };
          for (const s of sizes) {
            const key = gridKey(colorId, s.id);
            if (updated[key]) updated[key] = { checked: false, stock: 0 };
          }
          return updated;
        });
      } else {
        next.add(colorId);
      }
      return next;
    });
  }

  function toggleVariant(colorId: string, sizeId: string) {
    const key = gridKey(colorId, sizeId);
    setVariantGrid((prev) => ({
      ...prev,
      [key]: { ...prev[key], checked: !prev[key].checked },
    }));
  }

  function setVariantStock(colorId: string, sizeId: string, stock: number) {
    const key = gridKey(colorId, sizeId);
    setVariantGrid((prev) => ({
      ...prev,
      [key]: { ...prev[key], stock },
    }));
  }

  function selectedVariants() {
    const out: Array<{ colorId: string; sizeId: string; stock: number }> = [];
    for (const c of colors) {
      if (!selectedColorIds.has(c.id)) continue;
      for (const s of sizes) {
        const cell = variantGrid[gridKey(c.id, s.id)];
        if (cell?.checked) {
          out.push({ colorId: c.id, sizeId: s.id, stock: Math.max(0, cell.stock || 0) });
        }
      }
    }
    return out;
  }

  const activeColors = colors.filter((c) => selectedColorIds.has(c.id));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const basePriceNum = Number(formData.basePrice);
    const customizationPriceNum = Number(formData.customizationPrice);
    if (!Number.isFinite(basePriceNum) || basePriceNum <= 0) {
      toast("Base price must be a valid number greater than 0", "error");
      return;
    }
    if (!Number.isFinite(customizationPriceNum) || customizationPriceNum < 0) {
      toast("Customization price must be a valid number", "error");
      return;
    }

    const variants = selectedVariants();

    if (formData.status === "PUBLISHED") {
      if (images.length === 0) {
        toast("Add at least one image before publishing", "error");
        return;
      }
      if (selectedColorIds.size === 0) {
        toast("Select at least one color before publishing", "error");
        return;
      }
      if (variants.length === 0) {
        toast("Select at least one color/size combination before publishing", "error");
        return;
      }
    }

    setIsLoading(true);

    try {
      const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const method = product ? "PATCH" : "POST";

      const payload = {
        ...formData,
        basePrice: basePriceNum,
        customizationPrice: customizationPriceNum,
        fabricId: formData.fabricId || null,
        gsm: formData.gsm || null,
        actualPrice: null,
        seoTitle: null,
        seoDescription: null,
        images: images.map((img) => ({ url: img.url, colorId: img.colorId ?? null })),
        variants,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        // not valid JSON — data stays null, handled below
      }

      if (!res.ok) {
        console.error("Save failed — status:", res.status, "body:", raw || "(empty)");
        toast(
          data?.error ?? data?.message ?? `Failed to save product (status ${res.status})`,
          "error"
        );
        return;
      }

      if (!data) {
        console.error("Empty/invalid response body — status:", res.status);
        toast("Server returned an unexpected response. Check the server logs.", "error");
        return;
      }

      toast(product ? "Product updated!" : "Product created!", "success");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error("Network or unexpected error", err);
      toast("Network error — please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  const sectionClass = "p-6 bg-white border border-gray-200 rounded-lg shadow-sm space-y-4";
  const headingClass = "text-xs font-semibold text-gray-500 uppercase tracking-widest";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const inputClass =
    "w-full bg-white border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-900">
      {/* Basic Info */}
      <div className={sectionClass}>
        <h2 className={headingClass}>Basic Info</h2>

        <div>
          <label className={labelClass}>Product Name *</label>
          <input
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            placeholder="Wolf Classic Oversized Tee"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Slug *</label>
          <input
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
            placeholder="wolf-classic-oversized-tee"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Short Description *</label>
          <input
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            required
            placeholder="One-liner product description"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Full Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={5}
            placeholder="Detailed product description..."
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      {/* Colors this product comes in */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h2 className={headingClass}>Available Colors</h2>
          <span className="text-xs text-gray-500">{selectedColorIds.size} selected</span>
        </div>

        {colors.length === 0 ? (
          <p className="text-sm text-gray-500">No colors configured yet. Add colors in settings first.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const active = selectedColorIds.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleColorSelected(c.id)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${
                    active
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full border border-gray-300"
                    style={{ backgroundColor: c.hexCode }}
                  />
                  {c.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Images, taggable by color */}
      <div className={sectionClass}>
        <h2 className={headingClass}>Images</h2>
        {activeColors.length === 0 && (
          <p className="text-xs text-gray-500">
            Select colors above to tag which photo belongs to which color. Photos left as
            &quot;General&quot; show for every color.
          </p>
        )}
        <ImageUploader
          value={images}
          onChange={setImages}
          max={8}
          colorOptions={activeColors.length > 0 ? activeColors : undefined}
        />
      </div>

      {/* Category & Type */}
      <div className={sectionClass}>
        <h2 className={headingClass}>Category</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={inputClass}
            >
              <option value="T-Shirts">T-Shirts</option>
              <option value="Hoodies">Hoodies</option>
              <option value="Sweatshirts">Sweatshirts</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Product Type</label>
            <input
              value={formData.productType}
              onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
              placeholder="oversized, regular, polo..."
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className={sectionClass}>
        <h2 className={headingClass}>Pricing</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Base Price (₹) *</label>
            <input
              type="number"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              required
              min="0"
              step="0.01"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Customization Price (₹)</label>
            <input
              type="number"
              value={formData.customizationPrice}
              onChange={(e) => setFormData({ ...formData, customizationPrice: e.target.value })}
              min="0"
              step="0.01"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Fabric */}
      <div className={sectionClass}>
        <h2 className={headingClass}>Material</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Fabric</label>
            <select
              value={formData.fabricId}
              onChange={(e) => setFormData({ ...formData, fabricId: e.target.value })}
              className={inputClass}
            >
              <option value="">Select fabric...</option>
              {fabrics.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>GSM</label>
            <input
              type="number"
              value={formData.gsm || ""}
              onChange={(e) =>
                setFormData({ ...formData, gsm: e.target.value ? parseInt(e.target.value, 10) : null })
              }
              placeholder="220"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Sizes & stock, per selected color */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h2 className={headingClass}>Sizes & Stock</h2>
          <span className="text-xs text-gray-500">
            {selectedVariants().length} combination{selectedVariants().length === 1 ? "" : "s"} selected
          </span>
        </div>

        {activeColors.length === 0 ? (
          <p className="text-sm text-gray-500">Select at least one color above first.</p>
        ) : sizes.length === 0 ? (
          <p className="text-sm text-gray-500">No sizes configured yet. Add sizes in settings first.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 text-gray-500 font-medium sticky left-0 bg-white">
                    Color \ Size
                  </th>
                  {sizes.map((s) => (
                    <th key={s.id} className="p-2 text-gray-600 font-medium text-center min-w-[110px]">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeColors.map((c) => (
                  <tr key={c.id} className="border-t border-gray-200">
                    <td className="p-2 sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0"
                          style={{ backgroundColor: c.hexCode }}
                        />
                        <span className="text-gray-800">{c.name}</span>
                      </div>
                    </td>
                    {sizes.map((s) => {
                      const key = gridKey(c.id, s.id);
                      const cell = variantGrid[key] ?? { checked: false, stock: 0 };
                      return (
                        <td key={s.id} className="p-2 text-center align-middle">
                          <div className="flex flex-col items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={cell.checked}
                              onChange={() => toggleVariant(c.id, s.id)}
                              className="w-4 h-4"
                              aria-label={`${c.name} ${s.name} available`}
                            />
                            <input
                              type="number"
                              min="0"
                              value={cell.checked ? cell.stock : ""}
                              disabled={!cell.checked}
                              onChange={(e) =>
                                setVariantStock(c.id, s.id, parseInt(e.target.value, 10) || 0)
                              }
                              placeholder="stock"
                              className="w-20 bg-white border border-gray-300 rounded-md px-2 py-1 text-xs text-gray-900 text-center placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black disabled:opacity-40 disabled:bg-gray-100"
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className={sectionClass}>
        <h2 className={headingClass}>Settings</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className={inputClass}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-gray-700">
            <input
              type="checkbox"
              checked={formData.isCustomizable}
              onChange={(e) => setFormData({ ...formData, isCustomizable: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Allow Customization</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-gray-700">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Featured Product</span>
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-black text-white py-3 text-sm font-semibold uppercase tracking-widest rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Saving..." : product ? "Update Product" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 text-sm text-gray-600 rounded-md hover:text-gray-900 hover:border-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}