"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STYLES, type ClothingItem, type Style, type Weather } from "@/lib/types";

type Mode = "hub" | "suggest";

interface Suggestion {
  items: ClothingItem[];
  reason: string;
}

interface Profile {
  firstName: string;
  username: string;
}

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("hub");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherErr, setWeatherErr] = useState<string | null>(null);
  const [style, setStyle] = useState<Style | undefined>(undefined);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState<number | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d?.profile)
          setProfile({ firstName: d.profile.firstName, username: d.profile.username });
      })
      .catch(() => {});

    fetch("/api/items")
      .then((r) => r.json())
      .then((d) => setItemCount(d.items?.length ?? 0))
      .catch(() => setItemCount(0));

    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) =>
        setUnread((d.notifications ?? []).filter((n: { readAt: string | null }) => !n.readAt).length)
      )
      .catch(() => {});

    if (!navigator.geolocation) {
      setWeatherErr("Geolocation unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const r = await fetch(
            `/api/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          const d = await r.json();
          if (d.weather) setWeather(d.weather);
          else setWeatherErr(d.error ?? "weather error");
        } catch {
          setWeatherErr("weather fetch failed");
        }
      },
      () => setWeatherErr("Location denied"),
      { timeout: 8000, maximumAge: 600000 }
    );
  }, []);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ style, weather }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "Could not suggest");
        setSuggestion(null);
      } else {
        setSuggestion(d.suggestion);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function saveAsOutfit() {
    if (!suggestion) return;
    const name = window.prompt("Name this outfit", `Look for ${new Date().toLocaleDateString()}`);
    if (!name) return;
    await fetch("/api/outfits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        style: style ?? "casual",
        itemIds: suggestion.items.map((i) => i.id),
      }),
    });
  }

  return (
    <div className="px-5 pt-6">
      {/* Header row: greeting + weather chip + bell */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mauve">
            {greeting()}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight">
            {profile ? `Hi, ${profile.firstName}.` : "Hi there."}
          </h1>
          {mode === "hub" ? (
            <p className="mt-1 text-sm text-rose">How can I help today?</p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link
            href="/notifications"
            className="relative grid h-9 w-9 place-items-center rounded-full border border-blush bg-white"
            aria-label="Notifications"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10 21a2 2 0 0 0 4 0" />
            </svg>
            {unread > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose px-1 text-[10px] font-bold text-cream">
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </Link>
          <WeatherChip weather={weather} error={weatherErr} />
        </div>
      </div>

      {/* Hub of options */}
      {mode === "hub" ? (
        <div className="mt-7 grid grid-cols-1 gap-3">
          <HubCard
            label="What should I wear?"
            sub="Get an outfit picked for you"
            emoji="✨"
            onClick={() => setMode("suggest")}
            primary
          />
          <div className="grid grid-cols-2 gap-3">
            <HubCard label="Add to closet" sub="Snap or upload" emoji="📸" href="/closet/new" />
            <HubCard label="My closet" sub={itemCount !== null ? `${itemCount} pieces` : "Browse"} emoji="🧺" href="/closet" />
            <HubCard label="My outfits" sub="Saved looks" emoji="💖" href="/outfits" />
            <HubCard label="Trips" sub="Pack & plan" emoji="🧳" href="/trips" />
          </div>
        </div>
      ) : (
        <SuggestPanel
          weather={weather}
          style={style}
          setStyle={setStyle}
          loading={loading}
          error={error}
          suggestion={suggestion}
          onGenerate={generate}
          onSave={saveAsOutfit}
          onBack={() => {
            setMode("hub");
            setSuggestion(null);
            setError(null);
          }}
          itemCount={itemCount ?? 0}
          onAddFirst={() => router.push("/closet/new")}
        />
      )}
    </div>
  );
}

function HubCard({
  label,
  sub,
  emoji,
  href,
  onClick,
  primary,
}: {
  label: string;
  sub: string;
  emoji: string;
  href?: string;
  onClick?: () => void;
  primary?: boolean;
}) {
  const inner = (
    <div
      className={`flex h-full flex-col justify-between gap-3 rounded-2xl border p-4 transition active:scale-[0.99] ${
        primary
          ? "hero-grad border-plum text-cream shadow-plum"
          : "border-blush bg-white text-ink shadow-soft"
      }`}
    >
      <div className="text-2xl">{emoji}</div>
      <div>
        <p className={`font-display text-base font-bold ${primary ? "" : ""}`}>{label}</p>
        <p className={`text-xs ${primary ? "text-blush/80" : "text-rose"}`}>{sub}</p>
      </div>
    </div>
  );
  if (onClick) {
    return (
      <button onClick={onClick} className="block w-full text-left">
        {inner}
      </button>
    );
  }
  return (
    <Link href={href!} className="block">
      {inner}
    </Link>
  );
}

function SuggestPanel({
  weather,
  style,
  setStyle,
  loading,
  error,
  suggestion,
  onGenerate,
  onSave,
  onBack,
  itemCount,
  onAddFirst,
}: {
  weather: Weather | null;
  style: Style | undefined;
  setStyle: (s: Style | undefined) => void;
  loading: boolean;
  error: string | null;
  suggestion: Suggestion | null;
  onGenerate: () => void;
  onSave: () => void;
  onBack: () => void;
  itemCount: number;
  onAddFirst: () => void;
}) {
  return (
    <div className="mt-7">
      <button onClick={onBack} className="mb-3 text-xs font-medium text-mauve">
        ← Back
      </button>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-mauve">Occasion</p>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
          <Pill active={style === undefined} onClick={() => setStyle(undefined)}>
            Any
          </Pill>
          {STYLES.map((s) => (
            <Pill key={s.value} active={style === s.value} onClick={() => setStyle(s.value)}>
              {s.label}
            </Pill>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {itemCount === 0 ? (
          <div className="rounded-2xl border border-blush bg-white p-6 text-center">
            <p className="font-display text-lg font-bold">Your closet is empty</p>
            <p className="mt-1 text-sm text-rose">Add a few clothing items so we can suggest outfits.</p>
            <button
              onClick={onAddFirst}
              className="mt-4 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream"
            >
              Add first item
            </button>
          </div>
        ) : (
          <button
            onClick={onGenerate}
            disabled={loading}
            className="w-full rounded-2xl bg-ink py-4 text-base font-semibold text-cream shadow-plum transition active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Putting it together..." : suggestion ? "Try another" : "Pick my outfit"}
          </button>
        )}
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-blush bg-white p-3 text-center text-sm text-rose">
          {error}
        </p>
      ) : null}

      {suggestion ? (
        <div className="mt-6">
          <p className="mb-3 text-xs uppercase tracking-wide text-mauve">{suggestion.reason}</p>
          <div className="grid grid-cols-2 gap-3">
            {suggestion.items.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-2xl border border-blush bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="aspect-square w-full object-cover"
                />
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="truncate text-[11px] capitalize text-rose">
                    {item.category} • {item.color}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={onSave}
            className="mt-4 w-full rounded-2xl border border-blush bg-white py-3 text-sm font-semibold"
          >
            Save as outfit
          </button>
        </div>
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
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active ? "border-ink bg-ink text-cream" : "border-blush bg-white text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function WeatherChip({ weather, error }: { weather: Weather | null; error: string | null }) {
  if (!weather) {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-blush bg-white px-2.5 py-1.5 text-[11px] text-rose">
        <span>📍</span>
        <span>{error ? "No weather" : "Locating..."}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-blush bg-white px-2.5 py-1.5 text-[12px] font-semibold text-ink">
      <span className="text-base leading-none">{weatherEmoji(weather)}</span>
      <span>{Math.round(weather.temperatureC)}°</span>
      <span className="hidden text-[10px] font-medium text-rose sm:inline">
        {weather.precipitationProb}%
      </span>
    </div>
  );
}

function weatherEmoji(w: Weather): string {
  if (w.code >= 95) return "⛈️";
  if (w.code >= 71 && w.code <= 86) return "❄️";
  if (w.code >= 61 && w.code <= 67) return "🌧️";
  if (w.code >= 51 && w.code <= 55) return "🌦️";
  if (w.code >= 45 && w.code <= 48) return "🌫️";
  if (w.code === 3) return "☁️";
  if (w.code === 2) return "⛅️";
  if (w.code === 1 || w.code === 0) return w.isDay ? "☀️" : "🌙";
  return "🌤️";
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
