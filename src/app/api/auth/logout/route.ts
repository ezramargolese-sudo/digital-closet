import { NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const sc = await serverClient();
  await sc.auth.signOut();
  return NextResponse.json({ ok: true });
}
