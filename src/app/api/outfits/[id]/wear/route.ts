import { NextResponse } from "next/server";
import { incrementOutfitWornCount, getOutfit, updateItem } from "@/lib/db";
import { requireUser } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const outfitId = Number(id);
    const outfit = await incrementOutfitWornCount(user.id, outfitId);
    if (!outfit) return NextResponse.json({ error: "not found" }, { status: 404 });

    // Stamp last_worn_at on each item too
    const full = await getOutfit(user.id, outfitId);
    if (full) {
      const now = new Date().toISOString();
      await Promise.all(
        full.itemIds.map((iid) => updateItem(user.id, iid, { lastWornAt: now }))
      );
    }
    return NextResponse.json({ outfit });
  } catch (err) {
    return errorResponse(err);
  }
}
