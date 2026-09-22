"use client";

import { useEffect, useState, Suspense, lazy } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Undo2, Redo2, ShoppingBag, Save, Upload, Type, ChevronLeft, ChevronRight } from "lucide-react";
import { useCustomizerStore } from "@/stores/customizerStore";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/components/ui/Toaster";
import { v4 as uuidv4 } from "uuid";
import { DesignControlPanel } from "./DesignControlPanel";
import { ElementProperties } from "./ElementProperties";

// Lazy load 3D viewer to avoid SSR issues
const Viewer3D = lazy(() => import("./Viewer3D").then(m => ({ default: m.Viewer3D })));

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

interface CustomizerClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: string;
    customizationPrice: string;
    isCustomizable: boolean;
    model3dUrl: string | null;
  };
  variants: Variant[];
  colors: Array<{ id: string; name: string; hexCode: string }>;
  sizes: Array<{ id: string; name: string; sortOrder: number }>;
  initialColorId?: string;
  initialSizeId?: string;
}

export function CustomizerClient({
  product,
  variants,
  colors,
  sizes,
  initialColorId,
  initialSizeId,
}: CustomizerClientProps) {
  const store = useCustomizerStore();
  const addItem = useCartStore((s) => s.addItem);
  const [activeTab, setActiveTab] = useState<"design" | "product">("design");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const defaultColor = initialColorId
      ? colors.find((c) => c.id === initialColorId) ?? colors[0]
      : colors[0];
    const defaultSize = initialSizeId ?? "";

    if (defaultColor) {
      store.setProductConfig(
        product.id,
        defaultColor.id,
        defaultColor.hexCode,
        defaultSize
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedVariant = variants.find(
    (v) => v.colorId === store.selectedColorId && v.sizeId === store.selectedSizeId
  );

  const basePrice = parseFloat(product.basePrice);
  const customPrice = parseFloat(product.customizationPrice);
  const priceAdjustment = selectedVariant ? parseFloat(selectedVariant.priceAdjustment) : 0;
  const hasDesign = store.front.elements.length > 0 || store.back.elements.length > 0;
  const totalPrice = basePrice + priceAdjustment + (hasDesign ? customPrice : 0);

  async function handleAddToCart() {
    if (!store.selectedSizeId) {
      toast("Please select a size first", "error");
      return;
    }
    if (!selectedVariant) {
      toast("Please select a valid variant", "error");
      return;
    }

    setIsAdding(true);
    try {
      const selectedColor = colors.find((c) => c.id === store.selectedColorId);
      const selectedSize = sizes.find((s) => s.id === store.selectedSizeId);

      addItem({
        id: uuidv4(),
        productId: product.id,
        variantId: selectedVariant.id,
        productName: product.name,
        productSlug: product.slug,
        sku: selectedVariant.sku,
        colorName: selectedColor?.name ?? "",
        colorHex: selectedColor?.hexCode ?? "#000",
        sizeName: selectedSize?.name ?? "",
        price: totalPrice,
        quantity: 1,
        isCustomized: hasDesign,
        frontPreviewUrl: store.front.elements.length > 0 ? "custom" : undefined,
        backPreviewUrl: store.back.elements.length > 0 ? "custom" : undefined,
      });
      toast("Added to cart!", "success");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-zinc-950">
        <Link
          href={`/shop/${product.slug}`}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{product.name}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => store.canUndo() && store.undo()}
            disabled={!store.canUndo()}
            className="p-2 text-white/50 hover:text-white transition-colors disabled:opacity-30"
            aria-label="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => store.canRedo() && store.redo()}
            disabled={!store.canRedo()}
            className="p-2 text-white/50 hover:text-white transition-colors disabled:opacity-30"
            aria-label="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={store.resetDesign}
            className="p-2 text-white/50 hover:text-white transition-colors"
            aria-label="Reset design"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs text-white/40">Total</p>
            <p className="text-sm font-bold">{formatPrice(totalPrice)}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 text-xs font-semibold tracking-widest uppercase hover:bg-white/90 transition-all disabled:opacity-50 rounded-sm"
          >
            <ShoppingBag className="w-3 h-3" />
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="hidden lg:flex flex-col w-72 border-r border-white/10 bg-zinc-950 overflow-y-auto">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab("design")}
              className={`flex-1 py-3 text-xs font-semibold tracking-widest uppercase transition-colors ${
                activeTab === "design" ? "text-white border-b-2 border-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              Design
            </button>
            <button
              onClick={() => setActiveTab("product")}
              className={`flex-1 py-3 text-xs font-semibold tracking-widest uppercase transition-colors ${
                activeTab === "product" ? "text-white border-b-2 border-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              Product
            </button>
          </div>

          {activeTab === "design" && <DesignControlPanel />}
          {activeTab === "product" && (
            <ProductOptionsPanel
              colors={colors}
              sizes={sizes}
              variants={variants}
              selectedColorId={store.selectedColorId}
              selectedSizeId={store.selectedSizeId}
              onColorChange={(id, hex) => store.setColor(id, hex)}
              onSizeChange={(id) => store.setSize(id)}
            />
          )}
        </div>

        {/* Center: 3D Viewport */}
        <div className="flex-1 flex flex-col relative">
          {/* Side Toggle */}
          <div className="flex items-center justify-center gap-3 py-3 border-b border-white/10">
            <button
              onClick={() => store.setSide("front")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-widest uppercase rounded-sm transition-colors ${
                store.currentSide === "front"
                  ? "bg-white text-black"
                  : "text-white/50 border border-white/20 hover:text-white"
              }`}
            >
              <ChevronLeft className="w-3 h-3" />
              Front
            </button>
            <button
              onClick={() => store.setSide("back")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-widest uppercase rounded-sm transition-colors ${
                store.currentSide === "back"
                  ? "bg-white text-black"
                  : "text-white/50 border border-white/20 hover:text-white"
              }`}
            >
              Back
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* 3D Canvas */}
          <div className="flex-1 relative">
            <Suspense
              fallback={
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-white/40">Loading 3D Model...</p>
                  </div>
                </div>
              }
            >
              <Viewer3D
                shirtColor={store.selectedColorHex}
                frontElements={store.front.elements}
                backElements={store.back.elements}
                currentSide={store.currentSide}
                textureVersion={store.textureVersion}
              />
            </Suspense>
          </div>

          {/* Mobile Bottom Controls */}
          <div className="lg:hidden border-t border-white/10 bg-zinc-950">
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab("design")}
                className={`flex-1 py-3 text-xs font-semibold tracking-widest uppercase ${
                  activeTab === "design" ? "text-white border-b-2 border-white" : "text-white/40"
                }`}
              >
                Design
              </button>
              <button
                onClick={() => setActiveTab("product")}
                className={`flex-1 py-3 text-xs font-semibold tracking-widest uppercase ${
                  activeTab === "product" ? "text-white border-b-2 border-white" : "text-white/40"
                }`}
              >
                Product
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {activeTab === "design" && <DesignControlPanel />}
              {activeTab === "product" && (
                <ProductOptionsPanel
                  colors={colors}
                  sizes={sizes}
                  variants={variants}
                  selectedColorId={store.selectedColorId}
                  selectedSizeId={store.selectedSizeId}
                  onColorChange={(id, hex) => store.setColor(id, hex)}
                  onSizeChange={(id) => store.setSize(id)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Element Properties */}
        {store.selectedElementId && (
          <div className="hidden lg:block w-72 border-l border-white/10 bg-zinc-950 overflow-y-auto">
            <ElementProperties />
          </div>
        )}
      </div>
    </div>
  );
}

function ProductOptionsPanel({
  colors,
  sizes,
  variants,
  selectedColorId,
  selectedSizeId,
  onColorChange,
  onSizeChange,
}: {
  colors: Array<{ id: string; name: string; hexCode: string }>;
  sizes: Array<{ id: string; name: string; sortOrder: number }>;
  variants: Variant[];
  selectedColorId: string;
  selectedSizeId: string;
  onColorChange: (id: string, hex: string) => void;
  onSizeChange: (id: string) => void;
}) {
  const availableSizesForColor = variants
    .filter((v) => v.colorId === selectedColorId && v.isAvailable && v.stock > 0)
    .map((v) => v.sizeId);

  return (
    <div className="p-4 space-y-6">
      {/* Color */}
      <div>
        <label className="block text-xs font-semibold tracking-widest uppercase text-white/40 mb-3">
          Color — {colors.find((c) => c.id === selectedColorId)?.name}
        </label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color.id}
              onClick={() => onColorChange(color.id, color.hexCode)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedColorId === color.id ? "border-white scale-110" : "border-white/20"
              }`}
              style={{ backgroundColor: color.hexCode }}
              title={color.name}
              aria-label={color.name}
            />
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="block text-xs font-semibold tracking-widest uppercase text-white/40 mb-3">
          Size
        </label>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((size) => {
            const available = availableSizesForColor.includes(size.id);
            return (
              <button
                key={size.id}
                onClick={() => available && onSizeChange(size.id)}
                disabled={!available}
                className={`py-2 text-xs font-medium border rounded-sm transition-colors ${
                  selectedSizeId === size.id
                    ? "bg-white text-black border-white"
                    : available
                    ? "border-white/20 text-white hover:border-white/50"
                    : "border-white/10 text-white/20 cursor-not-allowed"
                }`}
              >
                {size.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
