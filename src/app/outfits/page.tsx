"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import { SEASONS, type ClothingItem, type Outfit, type Season } from "@/lib/types";

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<Outfit[] | null>(null);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [filter, setFilter] = useState<Season | "all">("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/outfits").then(async (r) => ({ ok: r.ok, status: r.status, body: await r.json().catch(() => ({})) })),
      fetch("/api/items").then(async (r) => ({ ok: r.ok, status: r.status, body: await r.json().catch(() => ({})) })),
    ])
      .then(([o, i]) => {
        if (!o.ok) {
          setError(o.body.error ?? `Failed to load outfits (${o.status})`);
        }
        setOutfits(o.body.outfits ?? []);
        setItems(i.body.items ?? []);
      })
      .catch(() => {
        setError("Network error");
        setOutfits([]);
      });
  }, []);

  const itemMap = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const filtered = useMemo(() => {
    if (!outfits) return [];
    if (filter === "all") return outfits;
    return outfits.filter((o) => o.seasons.includes(filter));
  }, [outfits, filter]);

  return (
    <>
      <Header
        title="Outfits"
        subtitle={
          outfits ? `${outfits.length} saved ${outfits.length === 1 ? "look" : "looks"}` : "Loading..."
        }
        action={
          <Link
            href="/outfits/new"
            className="grid h-10 w-10 place-items-center rounded-full bg-ink text-cream"
            aria-label="Create outfit"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Link>
        }
      />

      {error ? (
        <p className="mx-5 rounded-2xl border border-blush bg-white p-4 text-sm text-rose">
          {error}
        </p>
      ) : null}

      {outfits === null ? (
        <p className="px-5 py-8 text-center text-sm text-rose">Loading outfits...</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="Add clothes first"
          body="Outfits are built from your closet. Start by adding items."
          ctaHref="/closet/new"
          ctaLabel="Add item"
        />
      ) : outfits.length === 0 ? (
        <EmptyState
          title="No outfits yet"
          body="Build your first look by mixing pieces from your closet."
          ctaHref="/outfits/new"
          ctaLabel="Build outfit"
        />
      ) : (
        <>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-3 no-scrollbar">
            <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
              All seasons
            </FilterPill>
            {SEASONS.map((s) => (
              <FilterPill
                key={s.value}
                active={filter === s.value}
                onClick={() => setFilter(s.value)}
              >
                {s.emoji} {s.label}
              </FilterPill>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 px-5 pt-2">
            {filtered.map((o) => (
              <OutfitRow
                key={o.id}
                outfit={o}
                items={o.itemIds.map((id) => itemMap.get(id)).filter(Boolean) as ClothingItem[]}
                onWear={async () => {
                  const r = await fetch(`/api/outfits/${o.id}/wear`, { method: "POST" });
                  if (r.ok) {
                    const d = await r.json();
                    setOutfits((prev) =>
                      prev ? prev.map((x) => (x.id === o.id ? d.outfit : x)) : prev
                    );
                  }
                }}
              />
            ))}
            {filtered.length === 0 ? (
              <p className="mt-6 text-center text-sm text-rose">No outfits in this season yet.</p>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}

function OutfitRow({
  outfit,
  items,
  onWear,
}: {
  outfit: Outfit;
  items: ClothingItem[];
  onWear: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-blush bg-white shadow-soft">
      <Link href={`/outfits/${outfit.id}`}>
        <div className="flex">
          {items.slice(0, 4).map((item) => (
            <div key={item.id} className="aspect-square w-1/4 border-r border-blush last:border-r-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
            </div>
          ))}
          {Array.from({ length: Math.max(0, 4 - items.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square w-1/4 bg-cream" />
          ))}
        </div>
      </Link>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Link href={`/outfits/${outfit.id}`} className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{outfit.name}</p>
          <p className="text-[11px] capitalize text-rose">
            {outfit.style} • {items.length} items
            {outfit.seasons.length
              ? " • " + outfit.seasons.map((s) => seasonEmoji(s)).join("")
              : ""}
          </p>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-mauve">
            Worn {outfit.wornCount}{outfit.wornCount === 1 ? " time" : " times"}
          </span>
          <button
            type="button"
            onClick={onWear}
            aria-label="Mark worn"
            className="grid h-9 w-9 place-items-center rounded-full bg-ink text-cream shadow-soft active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function seasonEmoji(s: Season): string {
  return SEASONS.find((x) => x.value === s)?.emoji ?? "";
}

function FilterPill({
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
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
        active ? "border-ink bg-ink text-cream" : "border-blush bg-white text-ink"
      }`}
    >
      {children}
    </button>
  );
}
