import { NextResponse } from "next/server";
import { listTrips, createTrip } from "@/lib/db";
import { requireUser } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const trips = await listTrips(user.id);
    return NextResponse.json({ trips });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as {
      name?: string;
      destination?: string | null;
      startDate?: string | null;
      endDate?: string | null;
      itemIds?: number[];
    };
    if (!body.name) {
      return NextResponse.json({ error: "name required" }, { status: 400 });
    }
    const trip = await createTrip(user.id, {
      name: body.name,
      destination: body.destination ?? null,
      startDate: body.startDate ?? null,
      endDate: body.endDate ?? null,
      itemIds: body.itemIds ?? [],
    });
    return NextResponse.json({ trip }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
