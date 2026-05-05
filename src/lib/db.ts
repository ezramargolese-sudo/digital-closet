import { admin } from "./supabase";
import type { ClothingItem, Outfit, Trip, Category, Style } from "./types";

interface ItemRow {
  id: number;
  name: string;
  category: string;
  color: string;
  brand: string | null;
  tags: string[] | null;
  image_url: string;
  warmth: number;
  created_at: string;
  last_worn_at: string | null;
}

interface OutfitRow {
  id: number;
  name: string;
  style: string;
  item_ids: number[] | null;
  favorite: boolean;
  created_at: string;
}

interface TripRow {
  id: number;
  name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  item_ids: number[] | null;
  created_at: string;
}

function rowToItem(r: ItemRow): ClothingItem {
  return {
    id: r.id,
    name: r.name,
    category: r.category as Category,
    color: r.color,
    brand: r.brand,
    tags: r.tags ?? [],
    imageUrl: r.image_url,
    warmth: r.warmth,
    createdAt: r.created_at,
    lastWornAt: r.last_worn_at,
  };
}

function rowToOutfit(r: OutfitRow): Outfit {
  return {
    id: r.id,
    name: r.name,
    style: r.style as Style,
    itemIds: r.item_ids ?? [],
    favorite: r.favorite,
    createdAt: r.created_at,
  };
}

function rowToTrip(r: TripRow): Trip {
  return {
    id: r.id,
    name: r.name,
    destination: r.destination,
    startDate: r.start_date,
    endDate: r.end_date,
    itemIds: r.item_ids ?? [],
    createdAt: r.created_at,
  };
}

// ============== ITEMS ==============

export async function listItems(): Promise<ClothingItem[]> {
  const { data, error } = await admin()
    .from("items")
    .select("*")
    .order("id", { ascending: false });
  if (error) throw error;
  return (data as ItemRow[]).map(rowToItem);
}

export async function getItem(id: number): Promise<ClothingItem | null> {
  const { data, error } = await admin().from("items").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToItem(data as ItemRow) : null;
}

export async function createItem(input: {
  name: string;
  category: Category;
  color: string;
  brand?: string | null;
  tags?: string[];
  imageUrl: string;
  warmth?: number;
}): Promise<ClothingItem> {
  const { data, error } = await admin()
    .from("items")
    .insert({
      name: input.name,
      category: input.category,
      color: input.color,
      brand: input.brand ?? null,
      tags: input.tags ?? [],
      image_url: input.imageUrl,
      warmth: input.warmth ?? 3,
    })
    .select("*")
    .single();
  if (error) throw error;
  return rowToItem(data as ItemRow);
}

export async function updateItem(
  id: number,
  patch: Partial<{
    name: string;
    category: Category;
    color: string;
    brand: string | null;
    tags: string[];
    warmth: number;
    lastWornAt: string | null;
  }>
): Promise<ClothingItem | null> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.category !== undefined) dbPatch.category = patch.category;
  if (patch.color !== undefined) dbPatch.color = patch.color;
  if (patch.brand !== undefined) dbPatch.brand = patch.brand;
  if (patch.tags !== undefined) dbPatch.tags = patch.tags;
  if (patch.warmth !== undefined) dbPatch.warmth = patch.warmth;
  if (patch.lastWornAt !== undefined) dbPatch.last_worn_at = patch.lastWornAt;
  const { data, error } = await admin()
    .from("items")
    .update(dbPatch)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? rowToItem(data as ItemRow) : null;
}

export async function deleteItem(id: number): Promise<boolean> {
  const { error, count } = await admin()
    .from("items")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw error;
  return (count ?? 0) > 0;
}

// ============== OUTFITS ==============

export async function listOutfits(): Promise<Outfit[]> {
  const { data, error } = await admin()
    .from("outfits")
    .select("*")
    .order("id", { ascending: false });
  if (error) throw error;
  return (data as OutfitRow[]).map(rowToOutfit);
}

export async function getOutfit(id: number): Promise<Outfit | null> {
  const { data, error } = await admin().from("outfits").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToOutfit(data as OutfitRow) : null;
}

export async function createOutfit(input: {
  name: string;
  style: Style;
  itemIds: number[];
  favorite?: boolean;
}): Promise<Outfit> {
  const { data, error } = await admin()
    .from("outfits")
    .insert({
      name: input.name,
      style: input.style,
      item_ids: input.itemIds,
      favorite: !!input.favorite,
    })
    .select("*")
    .single();
  if (error) throw error;
  return rowToOutfit(data as OutfitRow);
}

export async function updateOutfit(
  id: number,
  patch: Partial<{ name: string; style: Style; itemIds: number[]; favorite: boolean }>
): Promise<Outfit | null> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.style !== undefined) dbPatch.style = patch.style;
  if (patch.itemIds !== undefined) dbPatch.item_ids = patch.itemIds;
  if (patch.favorite !== undefined) dbPatch.favorite = patch.favorite;
  const { data, error } = await admin()
    .from("outfits")
    .update(dbPatch)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? rowToOutfit(data as OutfitRow) : null;
}

export async function deleteOutfit(id: number): Promise<boolean> {
  const { error, count } = await admin()
    .from("outfits")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw error;
  return (count ?? 0) > 0;
}

// ============== TRIPS ==============

export async function listTrips(): Promise<Trip[]> {
  const { data, error } = await admin()
    .from("trips")
    .select("*")
    .order("id", { ascending: false });
  if (error) throw error;
  return (data as TripRow[]).map(rowToTrip);
}

export async function getTrip(id: number): Promise<Trip | null> {
  const { data, error } = await admin().from("trips").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToTrip(data as TripRow) : null;
}

export async function createTrip(input: {
  name: string;
  destination?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  itemIds?: number[];
}): Promise<Trip> {
  const { data, error } = await admin()
    .from("trips")
    .insert({
      name: input.name,
      destination: input.destination ?? null,
      start_date: input.startDate ?? null,
      end_date: input.endDate ?? null,
      item_ids: input.itemIds ?? [],
    })
    .select("*")
    .single();
  if (error) throw error;
  return rowToTrip(data as TripRow);
}

export async function updateTrip(
  id: number,
  patch: Partial<{
    name: string;
    destination: string | null;
    startDate: string | null;
    endDate: string | null;
    itemIds: number[];
  }>
): Promise<Trip | null> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.destination !== undefined) dbPatch.destination = patch.destination;
  if (patch.startDate !== undefined) dbPatch.start_date = patch.startDate;
  if (patch.endDate !== undefined) dbPatch.end_date = patch.endDate;
  if (patch.itemIds !== undefined) dbPatch.item_ids = patch.itemIds;
  const { data, error } = await admin()
    .from("trips")
    .update(dbPatch)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? rowToTrip(data as TripRow) : null;
}

export async function deleteTrip(id: number): Promise<boolean> {
  const { error, count } = await admin()
    .from("trips")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw error;
  return (count ?? 0) > 0;
}
