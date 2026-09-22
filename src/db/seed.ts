import { db } from "./index";
import { users, products, colors, sizes, fabrics, styleCategories, productVariants, productImages } from "./schema";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create admin user
  const adminPassword = await bcrypt.hash("wolftheory2025", 10);
  const [admin] = await db.insert(users).values({
    email: "admin@wolftheory.com",
    name: "Wolf Theory Admin",
    passwordHash: adminPassword,
    role: "SUPER_ADMIN",
    isActive: true,
  }).returning();

  console.log("✅ Admin user created");

  // 2. Create colors
  const colorData = [
    { name: "Pitch Black", hexCode: "#000000", sortOrder: 1 },
    { name: "Wolf Grey", hexCode: "#808080", sortOrder: 2 },
    { name: "Arctic White", hexCode: "#FFFFFF", sortOrder: 3 },
  ];

  const insertedColors = await db.insert(colors).values(colorData).returning();
  console.log("✅ Colors created");

  // 3. Create sizes
  const sizeData = [
    { name: "S", sortOrder: 1 },
    { name: "M", sortOrder: 2 },
    { name: "L", sortOrder: 3 },
    { name: "XL", sortOrder: 4 },
    { name: "XXL", sortOrder: 5 },
  ];

  const insertedSizes = await db.insert(sizes).values(sizeData).returning();
  console.log("✅ Sizes created");

  // 4. Create fabrics
  const [fabricHeavyweight] = await db.insert(fabrics).values({
    name: "Heavyweight French Terry",
    description: "Premium 320 GSM fabric with exceptional durability",
    composition: "100% Cotton",
    gsm: 320,
  }).returning();

  console.log("✅ Fabrics created");

  // 5. Create style category
  const [categoryStreetWear] = await db.insert(styleCategories).values({
    name: "Streetwear",
    slug: "streetwear",
    subtitle: "Urban fashion essentials",
    sortOrder: 1,
    isActive: true,
  }).returning();

  console.log("✅ Style categories created");

  // 6. Create a sample product
  const [product] = await db.insert(products).values({
    name: "Wolf Pack Oversized Hoodie",
    slug: "wolf-pack-oversized-hoodie",
    description: "Premium heavyweight hoodie with customizable print area",
    shortDescription: "Ultimate comfort meets street style",
    category: "Hoodies",
    productType: "Hoodie",
    basePrice: "2499",
    actualPrice: "1999",
    customizationPrice: "299",
    fabricId: fabricHeavyweight.id,
    styleCategoryId: categoryStreetWear.id,
    gsm: 320,
    isCustomizable: true,
    isFeatured: true,
    showInHero: true,
    heroOrder: 1,
    status: "PUBLISHED",
  }).returning();

  console.log("✅ Sample product created");

  // 7. Create product variants (all color/size combinations)
  const variants = [];
  for (const color of insertedColors) {
    for (const size of insertedSizes) {
      variants.push({
        productId: product.id,
        sku: `WOLF-HOOD-${color.name.toUpperCase().replace(" ", "")}-${size.name}`,
        colorId: color.id,
        sizeId: size.id,
        stock: 50,
        isAvailable: true,
      });
    }
  }

  await db.insert(productVariants).values(variants);
  console.log("✅ Product variants created");

  // 8. Create product images
  await db.insert(productImages).values([
    {
      productId: product.id,
      url: "/images/products/hoodie-black-front.jpg",
      alt: "Wolf Pack Hoodie - Front View",
      colorId: insertedColors[0].id, // Black
      sortOrder: 1,
      isPrimary: true,
    },
    {
      productId: product.id,
      url: "/images/products/hoodie-black-back.jpg",
      alt: "Wolf Pack Hoodie - Back View",
      colorId: insertedColors[0].id,
      sortOrder: 2,
      isPrimary: false,
    },
  ]);

  console.log("✅ Product images created");

  console.log("\n🎉 Seeding complete!");
  console.log(`\n👤 Admin login:\n   Email: admin@wolftheory.com\n   Password: wolftheory2025\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });