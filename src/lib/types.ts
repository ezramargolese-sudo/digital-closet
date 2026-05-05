export type Category =
  | "top"
  | "bottom"
  | "outerwear"
  | "shoes"
  | "dress"
  | "accessory";

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "top", label: "Top", emoji: "👕" },
  { value: "bottom", label: "Bottom", emoji: "👖" },
  { value: "outerwear", label: "Outerwear", emoji: "🧥" },
  { value: "shoes", label: "Shoes", emoji: "👟" },
  { value: "dress", label: "Dress", emoji: "👗" },
  { value: "accessory", label: "Accessory", emoji: "👜" },
];

export type Style = "casual" | "formal" | "gym" | "vacation" | "going-out";

export const STYLES: { value: Style; label: string }[] = [
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "gym", label: "Gym" },
  { value: "vacation", label: "Vacation" },
  { value: "going-out", label: "Going Out" },
];

export interface ClothingItem {
  id: number;
  name: string;
  category: Category;
  color: string;
  brand: string | null;
  tags: string[];
  imageUrl: string;
  warmth: number; // 1 (light) – 5 (heavy)
  createdAt: string;
  lastWornAt: string | null;
}

export interface Outfit {
  id: number;
  name: string;
  style: Style;
  itemIds: number[];
  favorite: boolean;
  createdAt: string;
}

export interface Trip {
  id: number;
  name: string;
  destination: string | null;
  startDate: string | null;
  endDate: string | null;
  itemIds: number[];
  createdAt: string;
}

export interface Weather {
  temperatureC: number;
  feelsLikeC: number;
  code: number;
  description: string;
  isDay: boolean;
  precipitationProb: number;
}
