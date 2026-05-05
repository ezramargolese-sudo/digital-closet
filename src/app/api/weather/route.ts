import { NextResponse } from "next/server";
import type { Weather } from "@/lib/types";

const CODE_MAP: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Heavy rain showers",
  82: "Violent rain showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");
  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  const apiUrl = new URL("https://api.open-meteo.com/v1/forecast");
  apiUrl.searchParams.set("latitude", lat);
  apiUrl.searchParams.set("longitude", lon);
  apiUrl.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,is_day,precipitation_probability,weather_code"
  );
  apiUrl.searchParams.set("temperature_unit", "celsius");
  apiUrl.searchParams.set("timezone", "auto");

  try {
    const res = await fetch(apiUrl.toString(), { next: { revalidate: 600 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: `weather api ${res.status}` },
        { status: 502 }
      );
    }
    const data = (await res.json()) as {
      current: {
        temperature_2m: number;
        apparent_temperature: number;
        is_day: number;
        precipitation_probability: number | null;
        weather_code: number;
      };
    };
    const c = data.current;
    const weather: Weather = {
      temperatureC: c.temperature_2m,
      feelsLikeC: c.apparent_temperature,
      code: c.weather_code,
      description: CODE_MAP[c.weather_code] ?? "Unknown",
      isDay: c.is_day === 1,
      precipitationProb: c.precipitation_probability ?? 0,
    };
    return NextResponse.json({ weather });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "weather fetch failed" },
      { status: 502 }
    );
  }
}
