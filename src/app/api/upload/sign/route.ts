import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { admin, requireUser, STORAGE_BUCKET } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"]);

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { ext } = (await req.json().catch(() => ({}))) as { ext?: string };
    const cleanExt = (ext ?? "jpg").replace(/^\./, "").toLowerCase();
    const safeExt = ALLOWED_EXT.has(cleanExt) ? cleanExt : "jpg";

    const id = crypto.randomBytes(8).toString("hex");
    const objectPath = `${user.id}/${Date.now()}-${id}.${safeExt}`;

    const { data, error } = await admin()
      .storage.from(STORAGE_BUCKET)
      .createSignedUploadUrl(objectPath);
    if (error) throw error;

    const { data: pub } = admin().storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);
    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: objectPath,
      publicUrl: pub.publicUrl,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
