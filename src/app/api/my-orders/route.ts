import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, products, productImages, productVariants } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Extract email from request (passed from client)
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    console.log("Fetching orders for email:", email);

    // Fetch all orders for this user
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.shippingEmail, email))
      .orderBy(desc(orders.createdAt));

    console.log("Found orders:", userOrders.length);

    // For each order, fetch items with product details
    const ordersWithDetails = await Promise.all(
      userOrders.map(async (order) => {
        // Get order items count
        const itemsCount = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));

        const count = itemsCount[0]?.count || 0;

        // Get order items with product details
        const items = await db
          .select({
            productId: orderItems.productId,
            productName: products.name,
            variantId: orderItems.variantId,
          })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id))
          .limit(4); // Only get first 4 for thumbnails

        // Get images for each product
        const itemsWithImages = await Promise.all(
          items.map(async (item) => {
            if (!item.productId) {
              return {
                productName: item.productName || "Unknown Product",
                imageUrl: null,
              };
            }

            // Get variant details for color
            let colorId = null;
            if (item.variantId) {
              const variant = await db
                .select({ colorId: productVariants.colorId })
                .from(productVariants)
                .where(eq(productVariants.id, item.variantId))
                .limit(1);
              
              colorId = variant[0]?.colorId || null;
            }

            // Fetch images
            const images = await db
              .select()
              .from(productImages)
              .where(eq(productImages.productId, item.productId))
              .orderBy(desc(productImages.isPrimary));

            const colorImage = images.find(img => img.colorId === colorId);
            const primaryImage = images.find(img => img.isPrimary);
            const anyImage = images[0];

            const imageUrl = colorImage?.url || primaryImage?.url || anyImage?.url || null;

            return {
              productName: item.productName || "Unknown Product",
              imageUrl,
            };
          })
        );

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          itemCount: count,
          createdAt: order.createdAt,
          trackingUrl: order.trackingUrl,
          items: itemsWithImages,
        };
      })
    );

    console.log("Returning orders with details:", ordersWithDetails.length);

    return NextResponse.json({
      orders: ordersWithDetails,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}