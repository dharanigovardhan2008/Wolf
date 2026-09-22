"use client";

import { useCustomizerStore } from "@/stores/customizerStore";
import type { ImageElement, TextElement } from "@/stores/customizerStore";
import { Trash2, X } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

const FONTS = [
  "Inter", "Roboto", "Oswald", "Bebas Neue", "Montserrat",
  "Playfair Display", "Space Mono", "Barlow Condensed", "Archivo Black", "Permanent Marker",
];

export function ElementProperties() {
  const store = useCustomizerStore();
  const currentElements = store.currentSide === "front"
    ? store.front.elements
    : store.back.elements;

  const element = currentElements.find((el) => el.id === store.selectedElementId);
  if (!element) return null;

  function update(updates: Record<string, unknown>) {
    store.updateElement(element!.id, updates as Parameters<typeof store.updateElement>[1]);
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold tracking-widest uppercase text-white/40">
          {element.type === "image" ? "Image Properties" : "Text Properties"}
        </h3>
        <button
          onClick={() => store.selectElement(null)}
          className="text-white/40 hover:text-white transition-colors"
          aria-label="Close properties panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Position */}
        <div>
          <label className="block text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">
            Position
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-white/30 mb-1 block">X</label>
              <input
                type="number"
                value={Math.round(element.x)}
                onChange={(e) => update({ x: parseFloat(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-sm px-2 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/30 mb-1 block">Y</label>
              <input
                type="number"
                value={Math.round(element.y)}
                onChange={(e) => update({ y: parseFloat(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-sm px-2 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div>
          <label className="block text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">
            Size
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-white/30 mb-1 block">W</label>
              <input
                type="number"
                value={Math.round(element.width ?? 0)}
                onChange={(e) => update({ width: parseFloat(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-sm px-2 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/30 mb-1 block">H</label>
              <input
                type="number"
                value={Math.round(element.height ?? 0)}
                onChange={(e) => update({ height: parseFloat(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-sm px-2 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className="block text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">
            Rotation: {Math.round(element.rotation)}°
          </label>
          <input
            type="range"
            min="-180"
            max="180"
            value={element.rotation}
            onChange={(e) => update({ rotation: parseFloat(e.target.value) })}
            className="w-full accent-white"
          />
        </div>

        {/* Opacity */}
        <div>
          <label className="block text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">
            Opacity: {Math.round(element.opacity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={element.opacity}
            onChange={(e) => update({ opacity: parseFloat(e.target.value) })}
            className="w-full accent-white"
          />
        </div>

        {/* Text-specific properties */}
        {element.type === "text" && (() => {
          const textEl = element as TextElement;
          return (
            <>
              {/* Text Content */}
              <div>
                <label className="block text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">
                  Text
                </label>
                <textarea
                  value={textEl.content}
                  onChange={(e) => update({ content: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-2 py-2 text-xs text-white focus:outline-none focus:border-white/30 resize-none"
                  rows={2}
                  placeholder="Enter your text..."
                />
              </div>

              {/* Font */}
              <div>
                <label className="block text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">
                  Font
                </label>
                <select
                  value={textEl.fontFamily}
                  onChange={(e) => update({ fontFamily: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 rounded-sm px-2 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
                >
                  {FONTS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">
                  Size: {textEl.fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="200"
                  value={textEl.fontSize}
                  onChange={(e) => update({ fontSize: parseInt(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textEl.fill}
                    onChange={(e) => update({ fill: e.target.value })}
                    className="w-8 h-8 rounded border border-white/20 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs text-white/50">{textEl.fill}</span>
                </div>
              </div>

              {/* Style */}
              <div>
                <label className="block text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">
                  Style
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => update({ fontWeight: textEl.fontWeight === "700" ? "400" : "700" })}
                    className={`px-3 py-1.5 text-xs font-bold border rounded-sm transition-colors ${
                      textEl.fontWeight === "700" ? "bg-white text-black border-white" : "border-white/20 text-white/60"
                    }`}
                  >
                    B
                  </button>
                  <button
                    onClick={() => update({ fontStyle: textEl.fontStyle === "italic" ? "normal" : "italic" })}
                    className={`px-3 py-1.5 text-xs italic border rounded-sm transition-colors ${
                      textEl.fontStyle === "italic" ? "bg-white text-black border-white" : "border-white/20 text-white/60"
                    }`}
                  >
                    I
                  </button>
                </div>
              </div>

              {/* Alignment */}
              <div>
                <label className="block text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">
                  Alignment
                </label>
                <div className="flex gap-2">
                  {(["left", "center", "right"] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => update({ textAlign: align })}
                      className={`flex-1 py-1.5 text-xs border rounded-sm transition-colors capitalize ${
                        textEl.textAlign === align ? "bg-white text-black border-white" : "border-white/20 text-white/60"
                      }`}
                    >
                      {align.charAt(0).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Letter Spacing */}
              <div>
                <label className="block text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">
                  Letter Spacing: {textEl.letterSpacing}px
                </label>
                <input
                  type="range"
                  min="-5"
                  max="30"
                  value={textEl.letterSpacing}
                  onChange={(e) => update({ letterSpacing: parseInt(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>
            </>
          );
        })()}

        {/* Delete */}
        <button
          onClick={() => {
            store.deleteElement(element.id);
            toast("Element deleted", "info");
          }}
          className="w-full flex items-center justify-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 py-2 text-xs font-medium rounded-sm transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Delete Element
        </button>
      </div>
    </div>
  );
}
