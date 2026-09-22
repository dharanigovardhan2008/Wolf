import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  orders,
  orderItems,
  productVariants,
  products,
  colors,
  sizes,
  fabrics,
  orderStatusHistory,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { generateOrderNumber } from "@/lib/utils";
import { auth } from "@/lib/auth";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        quantity: z.number().int().positive(),
        isCustomized: z.boolean().default(false),
      })
    )
    .min(1),
  shipping: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6),
    addressLine1: z.string().min(3),
    addressLine2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(5),
    country: z.string().default("India"),
    gstNumber: z.string().optional(),
    companyName: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();

    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request",
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { items, shipping } = parsed.data;

    // Validate and price items server-side
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const [variant] = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.id, item.variantId))
        .limit(1);

      if (!variant || !variant.isAvailable) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "OUT_OF_STOCK",
              message: "A product in your cart is out of stock",
            },
          },
          { status: 409 }
        );
      }

      const availableStock = variant.stock - variant.reservedStock;
      if (availableStock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INSUFFICIENT_STOCK",
              message: `Insufficient stock for ${variant.sku}`,
            },
          },
          { status: 409 }
        );
      }

      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, variant.productId))
        .limit(1);

      const [colorData] = await db
        .select()
        .from(colors)
        .where(eq(colors.id, variant.colorId))
        .limit(1);

      const [sizeData] = await db
        .select()
        .from(sizes)
        .where(eq(sizes.id, variant.sizeId))
        .limit(1);

      const fabricRows = product?.fabricId
        ? await db
            .select()
            .from(fabrics)
            .where(eq(fabrics.id, product.fabricId))
            .limit(1)
        : null;
      const fabric = fabricRows ? fabricRows[0] : null;

      const basePrice = parseFloat(product?.basePrice ?? "0");
      const priceAdj = parseFloat(variant.priceAdjustment);
      const customFee = item.isCustomized
        ? parseFloat(product?.customizationPrice ?? "0")
        : 0;
      const unitPrice = basePrice + priceAdj + customFee;
      const totalPrice = unitPrice * item.quantity;

      subtotal += totalPrice;

      orderItemsData.push({
        variant,
        product,
        color: colorData,
        size: sizeData,
        fabric,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        isCustomized: item.isCustomized,
      });
    }

    // Calculate shipping and tax (server-authoritative)
    const shippingCost = subtotal >= 999 ? 0 : 99;
    const tax = 0; // Configure GST when applicable
    const total = subtotal + shippingCost + tax;

    // Create order
    const orderNumber = generateOrderNumber();

    // FIXED: Use correct field names matching schema
    const [newOrder] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId: session?.user?.id ?? null,
        status: "NEW",
        paymentStatus: "PENDING",
        
        // Shipping fields - CORRECT NAMES
        shippingName: shipping.name,
        shippingEmail: shipping.email,
        shippingPhone: shipping.phone,
        shippingAddress: `${shipping.addressLine1}${
          shipping.addressLine2 ? `, ${shipping.addressLine2}` : ""
        }`,
        shippingCity: shipping.city,
        shippingState: shipping.state,
        shippingPincode: shipping.pincode,
        shippingCountry: shipping.country ?? "India",
        
        // Optional fields
        gstNumber: shipping.gstNumber,
        companyName: shipping.companyName,
        notes: shipping.notes,
        
        // Pricing
        subtotal: String(subtotal.toFixed(2)),
        discount: "0",
        shippingCost: String(shippingCost.toFixed(2)),
        tax: String(tax.toFixed(2)),
        total: String(total.toFixed(2)),
        
        // Payment
        paymentGateway: "razorpay",
        paymentOrderId: `pending_${Date.now()}`,
      })
      .returning();

    // Insert order items
    await db.insert(orderItems).values(
      orderItemsData.map((item) => ({
        orderId: newOrder.id,
        productId: item.product?.id,
        variantId: item.variant.id,
        productName: item.product?.name ?? "",
        productSlug: item.product?.slug ?? "",
        sku: item.variant.sku,
        colorName: item.color?.name ?? "",
        colorHex: item.color?.hexCode ?? "#000000",
        sizeName: item.size?.name ?? "",
        fabricName: item.fabric?.name,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice.toFixed(2)),
        totalPrice: String(item.totalPrice.toFixed(2)),
        isCustomized: item.isCustomized,
      }))
    );

    // Reserve inventory
    for (const item of orderItemsData) {
      await db
        .update(productVariants)
        .set({
          reservedStock: item.variant.reservedStock + item.quantity,
        })
        .where(eq(productVariants.id, item.variant.id));
    }

    // Status history
    await db.insert(orderStatusHistory).values({
      orderId: newOrder.id,
      status: "NEW",
      note: "Order placed, awaiting payment",
    });

    // DEMO MODE: Auto-confirm order
    await db
      .update(orders)
      .set({
        status: "CONFIRMED",
        paymentStatus: "CAPTURED",
        paymentId: `demo_${Date.now()}`,
      })
      .where(eq(orders.id, newOrder.id));

    await db.insert(orderStatusHistory).values({
      orderId: newOrder.id,
      status: "CONFIRMED",
      note: "Payment confirmed (demo mode)",
    });

    // Release reserved stock and commit
    for (const item of orderItemsData) {
      await db
        .update(productVariants)
        .set({
          stock: item.variant.stock - item.quantity,
          reservedStock: Math.max(0, item.variant.reservedStock - item.quantity),
        })
        .where(eq(productVariants.id, item.variant.id));
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        total,
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to create order" },
      },
      { status: 500 }
    );
  }
}