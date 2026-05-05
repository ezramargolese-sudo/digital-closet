import { NextResponse } from "next/server";
import { listNotifications, markNotificationsRead } from "@/lib/db";
import { requireUser } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const notifications = await listNotifications(user.id);
    return NextResponse.json({ notifications });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST() {
  try {
    const user = await requireUser();
    await markNotificationsRead(user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
