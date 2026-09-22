import { Suspense } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CustomizeSection } from "@/components/home/CustomizeSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { WhyWolfTheory } from "@/components/home/WhyWolfTheory";
import { BulkOrderCTA } from "@/components/home/BulkOrderCTA";
import { ProductsSkeleton } from "@/components/home/ProductsSkeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wolf Theory — Premium Custom Streetwear",
  description:
    "Design your own custom t-shirt in 3D. Premium youth streetwear for college students, creators, and culture makers. Customize, create, wear.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<ProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>
      <CustomizeSection />
      <ProcessSection />
      <WhyWolfTheory />
      <BulkOrderCTA />
    </>
  );
}
