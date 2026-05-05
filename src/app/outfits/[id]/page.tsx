"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ItemPicker from "@/components/ItemPicker";
import { STYLES, type ClothingItem, type Outfit, type Style } from "@/lib/types";

export default function OutfitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

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
        <p className="px-5 py-8 text-center text-sm text-muted">Loading...</p>
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

  async function wearToday() {
    if (!outfit) return;
    const now = new Date().toISOString();
    await Promise.all(
      outfit.itemIds.map((iid) =>
        fetch(`/api/items/${iid}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ lastWornAt: now }),
        })
      )
    );
    alert("Marked as worn today.");
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
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-lg"
            aria-label="Favorite"
          >
            {outfit.favorite ? "⭐️" : "☆"}
          </button>
        }
      />
      <div className="space-y-5 px-5 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {outfitItems.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-line bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.name}
                className="aspect-square w-full object-cover"
              />
              <div className="px-3 py-2">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="truncate text-[11px] capitalize text-muted">{item.category}</p>
              </div>
            </div>
          ))}
        </div>

        {editing ? (
          <>
            <Field label="Name">
              <input
                type="text"
                value={outfit.name}
                onChange={(e) => setOutfit({ ...outfit, name: e.target.value })}
                className="w-full rounded-xl border border-line bg-white px-4 py-3"
              />
            </Field>
            <Field label="Style">
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setOutfit({ ...outfit, style: s.value as Style })}
                    className={`rounded-full border px-3.5 py-1.5 text-sm ${
                      outfit.style === s.value
                        ? "border-ink bg-ink text-paper"
                        : "border-line bg-white text-ink"
                    }`}
                  >
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
                className="flex-1 rounded-2xl border border-line bg-white py-3 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-[2] rounded-2xl bg-ink py-3 text-sm font-semibold text-paper disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <button
              onClick={wearToday}
              className="w-full rounded-2xl bg-ink py-3 text-sm font-semibold text-paper"
            >
              Wearing today
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setEditing(true)}
                className="flex-1 rounded-2xl border border-line bg-white py-3 text-sm font-medium"
              >
                Edit
              </button>
              <button
                onClick={remove}
                className="flex-1 rounded-2xl border border-line bg-white py-3 text-sm font-medium text-accent"
              >
                Delete
              </button>
            </div>
          </div>
        )}
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
