import type { ClothingItem, Style, Weather } from "./types";

export interface SuggestionInput {
  items: ClothingItem[];
  style?: Style;
  weather?: Weather | null;
  itemIdPool?: number[]; // restrict pool (used by trip mode)
}

export interface Suggestion {
  items: ClothingItem[];
  reason: string;
}

function pickWarmthRange(weather: Weather | null | undefined): [number, number] {
  if (!weather) return [1, 5];
  const t = weather.feelsLikeC;
  if (t >= 25) return [1, 2];
  if (t >= 18) return [1, 3];
  if (t >= 10) return [2, 4];
  if (t >= 0) return [3, 5];
  return [4, 5];
}

function needsOuterwear(weather: Weather | null | undefined): boolean {
  if (!weather) return false;
  return weather.feelsLikeC < 14 || weather.precipitationProb > 50;
}

function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

function styleMatches(item: ClothingItem, style: Style | undefined): boolean {
  if (!style) return true;
  return item.tags.includes(style);
}

export function suggestOutfit(input: SuggestionInput): Suggestion | null {
  const { items, style, weather, itemIdPool } = input;
  const pool = itemIdPool ? items.filter((i) => itemIdPool.includes(i.id)) : items;

  const [minWarmth, maxWarmth] = pickWarmthRange(weather);

  const filterFor = (cat: ClothingItem["category"]) =>
    pool.filter(
      (i) =>
        i.category === cat &&
        i.warmth >= minWarmth &&
        i.warmth <= maxWarmth &&
        styleMatches(i, style)
    );

  // Relaxed fallback: ignore warmth and style if strict filtering yields nothing
  const fallbackFor = (cat: ClothingItem["category"]) => pool.filter((i) => i.category === cat);

  const dress = pickRandom(filterFor("dress")) ?? pickRandom(fallbackFor("dress"));

  const reasons: string[] = [];
  if (weather) {
    reasons.push(`${Math.round(weather.feelsLikeC)}°C • ${weather.description}`);
  }
  if (style) reasons.push(style);

  if (dress && Math.random() < 0.3) {
    const shoes = pickRandom(filterFor("shoes")) ?? pickRandom(fallbackFor("shoes"));
    const outer = needsOuterwear(weather)
      ? pickRandom(filterFor("outerwear")) ?? pickRandom(fallbackFor("outerwear"))
      : undefined;
    const items = [dress, shoes, outer].filter(Boolean) as ClothingItem[];
    if (items.length === 0) return null;
    return { items, reason: reasons.join(" • ") || "Picked at random" };
  }

  const top = pickRandom(filterFor("top")) ?? pickRandom(fallbackFor("top"));
  const bottom = pickRandom(filterFor("bottom")) ?? pickRandom(fallbackFor("bottom"));
  const shoes = pickRandom(filterFor("shoes")) ?? pickRandom(fallbackFor("shoes"));
  const outer = needsOuterwear(weather)
    ? pickRandom(filterFor("outerwear")) ?? pickRandom(fallbackFor("outerwear"))
    : undefined;

  const result = [top, bottom, shoes, outer].filter(Boolean) as ClothingItem[];
  if (result.length === 0) return null;
  return { items: result, reason: reasons.join(" • ") || "Picked at random" };
}
