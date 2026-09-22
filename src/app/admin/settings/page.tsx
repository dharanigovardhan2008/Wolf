import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings — Wolf Theory Admin" };

export default async function AdminSettingsPage() {
  const [settings] = await db.select().from(storeSettings).limit(1);

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Store Settings</h1>
        <p className="text-sm text-white/40">Configure Wolf Theory store-wide settings</p>
      </div>
      <AdminSettingsForm settings={settings} />
    </div>
  );
}
