import { NextResponse } from "next/server";
import {
  getProfileByUsername,
  areFriends,
  listOutfitsForUser,
} from "@/lib/db";
import { admin, requireUser } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, ctx: { params: Promise<{ username: string }> }) {
  try {
    const user = await requireUser();
    const { username } = await ctx.params;
    const target = await getProfileByUsername(username);
    if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (target.id !== user.id && !(await areFriends(user.id, target.id))) {
      return NextResponse.json({ error: "Not friends" }, { status: 403 });
    }
    const outfits = await listOutfitsForUser(target.id);
    // Also fetch the items so the frontend can render image previews
    const itemIds = Array.from(new Set(outfits.flatMap((o) => o.itemIds)));
    let items: Array<{
      id: number;
      name: string;
      category: string;
      image_url: string;
    }> = [];
    if (itemIds.length) {
      const { data, error } = await admin()
        .from("items")
        .select("id,name,category,image_url")
        .in("id", itemIds);
      if (error) throw error;
      items = data ?? [];
    }
    return NextResponse.json({ profile: target, outfits, items });
  } catch (err) {
    return errorResponse(err);
  }
}
