"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Today", icon: SparkIcon },
  { href: "/closet", label: "Closet", icon: HangerIcon },
  { href: "/outfits", label: "Outfits", icon: GridIcon },
  { href: "/friends", label: "Friends", icon: HeartIcon },
  { href: "/account", label: "Me", icon: UserIcon },
];

const HIDE_ON = ["/welcome", "/login", "/signup"];

export default function BottomNav() {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center pointer-events-none">
      <div className="pointer-events-auto mx-auto mb-3 flex w-[min(92%,440px)] items-stretch justify-between rounded-full border border-blush bg-white/95 p-1 shadow-soft backdrop-blur">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-2 text-[11px] font-semibold transition ${
                active ? "bg-ink text-cream" : "text-mauve hover:text-ink"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function HangerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8a2 2 0 1 1 2-2" />
      <path d="M12 8v2L3 16.5c-.7.5-.4 1.5.4 1.5h17.2c.8 0 1.1-1 .4-1.5L12 10" />
    </svg>
  );
}
function GridIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.65-7 10-7 10z" />
    </svg>
  );
}
function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
