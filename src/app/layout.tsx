import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import { Navigation } from "@/components/layout/Navigation"; 
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/providers/SessionProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import { Toaster } from "@/components/ui/Toaster";
import { auth } from "@/lib/auth";
import "./globals.css";

const sora = Sora({ 
  subsets: ["latin"], 
  variable: "--font-sora", 
  display: "swap" 
});

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter", 
  display: "swap" 
});

export const metadata: Metadata = {
  title: "Wolf Theory",
  description: "Premium Custom Streetwear",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch the session on the server to prevent UI flickering
  const session = await auth();

  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`} data-scroll-behavior="smooth">
      <body className="antialiased bg-[#eeeeef] min-h-screen flex flex-col items-center p-4 md:p-8 pt-20 md:pt-24">
        <AuthProvider session={session}>
          <CartProvider>
            <Navigation />
            {/* The global background is #eeeeef. The app resides inside this large white floating card. */}
            <div className="w-full max-w-[1400px] min-h-[90vh] bg-surface rounded-card-lg shadow-float overflow-hidden flex flex-col relative mt-16 md:mt-20">
              <main id="main-content" className="flex-1 relative">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}