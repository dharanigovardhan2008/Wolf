import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Account — Wolf Theory" };

export default async function AccountPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">My Account</h1>
        
        <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-gray-700">Name</label>
              <p className="mt-1 text-base text-black">{session.user.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <p className="mt-1 text-base text-black">{session.user.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-700">Role</label>
              <p className="mt-1 text-base text-black">{session.user.role}</p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">Account settings and profile editing coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}