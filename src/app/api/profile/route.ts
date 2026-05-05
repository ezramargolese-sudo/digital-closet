import { NextResponse } from "next/server";
import { getProfile } from "@/lib/db";
import { requireUser } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const profile = await getProfile(user.id);
    return NextResponse.json({ profile });
  } catch (err) {
    return errorResponse(err);
  }
}
