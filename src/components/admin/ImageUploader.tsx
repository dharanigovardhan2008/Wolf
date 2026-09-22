"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Star } from "lucide-react";

export type UploadedImage = { url: string; publicId: string; colorId?: string | null };

export function ImageUploader({
  value,
  onChange,
  max = 8,
  endpoint = "/api/admin/upload",
  uploadPreset,
  colorOptions, // NEW: pass an array of { id, name, hexCode } to enable per-image color tagging
}: {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  max?: number;
  endpoint?: string;
  uploadPreset?: string;
  colorOptions?: Array<{ id: string; name: string; hexCode: string }>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");
    setBusy(true);
    const next = [...value];
    for (const file of Array.from(files)) {
      if (next.length >= max) {
        setError(`You can upload up to ${max} images.`);
        break;
      }
      const fd = new FormData();
      fd.append("file", file);
      if (uploadPreset) fd.append("uploadPreset", uploadPreset);
      try {
        const res = await fetch(endpoint, { method: "POST", body: fd });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || `Upload failed (${res.status})`);
        next.push({ url: data.url, publicId: data.publicId, colorId: null });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    }
    onChange(next);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function setImageColor(index: number, colorId: string) {
    const next = [...value];
    next[index] = { ...next[index], colorId: colorId || null };
    onChange(next);
  }

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-colors hover:bg-gray-100"
      >
        <UploadCloud className="mx-auto mb-2 h-8 w-8 text-gray-400" />
        <p className="text-sm font-semibold text-gray-700">
          {busy ? "Uploading…" : "Click to choose images or drag them here"}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          JPG, PNG or WEBP, up to 4 MB each. The first image is the main image.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          aria-label="Upload images"
          onChange={(e) => uploadFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {value.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {value.map((img, i) => (
            <li
              key={`${img.publicId}-${i}`}
              className="rounded-lg border border-gray-200 bg-white p-2"
            >
              <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
                <Image src={img.url} alt={`Image ${i + 1}`} fill sizes="200px" className="object-cover" />
                {i === 0 && (
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white">
                    <Star className="h-3 w-3" /> MAIN
                  </span>
                )}
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                  className="absolute right-2 top-2 rounded-full bg-white p-1 shadow hover:bg-gray-100"
                >
                  <X className="h-4 w-4 text-gray-700" />
                </button>
              </div>

              {colorOptions && colorOptions.length > 0 && (
                <div className="mt-2">
                  <label className="mb-1 block text-[11px] font-medium text-gray-500">
                    Color shown in photo
                  </label>
                  <select
                    value={img.colorId ?? ""}
                    onChange={(e) => setImageColor(i, e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="">General / all colors</option>
                    {colorOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}