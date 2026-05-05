import { NextResponse } from "next/server";
import { listItems, getTrip } from "@/lib/db";
import { suggestOutfit } from "@/lib/suggest";
import { requireUser } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-helpers";
import type { Style, Weather } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as {
      style?: Style;
      weather?: Weather | null;
      tripId?: number;
    };

    const items = await listItems(user.id);
    let pool: number[] | undefined;
    if (body.tripId) {
      const trip = await getTrip(user.id, body.tripId);
      if (!trip) return NextResponse.json({ error: "trip not found" }, { status: 404 });
      pool = trip.itemIds;
    }

    const suggestion = suggestOutfit({
      items,
      style: body.style,
      weather: body.weather,
      itemIdPool: pool,
    });
    if (!suggestion) {
      return NextResponse.json(
        { error: "Not enough items in your closet to build an outfit yet." },
        { status: 422 }
      );
    }
    return NextResponse.json({ suggestion });
  } catch (err) {
    return errorResponse(err);
  }
}
