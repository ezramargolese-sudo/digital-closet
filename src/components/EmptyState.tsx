import Link from "next/link";

export default function EmptyState({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="mx-auto flex max-w-xs flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full border border-blush bg-white text-3xl shadow-soft">
        ✨
      </div>
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <p className="text-sm text-rose">{body}</p>
      {ctaHref && ctaLabel ? (
        <Link
          href={ctaHref}
          className="mt-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream shadow-plum"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
