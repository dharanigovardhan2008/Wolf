import "dotenv/config";
import { db } from "../db";
import {
  users, colors, sizes, fabrics, products, productVariants,
  productImages, storeSettings, orders, orderItems, orderStatusHistory, carts
} from "../db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding Wolf Theory database...");

  // ─── Colors ───────────────────────────────────────────────────────────────
  const colorData = [
    { name: "Midnight Black", hexCode: "#0A0A0A", sortOrder: 1 },
    { name: "Cloud White", hexCode: "#F5F5F5", sortOrder: 2 },
    { name: "Charcoal Gray", hexCode: "#3D3D3D", sortOrder: 3 },
    { name: "Navy Blue", hexCode: "#1B2A4A", sortOrder: 4 },
    { name: "Olive Green", hexCode: "#4A5240", sortOrder: 5 },
    { name: "Rust Orange", hexCode: "#B54A2C", sortOrder: 6 },
    { name: "Forest Green", hexCode: "#2D4A35", sortOrder: 7 },
    { name: "Burgundy", hexCode: "#6B1E2B", sortOrder: 8 },
  ];

  const insertedColors = await db.insert(colors).values(colorData).onConflictDoNothing().returning();
  console.log(`✓ Colors: ${insertedColors.length} inserted`);

  const allColors = await db.select().from(colors);

  // ─── Sizes ────────────────────────────────────────────────────────────────
  const sizeData = [
    { name: "XS", sortOrder: 1 },
    { name: "S", sortOrder: 2 },
    { name: "M", sortOrder: 3 },
    { name: "L", sortOrder: 4 },
    { name: "XL", sortOrder: 5 },
    { name: "XXL", sortOrder: 6 },
  ];
  const insertedSizes = await db.insert(sizes).values(sizeData).onConflictDoNothing().returning();
  console.log(`✓ Sizes: ${insertedSizes.length} inserted`);

  const allSizes = await db.select().from(sizes);

  // ─── Fabrics ──────────────────────────────────────────────────────────────
  const fabricData = [
    {
      name: "Heavyweight Cotton",
      description: "Premium heavyweight cotton for maximum comfort and durability.",
      composition: "100% Combed Cotton",
      gsm: 240,
    },
    {
      name: "Standard Cotton",
      description: "Classic everyday cotton — lightweight and breathable.",
      composition: "100% Ring-Spun Cotton",
      gsm: 180,
    },
    {
      name: "Cotton Blend",
      description: "Premium cotton-polyester blend for shape retention.",
      composition: "60% Cotton, 40% Polyester",
      gsm: 200,
    },
  ];
  const insertedFabrics = await db.insert(fabrics).values(fabricData).onConflictDoNothing().returning();
  console.log(`✓ Fabrics: ${insertedFabrics.length} inserted`);

  const allFabrics = await db.select().from(fabrics);

  // ─── Admin User ───────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@wolftheory.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "WolfTheory@2024!";
  const adminHash = await bcrypt.hash(adminPassword, 12);

  await db.insert(users).values({
    email: adminEmail,
    passwordHash: adminHash,
    name: "Wolf Theory Admin",
    role: "ADMIN",
    isActive: true,
  }).onConflictDoNothing();

  // ─── Sample Customer ──────────────────────────────────────────────────────
  const customerHash = await bcrypt.hash("Customer@123!", 12);
  await db.insert(users).values({
    email: "customer@example.com",
    passwordHash: customerHash,
    name: "Alex Singh",
    phone: "+91 98765 43210",
    role: "CUSTOMER",
    isActive: true,
  }).onConflictDoNothing();
  console.log("✓ Users seeded");

  // ─── Store Settings ───────────────────────────────────────────────────────
  const existingSettings = await db.select().from(storeSettings).limit(1);
  if (existingSettings.length === 0) {
    await db.insert(storeSettings).values({
      brandName: "Wolf Theory",
      contactEmail: "hello@wolftheory.com",
      currency: "INR",
      currencySymbol: "₹",
      frontPrintFee: "0",
      backPrintFee: "0",
      defaultCustomizationFee: "99",
      flatShippingRate: "99",
      freeShippingThreshold: "999",
      gstRate: "0",
      aboutContent: "[PLACEHOLDER: Add Wolf Theory brand story here. Describe the brand vision, founding philosophy, and what makes Wolf Theory unique. This content appears on the About page.]",
      returnPolicy: "[PLACEHOLDER: Add return/refund policy details here. Include timeframes, conditions, and the return process.]",
      shippingPolicy: "[PLACEHOLDER: Add shipping policy details including delivery timeframes, courier partners, and tracking information.]",
      privacyPolicy: "[PLACEHOLDER: Add privacy policy content here covering data collection, usage, and user rights.]",
      termsConditions: "[PLACEHOLDER: Add terms and conditions content here.]",
      printDpi: 300,
      printTechnology: "[PLACEHOLDER: Specify printing technology — DTG, DTF, Screen Print, etc.]",
    });
    console.log("✓ Store settings seeded");
  }

  // ─── Products ─────────────────────────────────────────────────────────────
  const productData = [
    {
      name: "Wolf Classic Oversized Tee",
      slug: "wolf-classic-oversized-tee",
      description: "The signature Wolf Theory oversized tee. Crafted from heavyweight 240 GSM combed cotton for a premium drop-shoulder fit that defines streetwear culture. Built to make a statement, designed to last.",
      shortDescription: "Signature heavyweight oversized fit. 240 GSM premium cotton.",
      category: "T-Shirts",
      productType: "oversized",
      basePrice: "799",
      customizationPrice: "199",
      fabricId: allFabrics[0]?.id,
      gsm: 240,
      isCustomizable: true,
      isFeatured: true,
      status: "PUBLISHED" as const,
    },
    {
      name: "Wolf Regular Fit Tee",
      slug: "wolf-regular-fit-tee",
      description: "The everyday essential. Wolf Theory's regular fit tee in 180 GSM ring-spun cotton delivers clean lines and comfortable wear from morning to midnight. Customizable to make it truly yours.",
      shortDescription: "Classic regular fit. 180 GSM ring-spun cotton.",
      category: "T-Shirts",
      productType: "regular",
      basePrice: "599",
      customizationPrice: "149",
      fabricId: allFabrics[1]?.id,
      gsm: 180,
      isCustomizable: true,
      isFeatured: true,
      status: "PUBLISHED" as const,
    },
    {
      name: "Wolf Drop Shoulder Tee",
      slug: "wolf-drop-shoulder-tee",
      description: "Extended drop shoulders, relaxed body, premium feel. The Wolf Drop Shoulder Tee is engineered for the culture — heavyweight cotton meets editorial proportions.",
      shortDescription: "Drop shoulder silhouette. 240 GSM premium construction.",
      category: "T-Shirts",
      productType: "drop-shoulder",
      basePrice: "899",
      customizationPrice: "199",
      fabricId: allFabrics[0]?.id,
      gsm: 240,
      isCustomizable: true,
      isFeatured: true,
      status: "PUBLISHED" as const,
    },
    {
      name: "Wolf Polo Club Tee",
      slug: "wolf-polo-club-tee",
      description: "Elevated streetwear meets classic polo construction. Premium cotton blend with ribbed collar and placket — the Wolf Polo Club Tee bridges street and sophistication.",
      shortDescription: "Street-meets-sophistication polo. Premium cotton blend.",
      category: "T-Shirts",
      productType: "polo",
      basePrice: "999",
      customizationPrice: "249",
      fabricId: allFabrics[2]?.id,
      gsm: 200,
      isCustomizable: true,
      isFeatured: false,
      status: "PUBLISHED" as const,
    },
    {
      name: "Wolf Longline Tee",
      slug: "wolf-longline-tee",
      description: "Extended length, curved hem, premium weight. The Wolf Longline Tee makes a statement with every silhouette — perfect for layering or wearing solo.",
      shortDescription: "Extended hem longline cut. Heavyweight 240 GSM.",
      category: "T-Shirts",
      productType: "longline",
      basePrice: "849",
      customizationPrice: "199",
      fabricId: allFabrics[0]?.id,
      gsm: 240,
      isCustomizable: true,
      isFeatured: false,
      status: "PUBLISHED" as const,
    },
    {
      name: "Wolf Crew Essentials Tee",
      slug: "wolf-crew-essentials-tee",
      description: "The foundation of every wardrobe. Lightweight, versatile, and built for everyday wear. The Crew Essentials Tee is the blank canvas your self-expression deserves.",
      shortDescription: "Lightweight everyday essential. 180 GSM ring-spun cotton.",
      category: "T-Shirts",
      productType: "regular",
      basePrice: "549",
      customizationPrice: "149",
      fabricId: allFabrics[1]?.id,
      gsm: 180,
      isCustomizable: true,
      isFeatured: false,
      status: "PUBLISHED" as const,
    },
  ];

  const insertedProducts = await db.insert(products).values(productData).onConflictDoNothing().returning();
  console.log(`✓ Products: ${insertedProducts.length} inserted`);

  // ─── Product Images (placeholder URLs) ───────────────────────────────────
  for (const product of insertedProducts) {
    await db.insert(productImages).values([
      {
        productId: product.id,
        url: `/images/products/${product.slug}-front.jpg`,
        alt: `${product.name} front view`,
        sortOrder: 1,
        isPrimary: true,
      },
      {
        productId: product.id,
        url: `/images/products/${product.slug}-back.jpg`,
        alt: `${product.name} back view`,
        sortOrder: 2,
        isPrimary: false,
      },
    ]).onConflictDoNothing();
  }
  console.log("✓ Product images seeded");

  // ─── Product Variants ─────────────────────────────────────────────────────
  const sizeMap: Record<string, string> = {};
  for (const s of allSizes) sizeMap[s.name] = s.id;

  const colorMap: Record<string, string> = {};
  for (const c of allColors) colorMap[c.name] = c.id;

  const variantsToCreate = [];

  for (const product of insertedProducts) {
    const colorCombos = ["Midnight Black", "Cloud White", "Charcoal Gray"];
    const sizeCombos = ["S", "M", "L", "XL", "XXL"];

    for (const colorName of colorCombos) {
      for (const sizeName of sizeCombos) {
        const colorId = colorMap[colorName];
        const sizeId = sizeMap[sizeName];
        if (!colorId || !sizeId) continue;

        const typeCode = product.productType.substring(0, 2).toUpperCase();
        const colorCode = colorName.substring(0, 3).toUpperCase();
        const sku = `WT-${typeCode}-${colorCode}-${sizeName}`;
        const uniqueSku = `${sku}-${product.id.substring(0, 4)}`;

        variantsToCreate.push({
          productId: product.id,
          sku: uniqueSku,
          colorId,
          sizeId,
          priceAdjustment: sizeName === "XXL" ? "50" : "0",
          stock: Math.floor(Math.random() * 40) + 10,
          reservedStock: 0,
          lowStockThreshold: 5,
          isAvailable: true,
        });
      }
    }
  }

  await db.insert(productVariants).values(variantsToCreate).onConflictDoNothing();
  console.log(`✓ Variants: ${variantsToCreate.length} created`);

  // ─── Sample Orders ────────────────────────────────────────────────────────
  const customerUser = await db.select().from(users).where(eq(users.email, "customer@example.com")).limit(1);
  const sampleProduct = insertedProducts[0];
  const allVariants = await db.select().from(productVariants).limit(1);

  if (customerUser[0] && sampleProduct && allVariants[0]) {
    const orderNum = `WT-20240115-DEMO`;
    const existingOrders = await db.select().from(orders).where(eq(orders.orderNumber, orderNum)).limit(1);
    
    if (existingOrders.length === 0) {
      const [sampleOrder] = await db.insert(orders).values({
        orderNumber: orderNum,
        userId: customerUser[0].id,
        status: "DELIVERED",
        paymentStatus: "CAPTURED",
        shippingName: "Alex Singh",
        shippingEmail: "customer@example.com",
        shippingPhone: "+91 98765 43210",
        shippingAddress: "123 Street Name",
        shippingCity: "Mumbai",
        shippingState: "Maharashtra",
        shippingPincode: "400001",
        shippingCountry: "India",
        subtotal: "799",
        discount: "0",
        shippingCost: "99",
        tax: "0",
        total: "898",
        paymentGateway: "razorpay",
        paymentOrderId: "order_demo123",
        paymentId: "pay_demo456",
      }).returning();

      await db.insert(orderItems).values({
        orderId: sampleOrder.id,
        productId: sampleProduct.id,
        variantId: allVariants[0].id,
        productName: sampleProduct.name,
        productSlug: sampleProduct.slug,
        sku: allVariants[0].sku,
        colorName: "Midnight Black",
        colorHex: "#0A0A0A",
        sizeName: "L",
        fabricName: "Heavyweight Cotton",
        quantity: 1,
        unitPrice: "799",
        totalPrice: "799",
        isCustomized: false,
      });

      await db.insert(orderStatusHistory).values([
        { orderId: sampleOrder.id, status: "NEW", note: "Order placed" },
        { orderId: sampleOrder.id, status: "CONFIRMED", note: "Payment confirmed" },
        { orderId: sampleOrder.id, status: "DELIVERED", note: "Package delivered" },
      ]);
      console.log("✓ Sample orders seeded");
    }
  }

  console.log("\n🎉 Wolf Theory database seeded successfully!");
  console.log(`\n👤 Admin login: ${adminEmail}`);
  console.log(`🔑 Admin password: ${adminPassword}`);
  console.log("👤 Customer login: customer@example.com");
  console.log("🔑 Customer password: Customer@123!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
