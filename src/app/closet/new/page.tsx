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
  const [color, setColor] = useState("");
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<Category>("top");
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
      let d: { url?: string; error?: string } = {};
      try {
        d = await r.json();
      } catch {
        // non-JSON response (e.g. HTML error)
      }
      if (!r.ok || !d.url) {
        setError(d.error ?? `Upload failed (${r.status})`);
      } else {
        setImageUrl(d.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
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
    const priceNum = price.trim() ? Number(price) : null;
    if (priceNum !== null && (isNaN(priceNum) || priceNum < 0)) {
      setError("Price must be a positive number.");
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
          size: size.trim() || null,
          price: priceNum,
          tags,
          imageUrl,
          warmth,
        }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
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
        <div className="rounded-2xl border border-blush bg-white p-3">
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
                className="absolute right-2 top-2 rounded-full bg-ink/85 px-3 py-1.5 text-xs font-semibold text-cream"
              >
                Replace
              </button>
            </div>
          ) : (
            <div className="grid aspect-square place-items-center rounded-xl bg-cream">
              {uploading ? (
                <p className="text-sm text-rose">Uploading...</p>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="text-4xl">📸</span>
                  <p className="text-sm text-rose">Add a photo of this item</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => cameraRef.current?.click()}
                      className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream"
                    >
                      Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="rounded-full border border-blush bg-white px-4 py-2 text-sm font-semibold"
                    >
                      Photo library
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
            accept="image/*,image/heic,image/heif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </div>

        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="White cotton tee"
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Color">
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="white"
              className="input"
            />
          </Field>
          <Field label="Brand">
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="optional"
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Size">
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="M, 32, 9.5..."
              className="input"
            />
          </Field>
          <Field label="Price paid">
            <div className="flex items-center gap-1 rounded-xl border border-blush bg-white px-3 py-3 focus-within:border-ink">
              <span className="text-rose">$</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent focus:outline-none"
              />
            </div>
          </Field>
        </div>

        <Field label="Category">
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-semibold transition ${
                  category === c.value
                    ? "border-ink bg-ink text-cream"
                    : "border-blush bg-white text-ink"
                }`}
              >
                <span className="text-xl">{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label={`Warmth (${warmth}/5)`}>
          <input
            type="range"
            min={1}
            max={5}
            value={warmth}
            onChange={(e) => setWarmth(Number(e.target.value))}
            className="w-full accent-ink"
          />
          <div className="flex justify-between text-[11px] text-rose">
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
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                  tags.includes(s.value)
                    ? "border-ink bg-ink text-cream"
                    : "border-blush bg-white text-ink"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        {error ? (
          <p className="rounded-xl border border-blush bg-white p-3 text-sm text-rose">{error}</p>
        ) : null}

        <button
          onClick={save}
          disabled={saving || uploading}
          className="w-full rounded-2xl bg-ink py-4 text-base font-semibold text-cream shadow-plum disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save to closet"}
        </button>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          background: #ffffff;
          border: 1px solid #dfb6b2;
          border-radius: 12px;
          padding: 12px 16px;
          color: #190019;
        }
        :global(.input:focus) {
          outline: none;
          border-color: #190019;
        }
      `}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-mauve">{label}</label>
      {children}
    </div>
  );
}
