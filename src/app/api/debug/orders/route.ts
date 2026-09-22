import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Get all unique shipping emails
    const emails = await db
      .selectDistinct({ email: orders.shippingEmail })
      .from(orders);

    // Get order count
    const count = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders);

    return NextResponse.json({
      totalOrders: count[0]?.count || 0,
      uniqueEmails: emails.map(e => e.email),
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}