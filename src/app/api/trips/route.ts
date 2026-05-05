import { NextResponse } from "next/server";
import { listTrips, createTrip } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const trips = await listTrips();
  return NextResponse.json({ trips });
}

export async function POST(req: Request) {
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
  const trip = await createTrip({
    name: body.name,
    destination: body.destination ?? null,
    startDate: body.startDate ?? null,
    endDate: body.endDate ?? null,
    itemIds: body.itemIds ?? [],
  });
  return NextResponse.json({ trip }, { status: 201 });
}
