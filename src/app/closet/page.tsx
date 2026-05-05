"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import ItemCard from "@/components/ItemCard";
import { CATEGORIES, type Category, type ClothingItem } from "@/lib/types";

export default function ClosetPage() {
  const [items, setItems] = useState<ClothingItem[] | null>(null);
  const [filter, setFilter] = useState<Category | "all">("all");

  useEffect(() => {
    fetch("/api/items")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    if (filter === "all") return items;
    return items.filter((i) => i.category === filter);
  }, [items, filter]);

  return (
    <>
      <Header
        title="Closet"
        subtitle={items ? `${items.length} ${items.length === 1 ? "item" : "items"}` : "Loading..."}
        action={
          <Link
            href="/closet/new"
            className="grid h-10 w-10 place-items-center rounded-full bg-ink text-paper"
            aria-label="Add item"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Link>
        }
      />

      {items === null ? (
        <div className="px-5 py-8 text-center text-sm text-muted">Loading closet...</div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Add your first piece"
          body="Snap a photo or upload images of clothes you own."
          ctaHref="/closet/new"
          ctaLabel="Add item"
        />
      ) : (
        <>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-3 no-scrollbar">
            <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
              All
            </FilterPill>
            {CATEGORIES.map((c) => (
              <FilterPill
                key={c.value}
                active={filter === c.value}
                onClick={() => setFilter(c.value)}
              >
                {c.emoji} {c.label}
              </FilterPill>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 px-5 pt-2">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} href={`/closet/${item.id}`} />
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted">
              No items in this category yet.
            </p>
          ) : null}
        </>
      )}
    </>
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
