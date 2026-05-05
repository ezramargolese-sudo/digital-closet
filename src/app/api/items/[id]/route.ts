import { NextResponse } from "next/server";
import { getItem, updateItem, deleteItem } from "@/lib/db";
import { requireUser } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const item = await getItem(user.id, Number(id));
    if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const body = await req.json();
    const item = await updateItem(user.id, Number(id), body);
    if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const ok = await deleteItem(user.id, Number(id));
    if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
