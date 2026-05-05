"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import type { Profile } from "@/lib/types";

interface IncomingRequest {
  id: number;
  fromUser: string;
  fromProfile?: Profile;
  createdAt: string;
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [username, setUsername] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/friends");
    const d = await r.json();
    if (r.ok) {
      setFriends(d.friends ?? []);
      setRequests(d.requests ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function sendRequest() {
    setError(null);
    setInfo(null);
    if (!username.trim()) return;
    setAdding(true);
    const r = await fetch("/api/friends", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: username.trim().replace(/^@/, "") }),
    });
    const d = await r.json();
    setAdding(false);
    if (!r.ok) {
      setError(d.error ?? "Could not send request");
      return;
    }
    setInfo(d.status === "accepted" ? "You're now friends!" : "Friend request sent.");
    setUsername("");
    load();
  }

  async function respond(id: number, accept: boolean) {
    await fetch(`/api/friends/requests/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ accept }),
    });
    load();
  }

  return (
    <>
      <Header title="Friends" subtitle={`${friends.length} ${friends.length === 1 ? "friend" : "friends"}`} />

      <div className="space-y-5 px-5 pb-8">
        <div className="rounded-2xl border border-blush bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-mauve">Add a friend</p>
          <div className="mt-2 flex gap-2">
            <div className="flex flex-1 items-center rounded-xl border border-blush bg-white">
              <span className="pl-3 text-rose">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full bg-transparent px-2 py-3 focus:outline-none"
              />
            </div>
            <button
              onClick={sendRequest}
              disabled={adding || !username.trim()}
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream disabled:opacity-60"
            >
              {adding ? "..." : "Send"}
            </button>
          </div>
          {info ? <p className="mt-2 text-xs text-mauve">{info}</p> : null}
          {error ? <p className="mt-2 text-xs text-rose">{error}</p> : null}
        </div>

        {requests.length > 0 ? (
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-mauve">
              Friend requests
            </h2>
            <ul className="divide-y divide-blush overflow-hidden rounded-2xl border border-blush bg-white">
              {requests.map((req) => (
                <li key={req.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar profile={req.fromProfile} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {req.fromProfile?.firstName ?? "Someone"} {req.fromProfile?.lastName ?? ""}
                    </p>
                    <p className="truncate text-[11px] text-rose">
                      @{req.fromProfile?.username ?? "unknown"}
                    </p>
                  </div>
                  <button
                    onClick={() => respond(req.id, false)}
                    className="rounded-full border border-blush bg-white px-3 py-1.5 text-xs font-semibold text-rose"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => respond(req.id, true)}
                    className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-cream"
                  >
                    Accept
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-mauve">
            Your friends
          </h2>
          {loading ? (
            <p className="text-center text-sm text-rose">Loading...</p>
          ) : friends.length === 0 ? (
            <p className="rounded-2xl border border-blush bg-white p-6 text-center text-sm text-rose">
              No friends yet. Add someone by their username.
            </p>
          ) : (
            <ul className="divide-y divide-blush overflow-hidden rounded-2xl border border-blush bg-white">
              {friends.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/friends/${f.username}`}
                    className="flex items-center gap-3 px-4 py-3 active:bg-cream"
                  >
                    <Avatar profile={f} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {f.firstName} {f.lastName}
                      </p>
                      <p className="truncate text-[11px] text-rose">@{f.username}</p>
                    </div>
                    <span className="text-rose">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Avatar({ profile }: { profile?: Profile }) {
  const initials = profile
    ? (profile.firstName?.[0] ?? "") + (profile.lastName?.[0] ?? "")
    : "?";
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mauve text-sm font-bold text-cream">
      {initials.toUpperCase()}
    </div>
  );
}
