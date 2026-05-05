"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { CATEGORIES, STYLES, type Category, type ClothingItem, type Style } from "@/lib/types";

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/items/${id}`)
      .then((r) => r.json())
      .then((d) => setItem(d.item ?? null));
  }, [id]);

  if (!item) {
    return (
      <>
        <Header title="Item" back="/closet" />
        <p className="px-5 py-8 text-center text-sm text-rose">Loading...</p>
      </>
    );
  }

  function update<K extends keyof ClothingItem>(key: K, value: ClothingItem[K]) {
    setItem((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function toggleTag(t: Style) {
    if (!item) return;
    const next = item.tags.includes(t) ? item.tags.filter((x) => x !== t) : [...item.tags, t];
    update("tags", next);
  }

  async function save() {
    const cur = item;
    if (!cur) return;
    setSaving(true);
    await fetch(`/api/items/${cur.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: cur.name,
        category: cur.category,
        color: cur.color,
        brand: cur.brand,
        size: cur.size,
        price: cur.price,
        tags: cur.tags,
        warmth: cur.warmth,
      }),
    });
    setSaving(false);
    router.push("/closet");
  }

  async function remove() {
    const cur = item;
    if (!cur) return;
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/items/${cur.id}`, { method: "DELETE" });
    router.push("/closet");
  }

  async function markWorn() {
    const cur = item;
    if (!cur) return;
    await fetch(`/api/items/${cur.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lastWornAt: new Date().toISOString() }),
    });
    update("lastWornAt", new Date().toISOString());
  }

  return (
    <>
      <Header title="Edit item" back="/closet" />
      <div className="space-y-5 px-5 pb-8">
        <div className="overflow-hidden rounded-2xl border border-blush bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt={item.name} className="aspect-square w-full object-cover" />
        </div>

        <Field label="Name">
          <input
            type="text"
            value={item.name}
            onChange={(e) => update("name", e.target.value)}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Color">
            <input
              type="text"
              value={item.color}
              onChange={(e) => update("color", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Brand">
            <input
              type="text"
              value={item.brand ?? ""}
              onChange={(e) => update("brand", e.target.value || null)}
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Size">
            <input
              type="text"
              value={item.size ?? ""}
              onChange={(e) => update("size", e.target.value || null)}
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
                value={item.price ?? ""}
                onChange={(e) =>
                  update("price", e.target.value === "" ? null : Number(e.target.value))
                }
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
                onClick={() => update("category", c.value as Category)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-semibold ${
                  item.category === c.value
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

        <Field label={`Warmth (${item.warmth}/5)`}>
          <input
            type="range"
            min={1}
            max={5}
            value={item.warmth}
            onChange={(e) => update("warmth", Number(e.target.value))}
            className="w-full accent-ink"
          />
        </Field>

        <Field label="Style tags">
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleTag(s.value)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${
                  item.tags.includes(s.value)
                    ? "border-ink bg-ink text-cream"
                    : "border-blush bg-white text-ink"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="rounded-2xl border border-blush bg-white p-4 text-sm">
          <p className="text-rose">
            Last worn:{" "}
            <span className="font-semibold text-ink">
              {item.lastWornAt ? new Date(item.lastWornAt).toLocaleDateString() : "Never"}
            </span>
          </p>
          <button
            onClick={markWorn}
            className="mt-3 w-full rounded-full border border-blush bg-cream py-2 text-sm font-semibold"
          >
            Mark worn today
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={remove}
            className="flex-1 rounded-2xl border border-blush bg-white py-3 text-sm font-semibold text-rose"
          >
            Delete
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-[2] rounded-2xl bg-ink py-3 text-sm font-semibold text-cream disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
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
        :global(.input:focus) { outline: none; border-color: #190019; }
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
