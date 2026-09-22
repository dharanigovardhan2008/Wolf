import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { auth } from "@/lib/auth";

async function checkAdmin() {
  const session = await auth();
  return session && (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN");
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN" } }, { status: 403 });
  }
  const [settings] = await db.select().from(storeSettings).limit(1);
  return NextResponse.json({ success: true, data: settings });
}

export async function PATCH(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN" } }, { status: 403 });
  }

  const body = await req.json();
  const [existing] = await db.select().from(storeSettings).limit(1);

  if (existing) {
    const [updated] = await db
      .update(storeSettings)
      .set({ ...body, updatedAt: new Date() })
      .returning();
    return NextResponse.json({ success: true, data: updated });
  } else {
    const [created] = await db.insert(storeSettings).values(body).returning();
    return NextResponse.json({ success: true, data: created });
  }
}
