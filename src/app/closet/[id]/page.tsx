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
        <p className="px-5 py-8 text-center text-sm text-muted">Loading...</p>
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
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.name}
            className="aspect-square w-full object-cover"
          />
        </div>

        <Field label="Name">
          <input
            type="text"
            value={item.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3"
          />
        </Field>

        <Field label="Category">
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => update("category", c.value as Category)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium ${
                  item.category === c.value
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
              value={item.color}
              onChange={(e) => update("color", e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-4 py-3"
            />
          </Field>
          <Field label="Brand">
            <input
              type="text"
              value={item.brand ?? ""}
              onChange={(e) => update("brand", e.target.value || null)}
              className="w-full rounded-xl border border-line bg-white px-4 py-3"
            />
          </Field>
        </div>

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
                className={`rounded-full border px-3.5 py-1.5 text-sm ${
                  item.tags.includes(s.value)
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-white text-ink"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="rounded-2xl border border-line bg-white p-4 text-sm">
          <p className="text-muted">
            Last worn:{" "}
            <span className="text-ink">
              {item.lastWornAt ? new Date(item.lastWornAt).toLocaleDateString() : "Never"}
            </span>
          </p>
          <button
            onClick={markWorn}
            className="mt-3 w-full rounded-full border border-line bg-paper py-2 text-sm font-medium"
          >
            Mark worn today
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={remove}
            className="flex-1 rounded-2xl border border-line bg-white py-3 text-sm font-medium text-accent"
          >
            Delete
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-[2] rounded-2xl bg-ink py-3 text-sm font-semibold text-paper disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
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
