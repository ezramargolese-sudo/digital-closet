"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ItemPicker from "@/components/ItemPicker";
import { STYLES, type ClothingItem, type Style, type Trip } from "@/lib/types";

interface Suggestion {
  items: ClothingItem[];
  reason: string;
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [tab, setTab] = useState<"packing" | "outfits">("packing");
  const [packed, setPacked] = useState<Set<number>>(new Set());
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [style, setStyle] = useState<Style | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/trips/${id}`).then((r) => r.json()),
      fetch("/api/items").then((r) => r.json()),
    ]).then(([t, i]) => {
      setTrip(t.trip ?? null);
      setItems(i.items ?? []);
      // restore packed checklist from localStorage
      try {
        const raw = localStorage.getItem(`trip-packed-${id}`);
        if (raw) setPacked(new Set(JSON.parse(raw) as number[]));
      } catch {}
    });
  }, [id]);

  if (!trip) {
    return (
      <>
        <Header title="Trip" back="/trips" />
        <p className="px-5 py-8 text-center text-sm text-muted">Loading...</p>
      </>
    );
  }

  const itemMap = new Map(items.map((i) => [i.id, i]));
  const tripItems = trip.itemIds.map((id) => itemMap.get(id)).filter(Boolean) as ClothingItem[];

  function togglePacked(itemId: number) {
    setPacked((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      try {
        localStorage.setItem(`trip-packed-${id}`, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }

  async function suggest() {
    const cur = trip;
    if (!cur) return;
    setLoading(true);
    setError(null);
    setSuggestion(null);
    const r = await fetch("/api/suggest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tripId: cur.id, style }),
    });
    setLoading(false);
    const d = await r.json();
    if (!r.ok) {
      setError(d.error ?? "Could not suggest");
      return;
    }
    setSuggestion(d.suggestion);
  }

  async function saveEdits() {
    if (!trip) return;
    setSaving(true);
    await fetch(`/api/trips/${trip.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: trip.name,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        itemIds: trip.itemIds,
      }),
    });
    setSaving(false);
    setEditing(false);
  }

  async function remove() {
    if (!trip) return;
    if (!confirm("Delete this trip?")) return;
    await fetch(`/api/trips/${trip.id}`, { method: "DELETE" });
    try {
      localStorage.removeItem(`trip-packed-${trip.id}`);
    } catch {}
    router.push("/trips");
  }

  return (
    <>
      <Header
        title={editing ? "Edit trip" : trip.name}
        subtitle={editing ? undefined : trip.destination ?? undefined}
        back="/trips"
        action={
          !editing ? (
            <button
              onClick={() => setEditing(true)}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium"
            >
              Edit
            </button>
          ) : undefined
        }
      />

      <div className="px-5 pb-8">
        {editing ? (
          <div className="space-y-5">
            <Field label="Name">
              <input
                type="text"
                value={trip.name}
                onChange={(e) => setTrip({ ...trip, name: e.target.value })}
                className="w-full rounded-xl border border-line bg-white px-4 py-3"
              />
            </Field>
            <Field label="Destination">
              <input
                type="text"
                value={trip.destination ?? ""}
                onChange={(e) => setTrip({ ...trip, destination: e.target.value || null })}
                className="w-full rounded-xl border border-line bg-white px-4 py-3"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start">
                <input
                  type="date"
                  value={trip.startDate ?? ""}
                  onChange={(e) => setTrip({ ...trip, startDate: e.target.value || null })}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3"
                />
              </Field>
              <Field label="End">
                <input
                  type="date"
                  value={trip.endDate ?? ""}
                  onChange={(e) => setTrip({ ...trip, endDate: e.target.value || null })}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3"
                />
              </Field>
            </div>
            <Field label={`Items (${trip.itemIds.length})`}>
              <ItemPicker
                items={items}
                selectedIds={trip.itemIds}
                onChange={(ids) => setTrip({ ...trip, itemIds: ids })}
              />
            </Field>
            <div className="flex gap-3">
              <button
                onClick={remove}
                className="flex-1 rounded-2xl border border-line bg-white py-3 text-sm font-medium text-accent"
              >
                Delete
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 rounded-2xl border border-line bg-white py-3 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveEdits}
                disabled={saving}
                className="flex-[2] rounded-2xl bg-ink py-3 text-sm font-semibold text-paper disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="-mx-5 mb-4 flex gap-2 border-b border-line px-5">
              {(["packing", "outfits"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium capitalize ${
                    tab === t ? "border-ink text-ink" : "border-transparent text-muted"
                  }`}
                >
                  {t === "packing" ? "Packing" : "Build outfit"}
                </button>
              ))}
            </div>

            {tab === "packing" ? (
              <PackingChecklist
                items={tripItems}
                packed={packed}
                onToggle={togglePacked}
              />
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                    Style
                  </p>
                  <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
                    <Pill active={style === undefined} onClick={() => setStyle(undefined)}>
                      Any
                    </Pill>
                    {STYLES.map((s) => (
                      <Pill
                        key={s.value}
                        active={style === s.value}
                        onClick={() => setStyle(s.value)}
                      >
                        {s.label}
                      </Pill>
                    ))}
                  </div>
                </div>

                <button
                  onClick={suggest}
                  disabled={loading || tripItems.length === 0}
                  className="w-full rounded-2xl bg-ink py-4 text-base font-semibold text-paper disabled:opacity-60"
                >
                  {loading ? "Building..." : suggestion ? "Try another" : "Build outfit from trip"}
                </button>

                {error ? (
                  <p className="rounded-xl border border-line bg-white p-3 text-sm text-muted">
                    {error}
                  </p>
                ) : null}

                {suggestion ? (
                  <div>
                    <p className="mb-3 text-xs uppercase tracking-wide text-muted">
                      {suggestion.reason}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {suggestion.items.map((item) => (
                        <div
                          key={item.id}
                          className="overflow-hidden rounded-2xl border border-line bg-white"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="aspect-square w-full object-cover"
                          />
                          <div className="px-3 py-2">
                            <p className="truncate text-sm font-medium">{item.name}</p>
                            <p className="truncate text-[11px] capitalize text-muted">
                              {item.category}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function PackingChecklist({
  items,
  packed,
  onToggle,
}: {
  items: ClothingItem[];
  packed: Set<number>;
  onToggle: (id: number) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-line bg-white p-6 text-center text-sm text-muted">
        Nothing packed yet. Tap Edit to add items.
      </p>
    );
  }
  const done = items.filter((i) => packed.has(i.id)).length;
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-line bg-white p-4">
        <p className="text-sm font-medium">
          Packed {done} / {items.length}
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper">
          <div
            className="h-full bg-ink transition-all"
            style={{ width: items.length ? `${(done / items.length) * 100}%` : "0%" }}
          />
        </div>
      </div>
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
        {items.map((item) => {
          const isPacked = packed.has(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${
                      isPacked ? "text-muted line-through" : "text-ink"
                    }`}
                  >
                    {item.name}
                  </p>
                  <p className="truncate text-[11px] capitalize text-muted">
                    {item.category} • {item.color}
                  </p>
                </div>
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full border ${
                    isPacked ? "border-ink bg-ink text-paper" : "border-line bg-white"
                  }`}
                >
                  {isPacked ? "✓" : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Pill({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
        active ? "border-ink bg-ink text-paper" : "border-line bg-white text-ink"
      }`}
    >
      {children}
    </button>
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
