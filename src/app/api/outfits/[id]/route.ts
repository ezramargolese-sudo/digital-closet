import { NextResponse } from "next/server";
import { getOutfit, updateOutfit, deleteOutfit } from "@/lib/db";
import { requireUser } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const outfit = await getOutfit(user.id, Number(id));
    if (!outfit) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ outfit });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const body = await req.json();
    const outfit = await updateOutfit(user.id, Number(id), body);
    if (!outfit) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ outfit });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const ok = await deleteOutfit(user.id, Number(id));
    if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
