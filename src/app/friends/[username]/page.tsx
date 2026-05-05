"use client";

import { use, useEffect, useState } from "react";
import Header from "@/components/Header";
import type { Outfit, Profile } from "@/lib/types";

interface ItemRow {
  id: number;
  name: string;
  category: string;
  image_url: string;
}

export default function FriendProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/friends/${encodeURIComponent(username)}/outfits`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) {
          setError(d.error ?? "Failed to load");
          return;
        }
        setProfile(d.profile);
        setOutfits(d.outfits ?? []);
        setItems(d.items ?? []);
      })
      .catch(() => setError("Network error"));
  }, [username]);

  const itemMap = new Map(items.map((i) => [i.id, i]));

  return (
    <>
      <Header
        title={profile ? `${profile.firstName} ${profile.lastName}` : "Friend"}
        subtitle={profile ? `@${profile.username}` : undefined}
        back="/friends"
      />
      <div className="space-y-3 px-5 pb-8">
        {error ? (
          <p className="rounded-2xl border border-blush bg-white p-4 text-sm text-rose">{error}</p>
        ) : outfits.length === 0 ? (
          <p className="rounded-2xl border border-blush bg-white p-6 text-center text-sm text-rose">
            No saved outfits yet.
          </p>
        ) : (
          outfits.map((o) => {
            const fitItems = o.itemIds.map((id) => itemMap.get(id)).filter(Boolean) as ItemRow[];
            return (
              <div key={o.id} className="overflow-hidden rounded-2xl border border-blush bg-white">
                <div className="flex">
                  {fitItems.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="aspect-square w-1/4 border-r border-blush last:border-r-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 4 - fitItems.length) }).map((_, i) => (
                    <div key={`e-${i}`} className="aspect-square w-1/4 bg-cream" />
                  ))}
                </div>
                <div className="px-4 py-3">
                  <p className="truncate text-sm font-semibold">{o.name}</p>
                  <p className="text-[11px] capitalize text-rose">
                    {o.style} • Worn {o.wornCount} {o.wornCount === 1 ? "time" : "times"}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
