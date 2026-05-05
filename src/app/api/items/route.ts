import { NextResponse } from "next/server";
import { listItems, createItem } from "@/lib/db";
import { requireUser } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-helpers";
import type { Category } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const items = await listItems(user.id);
    return NextResponse.json({ items });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as {
      name?: string;
      category?: Category;
      color?: string;
      brand?: string | null;
      size?: string | null;
      price?: number | null;
      tags?: string[];
      imageUrl?: string;
      warmth?: number;
    };
    if (!body.name || !body.category || !body.color || !body.imageUrl) {
      return NextResponse.json(
        { error: "name, category, color, imageUrl required" },
        { status: 400 }
      );
    }
    const item = await createItem(user.id, {
      name: body.name,
      category: body.category,
      color: body.color,
      brand: body.brand ?? null,
      size: body.size ?? null,
      price: body.price ?? null,
      tags: body.tags ?? [],
      imageUrl: body.imageUrl,
      warmth: body.warmth ?? 3,
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
