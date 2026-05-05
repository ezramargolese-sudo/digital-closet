import { NextResponse } from "next/server";
import { serverClient, SupabaseConfigError } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as { email?: string; password?: string };
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  try {
    const sc = await serverClient();
    const { error } = await sc.auth.signInWithPassword({ email, password });
    if (error) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof SupabaseConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Login failed" },
      { status: 500 }
    );
  }
}
