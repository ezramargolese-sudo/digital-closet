"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import type { Notification } from "@/lib/types";

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then(async (d) => {
        setNotifs(d.notifications ?? []);
        setLoading(false);
        // Mark them all read on view
        await fetch("/api/notifications", { method: "POST" });
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Header title="Notifications" back="/" />
      <div className="px-5 pb-8">
        {loading ? (
          <p className="py-8 text-center text-sm text-rose">Loading...</p>
        ) : notifs.length === 0 ? (
          <p className="rounded-2xl border border-blush bg-white p-6 text-center text-sm text-rose">
            You're all caught up.
          </p>
        ) : (
          <ul className="divide-y divide-blush overflow-hidden rounded-2xl border border-blush bg-white">
            {notifs.map((n) => (
              <li key={n.id} className={`px-4 py-3 ${n.readAt ? "" : "bg-cream/40"}`}>
                <p className="text-sm font-semibold">{n.title}</p>
                {n.body ? <p className="mt-0.5 text-xs text-rose">{n.body}</p> : null}
                <p className="mt-1 text-[10px] uppercase tracking-wide text-mauve">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
