import { NextResponse } from "next/server";
import { SupabaseConfigError, UnauthorizedError } from "./supabase";

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof UnauthorizedError) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (err instanceof SupabaseConfigError) {
    return NextResponse.json({ error: err.message }, { status: 503 });
  }
  return NextResponse.json(
    { error: err instanceof Error ? err.message : "Server error" },
    { status: 500 }
  );
}
