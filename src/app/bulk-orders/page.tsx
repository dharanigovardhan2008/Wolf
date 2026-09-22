"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Users, Clock, Package, Palette, Upload, X } from "lucide-react";
import Image from "next/image";
import { ImageUploader, type UploadedImage } from "@/components/admin/ImageUploader";

const TSHIRT_TYPES = [
  "Round Neck T-Shirt",
  "Polo T-Shirt",
  "Oversized T-Shirt",
  "V-Neck T-Shirt",
  "Full Sleeve T-Shirt",
  "Crop Top",
  "Hoodie",
];

const BUDGET_RANGES = [
  "₹150–₹250 per piece",
  "₹250–₹400 per piece",
  "₹400–₹600 per piece",
  "₹600+ per piece",
  "Not sure — need a quote",
];

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;

type SizeDistribution = Record<string, number>;

interface FieldErrors {
  [key: string]: string[] | undefined;
}

export default function BulkOrdersPage() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [college, setCollege] = useState("");
  const [eventName, setEventName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState("");
  const [tshirtType, setTshirtType] = useState("");
  const [fabricPreference, setFabricPreference] = useState("");
  const [colors, setColors] = useState("");
  const [sizeDistribution, setSizeDistribution] = useState<SizeDistribution>(
    Object.fromEntries(SIZES.map((s) => [s, 0]))
  );
  const [frontDesign, setFrontDesign] = useState<UploadedImage[]>([]);
  const [backDesign, setBackDesign] = useState<UploadedImage[]>([]);
  const [designDescription, setDesignDescription] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [website, setWebsite] = useState(""); // honeypot

  function getFieldError(field: string): string | undefined {
    return fieldErrors[field]?.[0];
  }

  const totalSizes = Object.values(sizeDistribution).reduce((a, b) => a + b, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsLoading(true);

    try {
      const res = await fetch("/api/bulk-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          organization,
          college: college || undefined,
          eventName: eventName || undefined,
          email,
          phone,
          quantity: parseInt(quantity) || 0,
          tshirtType,
          fabricPreference: fabricPreference || undefined,
          colors,
          sizeDistribution: totalSizes > 0 ? sizeDistribution : undefined,
          frontDesignUrl: frontDesign[0]?.url || undefined,
          backDesignUrl: backDesign[0]?.url || undefined,
          designDescription: designDescription || undefined,
          deliveryDate: deliveryDate || undefined,
          deliveryAddress: deliveryAddress || undefined,
          budgetRange: budgetRange || undefined,
          additionalRequirements: additionalRequirements || undefined,
          website, // honeypot
        }),
      });

      const data = await res.json();

      if (!data.success) {
        if (data.error?.details) setFieldErrors(data.error.details);
        setError(data.error?.message ?? "Something went wrong");
        return;
      }

      setOrderNumber(data.data.orderNumber);
      setStep("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (step === "success") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-black uppercase mb-3 text-primary">Order Received!</h1>
          <p className="text-muted mb-2">Your bulk order enquiry has been submitted successfully.</p>
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 inline-block">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Order Reference</p>
            <p className="text-xl font-mono font-bold text-primary">{orderNumber}</p>
          </div>
          <p className="text-sm text-muted mb-8">
            Our team will review your requirements and contact you within{" "}
            <strong className="text-primary">24–48 hours</strong> with a detailed quotation.
            Check your email at <strong className="text-primary">{email}</strong> for updates.
          </p>
          <p className="text-xs text-muted">
            Email sending is not yet configured — you will not receive an automatic confirmation email.
            Our team will reach out manually.
          </p>
        </div>
      </div>
    );
  }

  const inputClass = (field: string) =>
    `w-full bg-white border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all ${
      getFieldError(field) ? "border-red-300" : "border-gray-200"
    }`;

  return (
    <div className="px-4 sm:px-8 lg:px-12 py-12 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted font-semibold mb-3">Bulk & Custom Orders</p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase mb-4 text-primary leading-tight">
          Custom T-Shirts<br />for Your Team
        </h1>
        <p className="text-muted max-w-2xl mx-auto">
          From college fests to corporate events — get premium custom-printed t-shirts
          at wholesale prices. MOQ as low as 10 pieces, delivered anywhere in India.
        </p>
      </div>

      {/* Trust Points */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[
          { icon: Package, label: "MOQ 10 Pieces", desc: "Start with just 10 tees" },
          { icon: Clock, label: "7–14 Day Delivery", desc: "Fast turnaround on bulk" },
          { icon: Palette, label: "Full Customization", desc: "Your design, your colours" },
          { icon: Users, label: "500+ Orders Delivered", desc: "Colleges & companies trust us" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-bold text-primary mb-0.5">{item.label}</p>
            <p className="text-xs text-muted">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-8 lg:p-10">
        <h2 className="text-xl font-bold mb-1 text-primary">Place a Bulk Order</h2>
        <p className="text-sm text-muted mb-8">Fill in the details and we&apos;ll get back to you with a quote.</p>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Honeypot — hidden from humans */}
          <div className="absolute opacity-0 pointer-events-none" aria-hidden="true" tabIndex={-1}>
            <input
              type="text"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Contact Info */}
          <fieldset>
            <legend className="text-xs uppercase tracking-[0.15em] text-muted font-semibold mb-4">Contact Information</legend>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-primary mb-1.5">Your Name *</label>
                <input id="name" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass("name")} placeholder="John Doe" />
                {getFieldError("name") && <p className="text-xs text-red-500 mt-1">{getFieldError("name")}</p>}
              </div>
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-primary mb-1.5">Organization *</label>
                <input id="organization" value={organization} onChange={(e) => setOrganization(e.target.value)} required className={inputClass("organization")} placeholder="Company or college name" />
                {getFieldError("organization") && <p className="text-xs text-red-500 mt-1">{getFieldError("organization")}</p>}
              </div>
              <div>
                <label htmlFor="college" className="block text-sm font-medium text-primary mb-1.5">College (if applicable)</label>
                <input id="college" value={college} onChange={(e) => setCollege(e.target.value)} className={inputClass("college")} placeholder="e.g. IIT Madras" />
              </div>
              <div>
                <label htmlFor="eventName" className="block text-sm font-medium text-primary mb-1.5">Event Name (if any)</label>
                <input id="eventName" value={eventName} onChange={(e) => setEventName(e.target.value)} className={inputClass("eventName")} placeholder="e.g. Techfest 2026" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary mb-1.5">Email *</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass("email")} placeholder="you@example.com" />
                {getFieldError("email") && <p className="text-xs text-red-500 mt-1">{getFieldError("email")}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-primary mb-1.5">Phone *</label>
                <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputClass("phone")} placeholder="9876543210" />
                {getFieldError("phone") && <p className="text-xs text-red-500 mt-1">{getFieldError("phone")}</p>}
              </div>
            </div>
          </fieldset>

          {/* Order Details */}
          <fieldset>
            <legend className="text-xs uppercase tracking-[0.15em] text-muted font-semibold mb-4">Order Details</legend>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-primary mb-1.5">Total Quantity *</label>
                <input id="quantity" type="number" min="10" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className={inputClass("quantity")} placeholder="Min 10" />
                {getFieldError("quantity") && <p className="text-xs text-red-500 mt-1">{getFieldError("quantity")}</p>}
              </div>
              <div>
                <label htmlFor="tshirtType" className="block text-sm font-medium text-primary mb-1.5">T-Shirt Type *</label>
                <select id="tshirtType" value={tshirtType} onChange={(e) => setTshirtType(e.target.value)} required className={inputClass("tshirtType")}>
                  <option value="">Select type</option>
                  {TSHIRT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {getFieldError("tshirtType") && <p className="text-xs text-red-500 mt-1">{getFieldError("tshirtType")}</p>}
              </div>
              <div>
                <label htmlFor="fabricPreference" className="block text-sm font-medium text-primary mb-1.5">Fabric Preference</label>
                <input id="fabricPreference" value={fabricPreference} onChange={(e) => setFabricPreference(e.target.value)} className={inputClass("fabricPreference")} placeholder="e.g. 100% Cotton, 220 GSM" />
              </div>
              <div>
                <label htmlFor="colors" className="block text-sm font-medium text-primary mb-1.5">Colors *</label>
                <input id="colors" value={colors} onChange={(e) => setColors(e.target.value)} required className={inputClass("colors")} placeholder="e.g. Black, White, Navy" />
                {getFieldError("colors") && <p className="text-xs text-red-500 mt-1">{getFieldError("colors")}</p>}
              </div>
            </div>

            {/* Size Distribution */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-primary mb-2">
                Size Distribution {totalSizes > 0 && <span className="text-muted font-normal">(Total: {totalSizes})</span>}
              </label>
              <div className="flex flex-wrap gap-3">
                {SIZES.map((size) => (
                  <div key={size} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-xs font-bold text-primary w-8">{size}</span>
                    <input
                      type="number"
                      min="0"
                      value={sizeDistribution[size] || ""}
                      onChange={(e) =>
                        setSizeDistribution((prev) => ({ ...prev, [size]: parseInt(e.target.value) || 0 }))
                      }
                      className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center text-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              {quantity && totalSizes > 0 && totalSizes !== parseInt(quantity) && (
                <p className="text-xs text-amber-600 mt-2">
                  Size total ({totalSizes}) doesn&apos;t match quantity ({quantity}). This is fine — we&apos;ll confirm sizes with you.
                </p>
              )}
            </div>
          </fieldset>

          {/* Design */}
          <fieldset>
            <legend className="text-xs uppercase tracking-[0.15em] text-muted font-semibold mb-4">Design</legend>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              {/* Front Design Upload */}
              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">Front Design</label>
                <ImageUploader 
                  value={frontDesign} 
                  onChange={setFrontDesign} 
                  max={1} 
                  endpoint="/api/bulk-orders/upload" 
                  uploadPreset="wolf_bulk_designs" 
                />
              </div>
              {/* Back Design Upload */}
              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">Back Design</label>
                <ImageUploader 
                  value={backDesign} 
                  onChange={setBackDesign} 
                  max={1} 
                  endpoint="/api/bulk-orders/upload" 
                  uploadPreset="wolf_bulk_designs" 
                />
              </div>
            </div>
            <div>
              <label htmlFor="designDescription" className="block text-sm font-medium text-primary mb-1.5">Design Description</label>
              <textarea
                id="designDescription"
                value={designDescription}
                onChange={(e) => setDesignDescription(e.target.value)}
                rows={3}
                className={inputClass("designDescription")}
                placeholder="Describe your design requirements, text, placement, etc."
              />
            </div>
          </fieldset>

          {/* Logistics */}
          <fieldset>
            <legend className="text-xs uppercase tracking-[0.15em] text-muted font-semibold mb-4">Logistics & Budget</legend>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="deliveryDate" className="block text-sm font-medium text-primary mb-1.5">Needed By</label>
                <input
                  id="deliveryDate"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className={inputClass("deliveryDate")}
                />
              </div>
              <div>
                <label htmlFor="budgetRange" className="block text-sm font-medium text-primary mb-1.5">Budget Range</label>
                <select id="budgetRange" value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)} className={inputClass("budgetRange")}>
                  <option value="">Select budget range</option>
                  {BUDGET_RANGES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="deliveryAddress" className="block text-sm font-medium text-primary mb-1.5">Delivery Address</label>
                <input id="deliveryAddress" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className={inputClass("deliveryAddress")} placeholder="City, state or full address" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="additionalRequirements" className="block text-sm font-medium text-primary mb-1.5">Additional Requirements</label>
                <textarea
                  id="additionalRequirements"
                  value={additionalRequirements}
                  onChange={(e) => setAdditionalRequirements(e.target.value)}
                  rows={3}
                  className={inputClass("additionalRequirements")}
                  placeholder="Packaging, individual polybags, name tags, etc."
                />
              </div>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto bg-primary text-white px-10 py-4 text-sm font-bold tracking-widest uppercase rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting…
              </span>
            ) : (
              "Submit Enquiry"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}