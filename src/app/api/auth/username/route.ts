import { NextResponse } from "next/server";
import { admin, SupabaseConfigError } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const u = (new URL(req.url).searchParams.get("u") ?? "").trim().toLowerCase();
  if (!/^[a-z0-9_.]{3,20}$/.test(u)) {
    return NextResponse.json({ available: false, reason: "invalid" });
  }
  try {
    // Use a non-HEAD query so missing tables surface as errors (PostgREST
    // returns 204 with null count on HEAD-against-missing-table).
    const { data, error } = await admin()
      .from("profiles")
      .select("id")
      .eq("username", u)
      .limit(1);
    if (error) throw error;
    return NextResponse.json({ available: (data?.length ?? 0) === 0 });
  } catch (err) {
    if (err instanceof SupabaseConfigError) {
      return NextResponse.json({ available: false, reason: "config" }, { status: 503 });
    }
    return NextResponse.json(
      { available: false, reason: err instanceof Error ? err.message : "error" },
      { status: 500 }
    );
  }
}
