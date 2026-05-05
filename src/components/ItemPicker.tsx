"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, type Category, type ClothingItem } from "@/lib/types";

export default function ItemPicker({
  items,
  selectedIds,
  onChange,
}: {
  items: ClothingItem[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}) {
  const [filter, setFilter] = useState<Category | "all">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.category === filter);
  }, [items, filter]);

  function toggle(id: number) {
    onChange(
      selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]
    );
  }

  return (
    <div>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-3 no-scrollbar">
        <Pill active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </Pill>
        {CATEGORIES.map((c) => (
          <Pill key={c.value} active={filter === c.value} onClick={() => setFilter(c.value)}>
            {c.emoji} {c.label}
          </Pill>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {filtered.map((item) => {
          const selected = selectedIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className={`relative overflow-hidden rounded-xl border bg-white text-left transition ${
                selected ? "border-ink ring-2 ring-ink" : "border-blush"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.name} className="aspect-square w-full object-cover" />
              <p className="truncate px-2 py-1.5 text-[11px] font-semibold">{item.name}</p>
              {selected ? (
                <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] font-bold text-cream">
                  ✓
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-center text-sm text-rose">No items in this category.</p>
      ) : null}
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
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active ? "border-ink bg-ink text-cream" : "border-blush bg-white text-ink"
      }`}
    >
      {children}
    </button>
  );
}
