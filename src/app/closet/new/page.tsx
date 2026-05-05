"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { CATEGORIES, STYLES, type Category, type Style } from "@/lib/types";

export default function NewItemPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("top");
  const [color, setColor] = useState("");
  const [brand, setBrand] = useState("");
  const [warmth, setWarmth] = useState(3);
  const [tags, setTags] = useState<Style[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "Upload failed");
      } else {
        setImageUrl(d.url);
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function toggleTag(t: Style) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function save() {
    if (!imageUrl || !name.trim() || !color.trim()) {
      setError("Photo, name, and color are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const r = await fetch("/api/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          color: color.trim(),
          brand: brand.trim() || null,
          tags,
          imageUrl,
          warmth,
        }),
      });
      if (!r.ok) {
        const d = await r.json();
        setError(d.error ?? "Save failed");
      } else {
        router.push("/closet");
      }
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header title="Add item" back="/closet" />
      <div className="space-y-5 px-5 pb-8">
        {/* Image picker */}
        <div className="rounded-2xl border border-line bg-white p-3">
          {imageUrl ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Preview"
                className="aspect-square w-full rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="absolute right-2 top-2 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-medium text-paper"
              >
                Replace
              </button>
            </div>
          ) : (
            <div className="grid aspect-square place-items-center rounded-xl bg-paper">
              {uploading ? (
                <p className="text-sm text-muted">Uploading...</p>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="text-4xl">📸</span>
                  <p className="text-sm text-muted">Add a photo of this item</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => cameraRef.current?.click()}
                      className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper"
                    >
                      Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium"
                    >
                      Upload
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </div>

        {/* Name */}
        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="White cotton tee"
            className="w-full rounded-xl border border-line bg-white px-4 py-3"
          />
        </Field>

        {/* Category */}
        <Field label="Category">
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition ${
                  category === c.value
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-white text-ink"
                }`}
              >
                <span className="text-xl">{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Color">
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="white"
              className="w-full rounded-xl border border-line bg-white px-4 py-3"
            />
          </Field>
          <Field label="Brand">
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="optional"
              className="w-full rounded-xl border border-line bg-white px-4 py-3"
            />
          </Field>
        </div>

        <Field label={`Warmth (${warmth}/5)`}>
          <input
            type="range"
            min={1}
            max={5}
            value={warmth}
            onChange={(e) => setWarmth(Number(e.target.value))}
            className="w-full accent-ink"
          />
          <div className="flex justify-between text-[11px] text-muted">
            <span>Light</span>
            <span>Heavy</span>
          </div>
        </Field>

        <Field label="Style tags">
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleTag(s.value)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                  tags.includes(s.value)
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-white text-ink"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        {error ? (
          <p className="rounded-xl border border-line bg-white p-3 text-sm text-accent">{error}</p>
        ) : null}

        <button
          onClick={save}
          disabled={saving || uploading}
          className="w-full rounded-2xl bg-ink py-4 text-base font-semibold text-paper transition active:scale-[0.99] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save to closet"}
        </button>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase tracking-wide text-muted">{label}</label>
      {children}
    </div>
  );
}
