import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Wolf Theory database seed...')

  // 1. Create Admin Account
  const adminPassword = await bcrypt.hash('Admin@WolfTheory2024', 10)
  const admin = await prisma.users.upsert({
    where: { email: 'admin@wolftheory.com' },
    update: {},
    create: {
      email: 'admin@wolftheory.com',
      name: 'Wolf Theory Admin',
      password_hash: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user seeded:', admin.email)

  // 2. Create Colors
  const colors = await Promise.all([
    prisma.colors.upsert({
      where: { name: 'Pitch Black' },
      update: {},
      create: { name: 'Pitch Black', hex_code: '#000000', sort_order: 1 },
    }),
    prisma.colors.upsert({
      where: { name: 'Raw Bone' },
      update: {},
      create: { name: 'Raw Bone', hex_code: '#F4F1EA', sort_order: 2 },
    }),
    prisma.colors.upsert({
      where: { name: 'Asphalt Gray' },
      update: {},
      create: { name: 'Asphalt Gray', hex_code: '#3A3A3C', sort_order: 3 },
    }),
  ])

  // 3. Create Sizes
  const sizes = await Promise.all([
    prisma.sizes.upsert({ where: { name: 'S' }, update: {}, create: { name: 'S', sort_order: 1 } }),
    prisma.sizes.upsert({ where: { name: 'M' }, update: {}, create: { name: 'M', sort_order: 2 } }),
    prisma.sizes.upsert({ where: { name: 'L' }, update: {}, create: { name: 'L', sort_order: 3 } }),
    prisma.sizes.upsert({ where: { name: 'XL' }, update: {}, create: { name: 'XL', sort_order: 4 } }),
  ])

  // 4. Create Fabrics
  const heavyweightCotton = await prisma.fabrics.upsert({
    where: { name: 'Heavyweight French Terry' },
    update: {},
    create: {
      name: 'Heavyweight French Terry',
      composition: '100% Combed Cotton',
      description: '240 GSM ultra-soft, structural drape.',
    },
  })

  // 5. Create Core Product
  const product = await prisma.products.upsert({
    where: { slug: 'heavyweight-oversized-tee' },
    update: {},
    create: {
      name: 'Heavyweight Oversized Tee',
      slug: 'heavyweight-oversized-tee',
      description: 'The foundation of Wolf Theory. Drop-shoulder heavy boxy cut built for custom street graphics.',
      short_description: '240 GSM Heavyweight Streetwear Tee.',
      category: 'Oversized Tees',
      product_type: 'Oversized',
      base_price: 1499.0,
      customization_price: 300.0,
      fabric_id: heavyweightCotton.id,
      gsm: 240,
      is_customizable: true,
      is_featured: true,
      status: 'PUBLISHED',
      print_area_config: {
        front: { width: 0.3, height: 0.4, offsetX: 0, offsetY: 0.05 },
        back: { width: 0.35, height: 0.45, offsetX: 0, offsetY: 0.05 },
      },
    },
  })

  // 6. Create Product Variants & Stock
  for (const color of colors) {
    for (const size of sizes) {
      const sku = `WT-OV-${color.name.substring(0, 3).toUpperCase()}-${size.name}`
      await prisma.product_variants.upsert({
        where: { sku },
        update: {},
        create: {
          product_id: product.id,
          color_id: color.id,
          size_id: size.id,
          sku,
          stock: 50,
          price_adjustment: 0,
        },
      })
    }
  }

  // 7. Store Settings
  // Note: store_settings has no unique business key besides its generated id,
  // so we look for an existing row first and update it, or create a new one.
  const existingSettings = await prisma.store_settings.findFirst()
  if (existingSettings) {
    await prisma.store_settings.update({
      where: { id: existingSettings.id },
      data: {
        brand_name: 'WOLF THEORY',
        contact_email: 'support@wolftheory.com',
        currency: 'INR',
        currency_symbol: '₹',
        front_print_fee: 150.0,
        back_print_fee: 150.0,
        flat_shipping_rate: 99.0,
        free_shipping_threshold: 1999.0,
      },
    })
  } else {
    await prisma.store_settings.create({
      data: {
        brand_name: 'WOLF THEORY',
        contact_email: 'support@wolftheory.com',
        currency: 'INR',
        currency_symbol: '₹',
        front_print_fee: 150.0,
        back_print_fee: 150.0,
        flat_shipping_rate: 99.0,
        free_shipping_threshold: 1999.0,
      },
    })
  }

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