import Link from "next/link";
import type { ClothingItem } from "@/lib/types";

export default function ItemCard({
  item,
  href,
  selected,
  onToggle,
}: {
  item: ClothingItem;
  href?: string;
  selected?: boolean;
  onToggle?: () => void;
}) {
  const inner = (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white transition ${
        selected ? "border-ink ring-2 ring-ink" : "border-blush"
      }`}
    >
      <div className="aspect-square w-full overflow-hidden bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover transition group-active:scale-[0.98]"
        />
        {item.price !== null && item.price !== undefined ? (
          <span className="absolute bottom-2 left-2 rounded-full bg-ink/85 px-2 py-0.5 text-[11px] font-semibold text-cream backdrop-blur">
            ${item.price.toFixed(0)}
          </span>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{item.name}</p>
          <p className="truncate text-[11px] capitalize text-rose">
            {item.category} • {item.color}
            {item.size ? ` • ${item.size}` : ""}
          </p>
        </div>
      </div>
      {selected ? (
        <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-ink text-[11px] font-semibold text-cream">
          ✓
        </span>
      ) : null}
    </div>
  );

  if (onToggle) {
    return (
      <button type="button" onClick={onToggle} className="block w-full text-left">
        {inner}
      </button>
    );
  }
  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}
