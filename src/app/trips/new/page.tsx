"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ItemPicker from "@/components/ItemPicker";
import type { ClothingItem } from "@/lib/types";

export default function NewTripPage() {
  const router = useRouter();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/items")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []));
  }, []);

  async function save() {
    if (!name.trim()) {
      setError("Give your trip a name.");
      return;
    }
    setSaving(true);
    setError(null);
    const r = await fetch("/api/trips", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        destination: destination.trim() || null,
        startDate: startDate || null,
        endDate: endDate || null,
        itemIds: selectedIds,
      }),
    });
    setSaving(false);
    if (!r.ok) {
      const d = await r.json();
      setError(d.error ?? "Save failed");
      return;
    }
    const d = await r.json();
    router.push(`/trips/${d.trip.id}`);
  }

  return (
    <>
      <Header title="New trip" back="/trips" />
      <div className="space-y-5 px-5 pb-8">
        <Field label="Trip name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Spring break in Spain"
            className="w-full rounded-xl border border-line bg-white px-4 py-3"
          />
        </Field>
        <Field label="Destination">
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Barcelona"
            className="w-full rounded-xl border border-line bg-white px-4 py-3"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-4 py-3"
            />
          </Field>
          <Field label="End">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-4 py-3"
            />
          </Field>
        </div>

        <Field label={`Pack items (${selectedIds.length})`}>
          {items.length === 0 ? (
            <p className="rounded-xl border border-line bg-white p-4 text-sm text-muted">
              Add items to your closet first to pack them.
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
          {saving ? "Creating..." : "Create trip"}
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
