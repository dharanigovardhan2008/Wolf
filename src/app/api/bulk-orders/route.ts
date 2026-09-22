import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { bulkOrders } from "@/db/schema";

const schema = z.object({
  name: z.string().trim().min(2),
  organization: z.string().trim().min(1),
  college: z.string().trim().optional().nullable(),
  eventName: z.string().trim().optional().nullable(),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7),
  quantity: z.number().int().positive(),
  tshirtType: z.string().min(1),
  fabricPreference: z.string().optional().nullable(),
  colors: z.string().min(1),
  sizeDistribution: z.record(z.string(), z.number().int().min(0)).optional().nullable(),
  frontDesignUrl: z.string().url().optional().nullable().or(z.literal("")),
  backDesignUrl: z.string().url().optional().nullable().or(z.literal("")),
  designDescription: z.string().optional().nullable(),
  deliveryDate: z.string().optional().nullable(), // "YYYY-MM-DD" from a date input
  deliveryAddress: z.string().optional().nullable(),
  budgetRange: z.string().optional().nullable(),
  additionalRequirements: z.string().optional().nullable(),
  honeypot: z.string().max(0).optional(), // spam trap: real users never fill this
});

function genOrderNumber() {
  return `BLK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    console.error("bulk order validation failed", parsed.error.issues);
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." },
      { status: 400 }
    );
  }
  const d = parsed.data;
  if (d.honeypot) {
    // Silently "succeed" for bots without writing to the database
    return NextResponse.json({ orderNumber: genOrderNumber() });
  }

  try {
    const orderNumber = genOrderNumber();
    await db.insert(bulkOrders).values({
      orderNumber,
      status: "NEW",
      name: d.name,
      organization: d.organization,
      college: d.college || null,
      eventName: d.eventName || null,
      email: d.email,
      phone: d.phone,
      quantity: d.quantity,
      tshirtType: d.tshirtType,
      fabricPreference: d.fabricPreference || null,
      colors: d.colors,
      sizeDistribution: d.sizeDistribution ?? null,
      frontDesignUrl: d.frontDesignUrl || null,
      backDesignUrl: d.backDesignUrl || null,
      designDescription: d.designDescription || null,
      deliveryDate: d.deliveryDate ? new Date(d.deliveryDate) : null,
      deliveryAddress: d.deliveryAddress || null,
      budgetRange: d.budgetRange || null,
      additionalRequirements: d.additionalRequirements || null,
    });
    return NextResponse.json({ orderNumber });
  } catch (err) {
    console.error("bulk order insert failed", err);
    return NextResponse.json({ error: "Could not submit your enquiry. Please try again." }, { status: 500 });
  }
}