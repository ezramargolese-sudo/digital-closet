import { NextResponse } from "next/server";
import path from "node:path";
import crypto from "node:crypto";
import { admin, requireUser, STORAGE_BUCKET } from "@/lib/supabase";
import { errorResponse } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 413 });
    }
    const buf = Buffer.from(await file.arrayBuffer());

    const extFromName = path.extname(file.name || "").toLowerCase();
    const ext =
      extFromName ||
      (file.type === "image/png"
        ? ".png"
        : file.type === "image/webp"
          ? ".webp"
          : file.type === "image/gif"
            ? ".gif"
            : file.type === "image/heic" || file.type === "image/heif"
              ? ".heic"
              : ".jpg");
    const id = crypto.randomBytes(8).toString("hex");
    const objectPath = `${user.id}/${Date.now()}-${id}${ext}`;

    const { error: upErr } = await admin()
      .storage.from(STORAGE_BUCKET)
      .upload(objectPath, buf, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    const { data } = admin().storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);
    return NextResponse.json({ url: data.publicUrl }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
