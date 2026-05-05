"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ItemPicker from "@/components/ItemPicker";
import { SEASONS, STYLES, type ClothingItem, type Season, type Style } from "@/lib/types";

export default function NewOutfitPage() {
  const router = useRouter();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [name, setName] = useState("");
  const [style, setStyle] = useState<Style>("casual");
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/items")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []));
  }, []);

  function toggleSeason(s: Season) {
    setSeasons((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function save() {
    if (!name.trim() || selectedIds.length === 0) {
      setError("Pick at least one item and give the outfit a name.");
      return;
    }
    setSaving(true);
    setError(null);
    const r = await fetch("/api/outfits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name.trim(), style, seasons, itemIds: selectedIds }),
    });
    setSaving(false);
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      setError(d.error ?? "Save failed");
      return;
    }
    router.push("/outfits");
  }

  return (
    <>
      <Header title="New outfit" back="/outfits" />
      <div className="space-y-5 px-5 pb-8">
        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dinner outfit"
            className="input"
          />
        </Field>

        <Field label="Style">
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStyle(s.value)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                  style === s.value
                    ? "border-ink bg-ink text-cream"
                    : "border-blush bg-white text-ink"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Seasons">
          <div className="grid grid-cols-4 gap-2">
            {SEASONS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleSeason(s.value)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-semibold ${
                  seasons.includes(s.value)
                    ? "border-ink bg-ink text-cream"
                    : "border-blush bg-white text-ink"
                }`}
              >
                <span className="text-xl">{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label={`Pick items (${selectedIds.length})`}>
          {items.length === 0 ? (
            <p className="rounded-xl border border-blush bg-white p-4 text-sm text-rose">
              Your closet is empty. Add items first.
            </p>
          ) : (
            <ItemPicker items={items} selectedIds={selectedIds} onChange={setSelectedIds} />
          )}
        </Field>

        {error ? (
          <p className="rounded-xl border border-blush bg-white p-3 text-sm text-rose">{error}</p>
        ) : null}

        <button
          onClick={save}
          disabled={saving}
          className="w-full rounded-2xl bg-ink py-4 text-base font-semibold text-cream shadow-plum disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save outfit"}
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
