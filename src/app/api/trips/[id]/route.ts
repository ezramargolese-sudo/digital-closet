import { NextResponse } from "next/server";
import { getTrip, updateTrip, deleteTrip } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const trip = await getTrip(Number(id));
  if (!trip) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ trip });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const trip = await updateTrip(Number(id), body);
  if (!trip) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ trip });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const ok = await deleteTrip(Number(id));
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
