import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { styleCategories } from "@/db/schema";

export async function GET() {
  const rows = await db
    .select()
    .from(styleCategories)
    .where(eq(styleCategories.isActive, true))
    .orderBy(asc(styleCategories.sortOrder));
  return NextResponse.json(rows);
}