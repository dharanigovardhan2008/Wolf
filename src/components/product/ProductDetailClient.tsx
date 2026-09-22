"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Share2, Minus, Plus, X, RotateCcw, ShieldCheck, Pencil, Check, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "@/components/ui/Toaster";
import { v4 as uuidv4 } from "uuid";

interface Variant {
  id: string;
  sku: string;
  colorId: string;
  sizeId: string;
  priceAdjustment: string;
  stock: number;
  isAvailable: boolean;
  color: { id: string; name: string; hexCode: string };
  size: { id: string; name: string };
}

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  colorId?: string | null;
}

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    basePrice: string;
    actualPrice?: string | null;
    customizationPrice: string;
    isCustomizable: boolean;
    gsm: number | null;
    productType: string;
    category: string;
  };
  images: ProductImage[];
  variants: Variant[];
  colors: Array<{ id: string; name: string; hexCode: string }>;
  sizes: Array<{ id: string; name: string; sortOrder: number }>;
  fabric: { name: string; description: string; composition: string | null; gsm: number | null } | null;
  freeShippingThreshold?: number | null;
}

const label = "text-[10px] font-bold uppercase tracking-[0.2em] text-black/40";

export function ProductDetailClient({
  product,
  images,
  variants,
  colors,
  sizes,
  fabric,
  freeShippingThreshold,
}: Props) {
  // Filter only available colors (colors that have at least one available variant)
  const availableColors = colors.filter((color) =>
    variants.some((v) => v.colorId === color.id && v.isAvailable && v.stock > 0)
  );

  // Filter only available sizes (sizes that have at least one available variant)
  const availableSizes = sizes.filter((size) =>
    variants.some((v) => v.sizeId === size.id && v.isAvailable && v.stock > 0)
  );

  const [colorId, setColorId] = useState(availableColors[0]?.id ?? "");
  const [sizeId, setSizeId] = useState("");
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [wish, setWish] = useState(false);
  const [chart, setChart] = useState(false);
  const [needSize, setNeedSize] = useState(false);
  const [showAddedPopup, setShowAddedPopup] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  // Use refs to prevent infinite loops
  const isColorChangeFromImage = useRef(false);
  const isImageChangeFromColor = useRef(false);

  useEffect(() => {
    if (!chart) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setChart(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chart]);

  // Auto-hide popup after 3 seconds
  useEffect(() => {
    if (showAddedPopup) {
      const timer = setTimeout(() => setShowAddedPopup(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showAddedPopup]);

  // When active image changes, update the color based on that image's colorId
  useEffect(() => {
    if (isImageChangeFromColor.current) {
      isImageChangeFromColor.current = false;
      return;
    }

    const currentImage = images[active];
    if (currentImage?.colorId && currentImage.colorId !== colorId) {
      const isColorAvailable = availableColors.some((c) => c.id === currentImage.colorId);
      if (isColorAvailable) {
        isColorChangeFromImage.current = true;
        setColorId(currentImage.colorId);
        setSizeId("");
        setNeedSize(false);
      }
    }
  }, [active]);

  // When color changes, switch to the first image of that color
  useEffect(() => {
    if (isColorChangeFromImage.current) {
      isColorChangeFromImage.current = false;
      return;
    }

    const colorImages = images.filter((img) => img.colorId === colorId);
    if (colorImages.length > 0) {
      const firstColorImageIndex = images.findIndex((img) => img.id === colorImages[0].id);
      if (firstColorImageIndex !== -1 && firstColorImageIndex !== active) {
        isImageChangeFromColor.current = true;
        setActive(firstColorImageIndex);
      }
    }
  }, [colorId]);

  // Get current variant based on selected color and size
  const variant = variants.find((v) => v.colorId === colorId && v.sizeId === sizeId);

  // Get stock for a specific size with current color
  const stockFor = (sId: string) => {
    const v = variants.find((x) => x.colorId === colorId && x.sizeId === sId);
    return v && v.isAvailable ? v.stock : 0;
  };

  // Get sizes available for the currently selected color
  const productSizes = availableSizes.filter((s) =>
    variants.some((v) => v.colorId === colorId && v.sizeId === s.id && v.isAvailable)
  );

  // Price calculation
  const base = parseFloat(product.basePrice);
  const price = base + (variant ? parseFloat(variant.priceAdjustment) : 0);
  const mrp = product.actualPrice ? parseFloat(product.actualPrice) : 0;
  const discount = mrp > base ? Math.round((1 - base / mrp) * 100) : 0;

  // Get current color object
  const color = availableColors.find((c) => c.id === colorId);

  // Stock info
  const stock = variant ? Math.max(0, variant.stock) : null;
  const maxQty = stock ?? 10;

  function addToBag() {
    if (!variant) {
      setNeedSize(true);
      toast("Please select a size", "error");
      return;
    }
    if (!variant.isAvailable || variant.stock <= 0) {
      toast("This size is out of stock", "error");
      return;
    }

    const selectedSize = sizes.find((s) => s.id === sizeId);

    addItem({
      id: uuidv4(),
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      productSlug: product.slug,
      sku: variant.sku,
      colorName: color?.name ?? "",
      colorHex: color?.hexCode ?? "#000",
      sizeName: selectedSize?.name ?? "",
      price,
      quantity: qty,
      imageUrl: images[active]?.url ?? images[0]?.url ?? "",
      isCustomized: false,
    });

    // Show animated popup
    setShowAddedPopup(true);
    toast(`${product.name} added to bag`, "success");
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast("Link copied", "success");
      }
    } catch {
      /* user cancelled */
    }
  }

  // Handle color change - reset size selection and switch to color's first image
  const handleColorChange = (newColorId: string) => {
    if (newColorId === colorId) return;

    setColorId(newColorId);
    setSizeId("");
    setQty(1);
    setNeedSize(false);

    // Find first image for this color
    const firstColorImageIndex = images.findIndex((img) => img.colorId === newColorId);
    if (firstColorImageIndex !== -1) {
      isImageChangeFromColor.current = true;
      setActive(firstColorImageIndex);
    } else {
      setActive(0);
    }
  };

  // If no colors available, show message
  if (availableColors.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-28 sm:px-6">
        <div className="rounded-3xl bg-red-50 p-8 text-center">
          <h2 className="mb-2 font-heading text-2xl font-bold">Product Unavailable</h2>
          <p className="text-black/60">This product is currently out of stock.</p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-full bg-black px-6 py-3 text-sm font-bold uppercase tracking-widest text-white hover:bg-black/90"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-28 sm:px-6">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/40"
      >
        <Link href="/shop" className="hover:text-black">
          Shop
        </Link>
        <span>/</span>
        <span>{product.category}</span>
        <span>/</span>
        <span className="text-black">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Preview */}
        <div className="flex gap-4">
          {images.length > 1 && (
            <ul className="hidden flex-col gap-3 sm:flex">
              {images.map((img, i) => (
                <li key={img.id}>
                  <button
                    onClick={() => setActive(i)}
                    aria-label={`Show image ${i + 1}`}
                    className={`relative h-16 w-16 overflow-hidden rounded-2xl bg-white ${
                      i === active ? "ring-2 ring-black" : "ring-1 ring-black/10"
                    }`}
                  >
                    <Image src={img.url} alt="" fill sizes="64px" className="object-contain p-1" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-[2rem] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
            {images.length > 0 ? (
              <Image
                src={images[active]?.url ?? images[0].url}
                alt={images[active]?.alt ?? product.name}
                fill
                priority
                sizes="(max-width:1024px) 100vw, 600px"
                className="object-contain p-8 drop-shadow-2xl transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center font-heading text-6xl font-black text-black/10">
                WT
              </div>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 sm:hidden">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActive(i)}
                    aria-label={`Show image ${i + 1}`}
                    className={`h-2 w-2 rounded-full ${i === active ? "bg-black" : "bg-black/20"}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="rounded-[2rem] bg-white p-7 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.10)] lg:p-10">
          <div className="mb-3 flex items-center gap-2">
            <span className={label}>{product.category}</span>
            {discount > 0 && (
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-bold text-green-700">
                {discount}% OFF
              </span>
            )}
          </div>

          <h1 className="mb-4 font-heading text-3xl font-extrabold leading-tight tracking-tight lg:text-4xl">
            {product.name}
          </h1>

          <p className="mb-1 flex items-baseline gap-3 font-heading">
            <span className="text-3xl font-bold">{formatPrice(price)}</span>
            {discount > 0 && <span className="text-lg text-black/35 line-through">{formatPrice(mrp)}</span>}
          </p>
          <p className="mb-7 text-xs text-black/40">Inclusive of all taxes</p>

          {availableColors.length > 0 && (
            <div className="mb-7">
              <p className="mb-3 flex items-center gap-2">
                <span className={label}>Color</span>
                <span className="text-sm font-semibold uppercase">{color?.name}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {availableColors.map((c) => (
                  <button
                    key={c.id}
                    aria-label={c.name}
                    onClick={() => handleColorChange(c.id)}
                    className={`h-9 w-9 rounded-full p-0.5 transition ${
                      colorId === c.id ? "ring-2 ring-black ring-offset-2" : "hover:scale-110"
                    }`}
                  >
                    <span
                      className="block h-full w-full rounded-full border border-black/10"
                      style={{ backgroundColor: c.hexCode }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2">
                <span className={label}>Size</span>
                {sizeId && <span className="text-sm font-semibold">{sizes.find((s) => s.id === sizeId)?.name}</span>}
              </p>
              <button
                onClick={() => setChart(true)}
                className="text-[10px] font-bold uppercase tracking-widest text-black/50 underline underline-offset-4 hover:text-black"
              >
                Size chart
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {productSizes.map((s) => {
                const ok = stockFor(s.id) > 0;
                const sel = sizeId === s.id;
                return (
                  <button
                    key={s.id}
                    disabled={!ok}
                    aria-pressed={sel}
                    onClick={() => {
                      setSizeId(s.id);
                      setQty(1);
                      setNeedSize(false);
                    }}
                    className={`h-12 min-w-12 rounded-full px-4 text-sm font-bold transition ${
                      sel
                        ? "bg-black text-white"
                        : ok
                        ? "border border-black/15 hover:border-black"
                        : "cursor-not-allowed border border-black/5 text-black/20 line-through"
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
            {needSize && (
              <p role="alert" className="mt-3 text-sm font-medium text-red-600">
                Select a size to continue.
              </p>
            )}
            {stock !== null && stock > 0 && stock <= 5 && (
              <p className="mt-3 text-sm font-semibold text-orange-600">Only {stock} left</p>
            )}
            {stock === 0 && <p className="mt-3 text-sm font-semibold text-red-600">Out of stock</p>}
          </div>

          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-black/15">
              <button
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-12 w-12 items-center justify-center"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-bold" aria-live="polite">
                {qty}
              </span>
              <button
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                className="flex h-12 w-12 items-center justify-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={addToBag}
              disabled={stock === 0}
              className="h-12 flex-1 rounded-full bg-black text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-black/90 disabled:opacity-40"
            >
              {stock === 0 ? "Out of stock" : "Add to bag"}
            </button>
            <button
              aria-label="Add to wishlist"
              aria-pressed={wish}
              onClick={() => setWish((w) => !w)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-black/15 hover:bg-black/5"
            >
              <Heart className={`h-5 w-5 ${wish ? "fill-red-500 text-red-500" : ""}`} />
            </button>
          </div>

          {product.isCustomizable && (
            <Link
              href={`/customize/${product.id}`}
              className="mb-6 flex h-12 items-center justify-center gap-2 rounded-full border border-black text-xs font-bold uppercase tracking-[0.2em] transition hover:bg-black hover:text-white"
            >
              <Pencil className="h-4 w-4" /> Customize this tee
            </Link>
          )}

          <ul className="mb-6 space-y-3 border-t border-black/5 pt-6 text-sm text-black/60">
            {freeShippingThreshold ? (
              <li>Free shipping on orders above {formatPrice(freeShippingThreshold)}</li>
            ) : null}
            <li className="flex items-center gap-3">
              <RotateCcw className="h-4 w-4" /> Easy returns
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4" /> Secure payment with Razorpay
            </li>
          </ul>

          <button
            onClick={share}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/50 hover:text-black"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </div>

      {/* Product details accordion */}
      <div className="mt-10 rounded-[2rem] bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
        <details className="group px-6 py-4" open>
          <summary className="cursor-pointer list-none font-heading text-sm font-bold uppercase tracking-widest">
            Description
          </summary>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-black/60">{product.description}</p>
        </details>
        {(fabric || product.gsm) && (
          <details className="group border-t border-black/5 px-6 py-4">
            <summary className="cursor-pointer list-none font-heading text-sm font-bold uppercase tracking-widest">
              Fabric
            </summary>
            <div className="mt-3 space-y-1 text-sm text-black/60">
              {fabric && (
                <p>
                  {fabric.name}
                  {fabric.composition ? ` — ${fabric.composition}` : ""}
                </p>
              )}
              {(product.gsm ?? fabric?.gsm) && <p>{product.gsm ?? fabric?.gsm} GSM</p>}
              {fabric?.description && <p>{fabric.description}</p>}
            </div>
          </details>
        )}
      </div>

      {/* Size Chart Modal */}
      {chart && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Size chart"
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setChart(false)} />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <button
              aria-label="Close"
              onClick={() => setChart(false)}
              className="absolute right-4 top-4 rounded-full p-2 hover:bg-black/5"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="mb-4 font-heading text-lg font-bold">Size chart (inches)</h2>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs text-black/50">
                  <th className="py-2">Size</th>
                  <th>Chest</th>
                  <th>Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {[
                  ["S", 40, 27],
                  ["M", 42, 28],
                  ["L", 44, 29],
                  ["XL", 46, 30],
                  ["XXL", 48, 31],
                ].map(([s, c, l]) => (
                  <tr key={s}>
                    <td className="py-2 font-semibold">{s}</td>
                    <td>{c}</td>
                    <td>{l}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Added to Cart Popup */}
      {showAddedPopup && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowAddedPopup(false)}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div className="relative w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="rounded-3xl bg-white p-8 shadow-2xl">
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 animate-in zoom-in duration-500">
                  <Check className="h-8 w-8 text-green-600" strokeWidth={3} />
                </div>
              </div>
              <h3 className="mb-2 text-center font-heading text-2xl font-bold">Added to Cart!</h3>
              <p className="mb-6 text-center text-black/60">
                {qty} × {product.name}
                <br />
                <span className="text-sm">
                  {color?.name} • {sizes.find((s) => s.id === sizeId)?.name}
                </span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddedPopup(false)}
                  className="flex-1 rounded-full border border-black/15 py-3 text-sm font-bold uppercase tracking-widest transition hover:bg-black/5"
                >
                  Continue Shopping
                </button>
                <Link
                  href="/cart"
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-black py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-black/90"
                >
                  <ShoppingBag className="h-4 w-4" />
                  View Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}