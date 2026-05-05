"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import { STYLES, type ClothingItem, type Outfit, type Style } from "@/lib/types";

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<Outfit[] | null>(null);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [filter, setFilter] = useState<Style | "all">("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/outfits").then((r) => r.json()),
      fetch("/api/items").then((r) => r.json()),
    ]).then(([o, i]) => {
      setOutfits(o.outfits ?? []);
      setItems(i.items ?? []);
    });
  }, []);

  const itemMap = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const filtered = useMemo(() => {
    if (!outfits) return [];
    if (filter === "all") return outfits;
    return outfits.filter((o) => o.style === filter);
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
            className="grid h-10 w-10 place-items-center rounded-full bg-ink text-paper"
            aria-label="Create outfit"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Link>
        }
      />

      {outfits === null ? (
        <p className="px-5 py-8 text-center text-sm text-muted">Loading outfits...</p>
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
              All
            </FilterPill>
            {STYLES.map((s) => (
              <FilterPill
                key={s.value}
                active={filter === s.value}
                onClick={() => setFilter(s.value)}
              >
                {s.label}
              </FilterPill>
            ))}
          </div>

          <div className="space-y-3 px-5 pt-2">
            {filtered.map((o) => (
              <OutfitRow
                key={o.id}
                outfit={o}
                items={o.itemIds.map((id) => itemMap.get(id)).filter(Boolean) as ClothingItem[]}
              />
            ))}
            {filtered.length === 0 ? (
              <p className="mt-6 text-center text-sm text-muted">No outfits in this style yet.</p>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}

function OutfitRow({ outfit, items }: { outfit: Outfit; items: ClothingItem[] }) {
  return (
    <Link
      href={`/outfits/${outfit.id}`}
      className="block overflow-hidden rounded-2xl border border-line bg-white"
    >
      <div className="flex">
        {items.slice(0, 4).map((item) => (
          <div key={item.id} className="aspect-square w-1/4 border-r border-line last:border-r-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          </div>
        ))}
        {Array.from({ length: Math.max(0, 4 - items.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square w-1/4 bg-paper" />
        ))}
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{outfit.name}</p>
          <p className="text-[11px] capitalize text-muted">
            {outfit.style} • {items.length} items
          </p>
        </div>
        {outfit.favorite ? <span className="text-sm">⭐️</span> : null}
      </div>
    </Link>
  );
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
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
        active ? "border-ink bg-ink text-paper" : "border-line bg-white text-ink"
      }`}
    >
      {children}
    </button>
  );
}
