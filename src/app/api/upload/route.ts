import { NextResponse } from "next/server";
import path from "node:path";
import crypto from "node:crypto";
import { admin, STORAGE_BUCKET } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
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
          : ".jpg");
  const id = crypto.randomBytes(8).toString("hex");
  const objectPath = `items/${Date.now()}-${id}${ext}`;

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
}
