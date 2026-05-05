"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import type { Trip } from "@/lib/types";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[] | null>(null);

  useEffect(() => {
    fetch("/api/trips")
      .then((r) => r.json())
      .then((d) => setTrips(d.trips ?? []));
  }, []);

  return (
    <>
      <Header
        title="Trips"
        subtitle={trips ? `${trips.length} ${trips.length === 1 ? "trip" : "trips"}` : "Loading..."}
        action={
          <Link
            href="/trips/new"
            className="grid h-10 w-10 place-items-center rounded-full bg-ink text-paper"
            aria-label="New trip"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Link>
        }
      />
      {trips === null ? (
        <p className="px-5 py-8 text-center text-sm text-muted">Loading...</p>
      ) : trips.length === 0 ? (
        <EmptyState
          title="Plan a trip"
          body="Pack only what you'll wear. Build outfits from your trip closet."
          ctaHref="/trips/new"
          ctaLabel="New trip"
        />
      ) : (
        <div className="space-y-3 px-5">
          {trips.map((t) => (
            <Link
              key={t.id}
              href={`/trips/${t.id}`}
              className="block rounded-2xl border border-line bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{t.name}</p>
                  <p className="text-xs text-muted">
                    {t.destination ?? "No destination"} • {t.itemIds.length} items
                  </p>
                  {t.startDate ? (
                    <p className="mt-1 text-[11px] text-muted">
                      {new Date(t.startDate).toLocaleDateString()}
                      {t.endDate ? ` → ${new Date(t.endDate).toLocaleDateString()}` : ""}
                    </p>
                  ) : null}
                </div>
                <span className="text-xl">🧳</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
