"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ItemPicker from "@/components/ItemPicker";
import { SEASONS, STYLES, type ClothingItem, type Outfit, type Season, type Style } from "@/lib/types";

export default function OutfitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bumping, setBumping] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/outfits/${id}`).then((r) => r.json()),
      fetch("/api/items").then((r) => r.json()),
    ]).then(([o, i]) => {
      setOutfit(o.outfit ?? null);
      setItems(i.items ?? []);
    });
  }, [id]);

  if (!outfit) {
    return (
      <>
        <Header title="Outfit" back="/outfits" />
        <p className="px-5 py-8 text-center text-sm text-rose">Loading...</p>
      </>
    );
  }

  const itemMap = new Map(items.map((i) => [i.id, i]));
  const outfitItems = outfit.itemIds.map((id) => itemMap.get(id)).filter(Boolean) as ClothingItem[];

  async function save() {
    if (!outfit) return;
    setSaving(true);
    await fetch(`/api/outfits/${outfit.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: outfit.name,
        style: outfit.style,
        itemIds: outfit.itemIds,
        seasons: outfit.seasons,
        favorite: outfit.favorite,
      }),
    });
    setSaving(false);
    setEditing(false);
  }

  async function remove() {
    if (!outfit) return;
    if (!confirm("Delete this outfit?")) return;
    await fetch(`/api/outfits/${outfit.id}`, { method: "DELETE" });
    router.push("/outfits");
  }

  async function toggleFav() {
    if (!outfit) return;
    const next = !outfit.favorite;
    setOutfit({ ...outfit, favorite: next });
    await fetch(`/api/outfits/${outfit.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ favorite: next }),
    });
  }

  async function bumpWear() {
    if (!outfit) return;
    setBumping(true);
    const r = await fetch(`/api/outfits/${outfit.id}/wear`, { method: "POST" });
    if (r.ok) {
      const d = await r.json();
      setOutfit(d.outfit);
    }
    setBumping(false);
  }

  function toggleSeason(s: Season) {
    if (!outfit) return;
    const next = outfit.seasons.includes(s)
      ? outfit.seasons.filter((x) => x !== s)
      : [...outfit.seasons, s];
    setOutfit({ ...outfit, seasons: next });
  }

  return (
    <>
      <Header
        title={editing ? "Edit outfit" : outfit.name}
        subtitle={editing ? undefined : `${outfit.style} • ${outfitItems.length} items`}
        back="/outfits"
        action={
          <button
            type="button"
            onClick={toggleFav}
            className="grid h-10 w-10 place-items-center rounded-full border border-blush bg-white text-lg"
            aria-label="Favorite"
          >
            {outfit.favorite ? "⭐️" : "☆"}
          </button>
        }
      />
      <div className="space-y-5 px-5 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {outfitItems.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-blush bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.name} className="aspect-square w-full object-cover" />
              <div className="px-3 py-2">
                <p className="truncate text-sm font-semibold">{item.name}</p>
                <p className="truncate text-[11px] capitalize text-rose">{item.category}</p>
              </div>
            </div>
          ))}
        </div>

        {!editing ? (
          <div className="rounded-2xl border border-blush bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-mauve">Worn</p>
                <p className="font-display text-2xl font-bold">
                  {outfit.wornCount} {outfit.wornCount === 1 ? "time" : "times"}
                </p>
              </div>
              <button
                onClick={bumpWear}
                disabled={bumping}
                aria-label="Mark worn"
                className="grid h-12 w-12 place-items-center rounded-full bg-ink text-cream shadow-plum active:scale-95 disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
            {outfit.seasons.length ? (
              <p className="mt-2 text-xs text-rose">
                Seasons: {outfit.seasons.map((s) => SEASONS.find((x) => x.value === s)?.label).join(", ")}
              </p>
            ) : null}
          </div>
        ) : null}

        {editing ? (
          <>
            <Field label="Name">
              <input
                type="text"
                value={outfit.name}
                onChange={(e) => setOutfit({ ...outfit, name: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Style">
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setOutfit({ ...outfit, style: s.value as Style })}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${
                      outfit.style === s.value
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
                      outfit.seasons.includes(s.value)
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
            <Field label="Items">
              <ItemPicker
                items={items}
                selectedIds={outfit.itemIds}
                onChange={(ids) => setOutfit({ ...outfit, itemIds: ids })}
              />
            </Field>
            <div className="flex gap-3">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 rounded-2xl border border-blush bg-white py-3 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-[2] rounded-2xl bg-ink py-3 text-sm font-semibold text-cream disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setEditing(true)}
              className="flex-1 rounded-2xl border border-blush bg-white py-3 text-sm font-semibold"
            >
              Edit
            </button>
            <button
              onClick={remove}
              className="flex-1 rounded-2xl border border-blush bg-white py-3 text-sm font-semibold text-rose"
            >
              Delete
            </button>
          </div>
        )}
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
