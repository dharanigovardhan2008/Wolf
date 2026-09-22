import { NextResponse } from "next/server";
import { z } from "zod";
import { asc, count, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { styleCategories, products } from "@/db/schema";
import { auth } from "@/lib/auth";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const schema = z.object({
  name: z.string().trim().min(2).max(60),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/),
  subtitle: z.string().trim().max(120).nullable(),
  imageUrl: z.string().url().nullable(),
  imagePublicId: z.string().nullable(),
  sortOrder: z.number().int().min(0).max(999),
  isActive: z.boolean(),
});

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rows = await db.select().from(styleCategories).orderBy(asc(styleCategories.sortOrder));
  const withCounts = await Promise.all(
    rows.map(async (r) => {
      const [c] = await db.select({ count: count() }).from(products).where(eq(products.styleCategoryId, r.id));
      return { ...r, productCount: c.count };
    })
  );
  return NextResponse.json(withCounts);
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse({ ...body, slug: body?.slug ? slugify(body.slug) : slugify(body?.name ?? "") });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const d = parsed.data;

  const clash = await db.select({ id: styleCategories.id }).from(styleCategories).where(eq(styleCategories.slug, d.slug)).limit(1);
  if (clash.length > 0) {
    return NextResponse.json({ error: "That slug is already used. Change the name or slug." }, { status: 409 });
  }

  const [created] = await db.insert(styleCategories).values(d).returning({ id: styleCategories.id });
  return NextResponse.json({ id: created.id });
}