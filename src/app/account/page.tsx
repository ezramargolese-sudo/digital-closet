"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import type { Profile } from "@/lib/types";

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        setProfile(d.profile ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/welcome");
    router.refresh();
  }

  return (
    <>
      <Header title="Account" />
      <div className="space-y-5 px-5 pb-8">
        {loading ? (
          <p className="text-center text-sm text-rose">Loading...</p>
        ) : !profile ? (
          <p className="rounded-2xl border border-blush bg-white p-6 text-center text-sm text-rose">
            No profile found.
          </p>
        ) : (
          <>
            <div className="rounded-2xl border border-blush bg-white p-6 text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-mauve text-2xl font-bold text-cream">
                {(profile.firstName[0] ?? "") + (profile.lastName[0] ?? "")}
              </div>
              <h2 className="mt-3 font-display text-xl font-bold">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-sm text-rose">@{profile.username}</p>
              <p className="mt-1 text-xs text-mauve">{profile.email}</p>
            </div>

            <ul className="divide-y divide-blush overflow-hidden rounded-2xl border border-blush bg-white">
              <NavRow href="/closet" label="My closet" emoji="🧺" />
              <NavRow href="/outfits" label="My outfits" emoji="💖" />
              <NavRow href="/trips" label="Trips" emoji="🧳" />
              <NavRow href="/friends" label="Friends" emoji="👯" />
              <NavRow href="/notifications" label="Notifications" emoji="🔔" />
            </ul>

            <button
              onClick={logout}
              className="w-full rounded-2xl border border-blush bg-white py-4 text-sm font-semibold text-rose"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </>
  );
}

function NavRow({ href, label, emoji }: { href: string; label: string; emoji: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 px-4 py-3 active:bg-cream">
        <span className="text-xl">{emoji}</span>
        <span className="flex-1 text-sm font-semibold">{label}</span>
        <span className="text-rose">›</span>
      </Link>
    </li>
  );
}
