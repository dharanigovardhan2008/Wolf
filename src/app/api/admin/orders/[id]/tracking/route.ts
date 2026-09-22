import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    
    const { trackingUrl, trackingNumber, courierName } = body;

    await db
      .update(orders)
      .set({
        trackingUrl,
        trackingNumber,
        courierName,
      })
      .where(eq(orders.id, id));

    return NextResponse.json({ 
      success: true,
      message: "Tracking information updated successfully" 
    });
  } catch (error) {
    console.error("Error updating tracking:", error);
    return NextResponse.json(
      { error: "Failed to update tracking information" },
      { status: 500 }
    );
  }
}