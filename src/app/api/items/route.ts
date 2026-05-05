import { NextResponse } from "next/server";
import { listItems, createItem } from "@/lib/db";
import type { Category } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await listItems();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    name?: string;
    category?: Category;
    color?: string;
    brand?: string | null;
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
  const item = await createItem({
    name: body.name,
    category: body.category,
    color: body.color,
    brand: body.brand ?? null,
    tags: body.tags ?? [],
    imageUrl: body.imageUrl,
    warmth: body.warmth ?? 3,
  });
  return NextResponse.json({ item }, { status: 201 });
}
