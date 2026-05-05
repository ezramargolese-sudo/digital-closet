"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import { STYLES, type ClothingItem, type Style, type Weather } from "@/lib/types";

interface Suggestion {
  items: ClothingItem[];
  reason: string;
}

export default function HomePage() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherErr, setWeatherErr] = useState<string | null>(null);
  const [style, setStyle] = useState<Style | undefined>(undefined);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState<number | null>(null);

  // Initial: load item count + try geolocation/weather
  useEffect(() => {
    fetch("/api/items")
      .then((r) => r.json())
      .then((d) => setItemCount(d.items?.length ?? 0))
      .catch(() => setItemCount(0));

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
      () => setWeatherErr("Location permission denied"),
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
    <>
      <Header title="What should I wear?" subtitle={greeting()} />
      <div className="px-5">
        <WeatherCard weather={weather} error={weatherErr} />

        <div className="mt-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Occasion</p>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
            <Pill active={style === undefined} onClick={() => setStyle(undefined)}>
              Any
            </Pill>
            {STYLES.map((s) => (
              <Pill
                key={s.value}
                active={style === s.value}
                onClick={() => setStyle(s.value)}
              >
                {s.label}
              </Pill>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {itemCount === 0 ? (
            <EmptyState
              title="Your closet is empty"
              body="Add a few clothing items so we can suggest outfits."
              ctaHref="/closet/new"
              ctaLabel="Add first item"
            />
          ) : (
            <button
              onClick={generate}
              disabled={loading}
              className="w-full rounded-2xl bg-ink py-4 text-base font-semibold text-paper transition active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? "Putting it together..." : suggestion ? "Try another" : "Pick my outfit"}
            </button>
          )}
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-line bg-white p-3 text-center text-sm text-muted">
            {error}
          </p>
        ) : null}

        {suggestion ? (
          <div className="mt-6">
            <p className="mb-3 text-xs uppercase tracking-wide text-muted">{suggestion.reason}</p>
            <div className="grid grid-cols-2 gap-3">
              {suggestion.items.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-line bg-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="aspect-square w-full object-cover"
                  />
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="truncate text-[11px] capitalize text-muted">
                      {item.category} • {item.color}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={saveAsOutfit}
              className="mt-4 w-full rounded-2xl border border-line bg-white py-3 text-sm font-medium"
            >
              Save as outfit
            </button>
          </div>
        ) : null}

        {itemCount !== null && itemCount > 0 && !suggestion ? (
          <div className="mt-8">
            <Link
              href="/closet"
              className="block rounded-2xl border border-line bg-white p-4 text-center text-sm text-muted"
            >
              {itemCount} {itemCount === 1 ? "item" : "items"} in your closet →
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Late night fit?";
  if (h < 12) return "Good morning. Let's get dressed.";
  if (h < 18) return "Good afternoon.";
  return "Good evening.";
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
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-line bg-white text-ink hover:border-ink/40"
      }`}
    >
      {children}
    </button>
  );
}

function WeatherCard({ weather, error }: { weather: Weather | null; error: string | null }) {
  if (!weather) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-paper text-lg">📍</div>
        <div className="text-sm">
          <p className="font-medium">{error ? "No weather" : "Locating you..."}</p>
          <p className="text-xs text-muted">
            {error ?? "Allow location to tailor suggestions to today's weather."}
          </p>
        </div>
      </div>
    );
  }
  const emoji = weatherEmoji(weather);
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-paper text-2xl">
        {emoji}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">
          {Math.round(weather.temperatureC)}°C • {weather.description}
        </p>
        <p className="text-xs text-muted">
          Feels {Math.round(weather.feelsLikeC)}° • {weather.precipitationProb}% rain
        </p>
      </div>
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
