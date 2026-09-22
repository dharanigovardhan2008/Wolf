import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bulkOrders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  status: z
    .enum([
      "NEW",
      "CONTACTED",
      "QUOTATION_SENT",
      "NEGOTIATION",
      "CONFIRMED",
      "IN_PRODUCTION",
      "COMPLETED",
      "CANCELLED",
    ])
    .optional(),
  adminNotes: z.string().nullable().optional(),
  quotationAmount: z.number().min(0).nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: "Invalid input", details: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check the order exists
    const [existing] = await db
      .select({ id: bulkOrders.id })
      .from(bulkOrders)
      .where(eq(bulkOrders.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: { message: "Bulk order not found" } },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (data.status !== undefined) updates.status = data.status;
    if (data.adminNotes !== undefined) updates.adminNotes = data.adminNotes;
    if (data.quotationAmount !== undefined) {
      updates.quotationAmount = data.quotationAmount?.toString() ?? null;
    }

    await db.update(bulkOrders).set(updates).where(eq(bulkOrders.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bulk order update error:", error);
    return NextResponse.json(
      { error: { message: "Something went wrong" } },
      { status: 500 }
    );
  }
}

