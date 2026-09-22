import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Wishlist — Wolf Theory" };

export default async function WishlistPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/wishlist");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">My Wishlist</h1>
        
        <div className="bg-white rounded-3xl border border-black/5 p-16 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <svg 
            className="mx-auto h-16 w-16 text-gray-300 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
          <h3 className="text-lg font-semibold text-black mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-6">Save your favorite products to buy them later</p>
          <a 
            href="/shop"
            className="inline-block rounded-full bg-black px-8 py-3 text-sm font-bold text-white hover:bg-black/90 transition-all"
          >
            Browse Products
          </a>
        </div>
      </div>
    </div>
  );
}