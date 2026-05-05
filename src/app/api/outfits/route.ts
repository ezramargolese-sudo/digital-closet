import { NextResponse } from "next/server";
import { listOutfits, createOutfit } from "@/lib/db";
import type { Style } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const outfits = await listOutfits();
  return NextResponse.json({ outfits });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    name?: string;
    style?: Style;
    itemIds?: number[];
    favorite?: boolean;
  };
  if (!body.name || !body.itemIds?.length) {
    return NextResponse.json(
      { error: "name and at least one itemId required" },
      { status: 400 }
    );
  }
  const outfit = await createOutfit({
    name: body.name,
    style: body.style ?? "casual",
    itemIds: body.itemIds,
    favorite: !!body.favorite,
  });
  return NextResponse.json({ outfit }, { status: 201 });
}
