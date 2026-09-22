import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Wolf Theory database seed...')

  // 1. Create Admin Account
  const adminPassword = await bcrypt.hash('Admin@WolfTheory2024', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@wolftheory.com' },
    update: {},
    create: {
      email: 'admin@wolftheory.com',
      name: 'Wolf Theory Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user seeded:', admin.email)

  // 2. Create Colors
  const colors = await Promise.all([
    prisma.color.upsert({ where: { name: 'Pitch Black' }, update: {}, create: { name: 'Pitch Black', hexCode: '#000000', sortOrder: 1 } }),
    prisma.color.upsert({ where: { name: 'Raw Bone' }, update: {}, create: { name: 'Raw Bone', hexCode: '#F4F1EA', sortOrder: 2 } }),
    prisma.color.upsert({ where: { name: 'Asphalt Gray' }, update: {}, create: { name: 'Asphalt Gray', hexCode: '#3A3A3C', sortOrder: 3 } }),
  ])

  // 3. Create Sizes
  const sizes = await Promise.all([
    prisma.size.upsert({ where: { name: 'S' }, update: {}, create: { name: 'S', sortOrder: 1 } }),
    prisma.size.upsert({ where: { name: 'M' }, update: {}, create: { name: 'M', sortOrder: 2 } }),
    prisma.size.upsert({ where: { name: 'L' }, update: {}, create: { name: 'L', sortOrder: 3 } }),
    prisma.size.upsert({ where: { name: 'XL' }, update: {}, create: { name: 'XL', sortOrder: 4 } }),
  ])

  // 4. Create Fabrics
  const heavyweightCotton = await prisma.fabric.upsert({
    where: { name: 'Heavyweight French Terry' },
    update: {},
    create: {
      name: 'Heavyweight French Terry',
      composition: '100% Combed Cotton',
      description: '240 GSM ultra-soft, structural drape.',
    },
  })

  // 5. Create Core Product
  const product = await prisma.product.upsert({
    where: { slug: 'heavyweight-oversized-tee' },
    update: {},
    create: {
      name: 'Heavyweight Oversized Tee',
      slug: 'heavyweight-oversized-tee',
      description: 'The foundation of Wolf Theory. Drop-shoulder heavy boxy cut built for custom street graphics.',
      shortDescription: '240 GSM Heavyweight Streetwear Tee.',
      category: 'Oversized Tees',
      productType: 'Oversized',
      basePrice: 1499.00,
      customizationPrice: 300.00,
      fabricId: heavyweightCotton.id,
      gsm: 240,
      isCustomizable: true,
      isFeatured: true,
      status: 'PUBLISHED',
      printAreaConfig: {
        front: { width: 0.3, height: 0.4, offsetX: 0, offsetY: 0.05 },
        back: { width: 0.35, height: 0.45, offsetX: 0, offsetY: 0.05 }
      }
    },
  })

  // 6. Create Product Variants & Stock
  for (const color of colors) {
    for (const size of sizes) {
      const sku = `WT-OV-${color.name.substring(0, 3).toUpperCase()}-${size.name}`
      await prisma.productVariant.upsert({
        where: { sku },
        update: {},
        create: {
          productId: product.id,
          colorId: color.id,
          sizeId: size.id,
          sku,
          stock: 50,
          priceAdjustment: 0,
        },
      })
    }
  }

  // 7. Store Settings
  await prisma.storeSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      brandName: 'WOLF THEORY',
      contactEmail: 'support@wolftheory.com',
      currency: 'INR',
      currencySymbol: '₹',
      frontPrintFee: 150.00,
      backPrintFee: 150.00,
      flatShippingRate: 99.00,
      freeShippingThreshold: 1999.00,
    },
  })

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })