import { NextResponse } from "next/server";
import {
  listFriends,
  listIncomingRequests,
  sendFriendRequest,
  getProfileByUsername,
} from "@/lib/db";
import { requireUser } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const [friends, requests] = await Promise.all([
      listFriends(user.id),
      listIncomingRequests(user.id),
    ]);
    return NextResponse.json({ friends, requests });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { username } = (await req.json()) as { username?: string };
    if (!username?.trim()) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }
    const target = await getProfileByUsername(username.trim());
    if (!target) {
      return NextResponse.json({ error: "No user with that username" }, { status: 404 });
    }
    const result = await sendFriendRequest(user.id, target.id);
    return NextResponse.json({ status: result.status, target });
  } catch (err) {
    return errorResponse(err);
  }
}
