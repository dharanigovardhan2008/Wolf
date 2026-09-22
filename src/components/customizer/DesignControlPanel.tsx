"use client";

import { useRef } from "react";
import { Upload, Type, Trash2, Copy, ArrowUp, ArrowDown, Image as ImageIcon } from "lucide-react";
import { useCustomizerStore } from "@/stores/customizerStore";
import { toast } from "@/components/ui/Toaster";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export function DesignControlPanel() {
  const store = useCustomizerStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentElements = store.currentSide === "front"
    ? store.front.elements
    : store.back.elements;

  const selectedElement = currentElements.find((el) => el.id === store.selectedElementId);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast("Only PNG, JPG, and WebP files are allowed", "error");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast("File size must be under 10MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      if (src) {
        store.addImageElement(src);
        toast("Image added!", "success");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const event = { target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileUpload(event);
  }

  return (
    <div className="p-4 space-y-6">
      {/* Upload Image */}
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-3">
          Upload Image
        </p>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-white/20 rounded-sm p-6 text-center cursor-pointer hover:border-white/40 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          aria-label="Upload image for design"
        >
          <Upload className="w-6 h-6 text-white/30 mx-auto mb-2" />
          <p className="text-xs text-white/50">Drag & drop or click to upload</p>
          <p className="text-[10px] text-white/30 mt-1">PNG, JPG up to 10MB</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* Add Text */}
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-3">
          Add Text
        </p>
        <button
          onClick={() => {
            store.addTextElement();
            toast("Text element added!", "success");
          }}
          className="w-full flex items-center justify-center gap-2 border border-white/20 text-white/70 hover:text-white hover:border-white/40 py-3 text-sm font-medium rounded-sm transition-colors"
        >
          <Type className="w-4 h-4" />
          Add Text Layer
        </button>
      </div>

      {/* Elements List */}
      {currentElements.length > 0 && (
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-3">
            Layers ({currentElements.length})
          </p>
          <div className="space-y-2">
            {[...currentElements].reverse().map((el) => (
              <div
                key={el.id}
                onClick={() => store.selectElement(el.id === store.selectedElementId ? null : el.id)}
                className={`flex items-center gap-3 p-3 rounded-sm cursor-pointer transition-colors ${
                  store.selectedElementId === el.id
                    ? "bg-white/10 border border-white/20"
                    : "bg-white/5 border border-transparent hover:bg-white/8"
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && store.selectElement(el.id)}
                aria-pressed={store.selectedElementId === el.id}
                aria-label={`Select ${el.type} element: ${el.type === "text" ? el.content : "image"}`}
              >
                {el.type === "image" ? (
                  <ImageIcon className="w-4 h-4 text-white/40 shrink-0" />
                ) : (
                  <Type className="w-4 h-4 text-white/40 shrink-0" />
                )}
                <span className="text-xs truncate flex-1">
                  {el.type === "text" ? el.content : "Image"}
                </span>

                {store.selectedElementId === el.id && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); store.bringForward(el.id); }}
                      className="p-1 text-white/40 hover:text-white"
                      aria-label="Bring forward"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); store.sendBackward(el.id); }}
                      className="p-1 text-white/40 hover:text-white"
                      aria-label="Send backward"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); store.duplicateElement(el.id); }}
                      className="p-1 text-white/40 hover:text-white"
                      aria-label="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); store.deleteElement(el.id); toast("Element removed", "info"); }}
                      className="p-1 text-red-400 hover:text-red-300"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {currentElements.length === 0 && (
        <div className="text-center py-8 text-white/30">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs">No design elements yet</p>
          <p className="text-[10px] mt-1">Upload an image or add text to start</p>
        </div>
      )}
    </div>
  );
}
