import { StyleForm } from "@/components/admin/StyleForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Style — Wolf Theory Admin" };

export default function NewStylePage() {
  return (
    <div className="p-6 md:p-8 text-[#111]">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold">New Style</h1>
        <p className="text-sm text-gray-500">Add a tile to the &quot;Shop by Style&quot; grid.</p>
      </div>
      <StyleForm />
    </div>
  );
}