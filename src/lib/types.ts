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

export type Style =
  | "casual"
  | "formal"
  | "gym"
  | "vacation"
  | "going-out"
  | "school"
  | "meetings";

export const STYLES: { value: Style; label: string }[] = [
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "gym", label: "Gym" },
  { value: "vacation", label: "Vacation" },
  { value: "going-out", label: "Going Out" },
  { value: "school", label: "School" },
  { value: "meetings", label: "Meetings" },
];

export type Season = "spring" | "summer" | "fall" | "winter";

export const SEASONS: { value: Season; label: string; emoji: string }[] = [
  { value: "spring", label: "Spring", emoji: "🌸" },
  { value: "summer", label: "Summer", emoji: "☀️" },
  { value: "fall", label: "Fall", emoji: "🍂" },
  { value: "winter", label: "Winter", emoji: "❄️" },
];

export interface ClothingItem {
  id: number;
  name: string;
  category: Category;
  color: string;
  brand: string | null;
  size: string | null;
  price: number | null;
  tags: string[];
  imageUrl: string;
  warmth: number;
  createdAt: string;
  lastWornAt: string | null;
}

export interface Outfit {
  id: number;
  name: string;
  style: Style;
  itemIds: number[];
  seasons: Season[];
  wornCount: number;
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

export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface FriendRequest {
  id: number;
  fromUser: string;
  toUser: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  fromProfile?: Profile;
  toProfile?: Profile;
}

export interface Notification {
  id: number;
  userId: string;
  type: string;
  title: string;
  body: string | null;
  payload: Record<string, unknown>;
  readAt: string | null;
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
