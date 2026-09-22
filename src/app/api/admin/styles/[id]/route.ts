import { NextResponse } from "next/server";
import { z } from "zod";
import { and, count, eq, ne } from "drizzle-orm";
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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse({ ...body, slug: body?.slug ? slugify(body.slug) : slugify(body?.name ?? "") });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  }
  const d = parsed.data;

  const clash = await db
    .select({ id: styleCategories.id })
    .from(styleCategories)
    .where(and(eq(styleCategories.slug, d.slug), ne(styleCategories.id, id)))
    .limit(1);
  if (clash.length > 0) {
    return NextResponse.json({ error: "That slug is already used by another style." }, { status: 409 });
  }

  await db.update(styleCategories).set({ ...d, updatedAt: new Date() }).where(eq(styleCategories.id, id));
  return NextResponse.json({ id });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const [used] = await db.select({ count: count() }).from(products).where(eq(products.styleCategoryId, id));
  if (used.count > 0) {
    return NextResponse.json(
      { error: `Unassign ${used.count} product(s) from this style before deleting it.` },
      { status: 409 }
    );
  }

  await db.delete(styleCategories).where(eq(styleCategories.id, id));
  return NextResponse.json({ result: "deleted" });
}