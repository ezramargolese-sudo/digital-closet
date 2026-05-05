import { NextResponse } from "next/server";
import { respondToFriendRequest } from "@/lib/db";
import { requireUser } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const { accept } = (await req.json()) as { accept?: boolean };
    await respondToFriendRequest(user.id, Number(id), !!accept);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
