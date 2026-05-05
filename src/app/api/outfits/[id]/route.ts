import { NextResponse } from "next/server";
import { getOutfit, updateOutfit, deleteOutfit } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const outfit = await getOutfit(Number(id));
  if (!outfit) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ outfit });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const outfit = await updateOutfit(Number(id), body);
  if (!outfit) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ outfit });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const ok = await deleteOutfit(Number(id));
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
