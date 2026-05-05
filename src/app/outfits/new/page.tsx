"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ItemPicker from "@/components/ItemPicker";
import { STYLES, type ClothingItem, type Style } from "@/lib/types";

export default function NewOutfitPage() {
  const router = useRouter();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [name, setName] = useState("");
  const [style, setStyle] = useState<Style>("casual");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/items")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []));
  }, []);

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
      body: JSON.stringify({ name: name.trim(), style, itemIds: selectedIds }),
    });
    setSaving(false);
    if (!r.ok) {
      const d = await r.json();
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
            className="w-full rounded-xl border border-line bg-white px-4 py-3"
          />
        </Field>

        <Field label="Style">
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStyle(s.value)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                  style === s.value
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-white text-ink"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label={`Pick items (${selectedIds.length})`}>
          {items.length === 0 ? (
            <p className="rounded-xl border border-line bg-white p-4 text-sm text-muted">
              Your closet is empty. Add items first.
            </p>
          ) : (
            <ItemPicker
              items={items}
              selectedIds={selectedIds}
              onChange={setSelectedIds}
            />
          )}
        </Field>

        {error ? (
          <p className="rounded-xl border border-line bg-white p-3 text-sm text-accent">{error}</p>
        ) : null}

        <button
          onClick={save}
          disabled={saving}
          className="w-full rounded-2xl bg-ink py-4 text-base font-semibold text-paper disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save outfit"}
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
