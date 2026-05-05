import Link from "next/link";

export default function Header({
  title,
  subtitle,
  back,
  action,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-end justify-between gap-3 bg-paper/85 px-5 pb-3 pt-6 backdrop-blur">
      <div className="min-w-0 flex-1">
        {back ? (
          <Link
            href={back}
            className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-muted"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </Link>
        ) : null}
        <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-0.5 truncate text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}
