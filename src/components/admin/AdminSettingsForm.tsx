"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/Toaster";
import { Save } from "lucide-react";

// Adjust this type to match your actual schema
type SettingsFormValues = {
  brandName: string;
  contactEmail: string;
  contactPhone: string;
  frontPrintFee: number;
  backPrintFee: number;
  defaultCustomFee: number;
  flatShippingRate: number;
  freeShippingAbove: number;
};

interface AdminSettingsFormProps {
  settings: any; // Replace 'any' with your actual Drizzle schema select type
}

export function AdminSettingsForm({ settings }: AdminSettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SettingsFormValues>({
    defaultValues: {
      brandName: settings?.brandName || "Wolf Theory",
      contactEmail: settings?.contactEmail || "hello@wolftheory.com",
      contactPhone: settings?.contactPhone || "",
      frontPrintFee: settings?.frontPrintFee || 0.00,
      backPrintFee: settings?.backPrintFee || 0.00,
      defaultCustomFee: settings?.defaultCustomFee || 99.00,
      flatShippingRate: settings?.flatShippingRate || 99.00,
      freeShippingAbove: settings?.freeShippingAbove || 999.00,
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSaving(true);
    try {
      // Add your API call here
      // await fetch('/api/admin/settings', { method: 'POST', body: JSON.stringify(data) });
      toast("Settings updated successfully.", "success");
    } catch (error) {
      toast("Failed to update settings.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // UPDATED: Using solid text-neutral colors for guaranteed visibility
  const sectionClass = "bg-[#18181b] p-8 rounded-xl mb-8 border border-neutral-800";
  const sectionTitleClass = "text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-6";
  const labelClass = "block text-[12px] font-medium text-neutral-300 mb-2 tracking-wide";
  const inputClass = "w-full bg-black border border-neutral-800 rounded-md px-4 py-3.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors shadow-inner";

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      
      {/* BRAND SECTION */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Brand</h2>
        
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Brand Name</label>
            <input
              {...register("brandName")}
              placeholder="Wolf Theory"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Contact Email</label>
            <input
              {...register("contactEmail")}
              type="email"
              placeholder="hello@wolftheory.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Contact Phone</label>
            <input
              {...register("contactPhone")}
              placeholder="+91 XXXXX XXXXX"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* PRICING & FEES SECTION */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Pricing & Fees</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Front Print Fee (₹)</label>
              <input
                {...register("frontPrintFee", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Back Print Fee (₹)</label>
              <input
                {...register("backPrintFee", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Default Custom Fee (₹)</label>
              <input
                {...register("defaultCustomFee", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="99.00"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Flat Shipping Rate (₹)</label>
              <input
                {...register("flatShippingRate", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="99.00"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Free Shipping Above (₹)</label>
              <input
                {...register("freeShippingAbove", { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="999.00"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTON */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="group flex items-center gap-2 bg-black text-white px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Configuration
            </>
          )}
        </button>
      </div>

    </form>
  );
}