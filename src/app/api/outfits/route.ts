import { NextResponse } from "next/server";
import { listOutfits, createOutfit } from "@/lib/db";
import { requireUser } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-helpers";
import type { Style, Season } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const outfits = await listOutfits(user.id);
    return NextResponse.json({ outfits });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as {
      name?: string;
      style?: Style;
      itemIds?: number[];
      seasons?: Season[];
      favorite?: boolean;
    };
    if (!body.name || !body.itemIds?.length) {
      return NextResponse.json(
        { error: "name and at least one itemId required" },
        { status: 400 }
      );
    }
    const outfit = await createOutfit(user.id, {
      name: body.name,
      style: body.style ?? "casual",
      itemIds: body.itemIds,
      seasons: body.seasons ?? [],
      favorite: !!body.favorite,
    });
    return NextResponse.json({ outfit }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
