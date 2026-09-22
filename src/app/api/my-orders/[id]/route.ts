import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, products, productVariants, colors, sizes, productImages } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Fetch order
    const orderData = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.id, id),
          eq(orders.shippingEmail, email)
        )
      )
      .limit(1);

    if (!orderData || orderData.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orderData[0];

    // Fetch order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .orderBy(desc(orderItems.createdAt));

    // Fetch full details for each item
    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        // Fetch product
        const product = item.productId
          ? await db
              .select()
              .from(products)
              .where(eq(products.id, item.productId))
              .limit(1)
          : [];

        // Fetch variant with color and size
        const variant = item.variantId
          ? await db
              .select({
                id: productVariants.id,
                colorId: productVariants.colorId,
                sizeId: productVariants.sizeId,
                colorName: colors.name,
                colorCode: colors.code,
                sizeName: sizes.name,
              })
              .from(productVariants)
              .leftJoin(colors, eq(productVariants.colorId, colors.id))
              .leftJoin(sizes, eq(productVariants.sizeId, sizes.id))
              .where(eq(productVariants.id, item.variantId))
              .limit(1)
          : [];

        // Fetch product images
        const images = item.productId
          ? await db
              .select()
              .from(productImages)
              .where(eq(productImages.productId, item.productId))
              .orderBy(desc(productImages.isPrimary))
          : [];

        const variantData = variant[0] || null;
        const productData = product[0] || null;

        // Priority: color-specific image > primary image > any image
        const colorImage = images.find(img => img.colorId === variantData?.colorId);
        const primaryImage = images.find(img => img.isPrimary);
        const anyImage = images[0];

        const imageUrl = colorImage?.url || primaryImage?.url || anyImage?.url || null;

        return {
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          customizationText: item.customizationText,
          customizationFont: item.customizationFont,
          customizationColor: item.customizationColor,
          productName: productData?.name || "Unknown Product",
          productSlug: productData?.slug || null,
          colorName: variantData?.colorName || null,
          colorCode: variantData?.colorCode || null,
          sizeName: variantData?.sizeName || null,
          imageUrl,
        };
      })
    );

    return NextResponse.json({
      order,
      items: itemsWithDetails,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}