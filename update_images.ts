import { db } from "./src/db";
import { productImages } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  const dummyImages = [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800"
  ];
  
  const allImages = await db.select().from(productImages);
  let counter = 0;
  for (const img of allImages) {
    await db.update(productImages)
      .set({ url: dummyImages[counter % dummyImages.length] })
      .where(eq(productImages.id, img.id));
    counter++;
  }
  console.log("Images updated!");
  process.exit(0);
}
run();
