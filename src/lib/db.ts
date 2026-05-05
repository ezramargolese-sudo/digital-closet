import { admin } from "./supabase";
import type {
  ClothingItem,
  Outfit,
  Trip,
  Category,
  Style,
  Season,
  Profile,
  Notification,
} from "./types";

interface ItemRow {
  id: number;
  name: string;
  category: string;
  color: string;
  brand: string | null;
  size: string | null;
  price: number | null;
  tags: string[] | null;
  image_url: string;
  warmth: number;
  created_at: string;
  last_worn_at: string | null;
  user_id: string | null;
}

interface OutfitRow {
  id: number;
  name: string;
  style: string;
  item_ids: number[] | null;
  seasons: string[] | null;
  worn_count: number;
  favorite: boolean;
  created_at: string;
  user_id: string | null;
}

interface TripRow {
  id: number;
  name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  item_ids: number[] | null;
  created_at: string;
  user_id: string | null;
}

interface ProfileRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

interface NotificationRow {
  id: number;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

function rowToItem(r: ItemRow): ClothingItem {
  return {
    id: r.id,
    name: r.name,
    category: r.category as Category,
    color: r.color,
    brand: r.brand,
    size: r.size,
    price: r.price !== null ? Number(r.price) : null,
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
    seasons: (r.seasons ?? []) as Season[],
    wornCount: r.worn_count ?? 0,
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

function rowToProfile(r: ProfileRow): Profile {
  return {
    id: r.id,
    email: r.email,
    firstName: r.first_name,
    lastName: r.last_name,
    username: r.username,
    avatarUrl: r.avatar_url,
    createdAt: r.created_at,
  };
}

function rowToNotification(r: NotificationRow): Notification {
  return {
    id: r.id,
    userId: r.user_id,
    type: r.type,
    title: r.title,
    body: r.body,
    payload: r.payload ?? {},
    readAt: r.read_at,
    createdAt: r.created_at,
  };
}

// ============== ITEMS ==============

export async function listItems(userId: string): Promise<ClothingItem[]> {
  const { data, error } = await admin()
    .from("items")
    .select("*")
    .eq("user_id", userId)
    .order("id", { ascending: false });
  if (error) throw error;
  return (data as ItemRow[]).map(rowToItem);
}

export async function getItem(userId: string, id: number): Promise<ClothingItem | null> {
  const { data, error } = await admin()
    .from("items")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToItem(data as ItemRow) : null;
}

export async function createItem(
  userId: string,
  input: {
    name: string;
    category: Category;
    color: string;
    brand?: string | null;
    size?: string | null;
    price?: number | null;
    tags?: string[];
    imageUrl: string;
    warmth?: number;
  }
): Promise<ClothingItem> {
  const { data, error } = await admin()
    .from("items")
    .insert({
      user_id: userId,
      name: input.name,
      category: input.category,
      color: input.color,
      brand: input.brand ?? null,
      size: input.size ?? null,
      price: input.price ?? null,
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
  userId: string,
  id: number,
  patch: Partial<{
    name: string;
    category: Category;
    color: string;
    brand: string | null;
    size: string | null;
    price: number | null;
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
  if (patch.size !== undefined) dbPatch.size = patch.size;
  if (patch.price !== undefined) dbPatch.price = patch.price;
  if (patch.tags !== undefined) dbPatch.tags = patch.tags;
  if (patch.warmth !== undefined) dbPatch.warmth = patch.warmth;
  if (patch.lastWornAt !== undefined) dbPatch.last_worn_at = patch.lastWornAt;
  const { data, error } = await admin()
    .from("items")
    .update(dbPatch)
    .eq("user_id", userId)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? rowToItem(data as ItemRow) : null;
}

export async function deleteItem(userId: string, id: number): Promise<boolean> {
  const { error, count } = await admin()
    .from("items")
    .delete({ count: "exact" })
    .eq("user_id", userId)
    .eq("id", id);
  if (error) throw error;
  return (count ?? 0) > 0;
}

// ============== OUTFITS ==============

export async function listOutfits(userId: string): Promise<Outfit[]> {
  const { data, error } = await admin()
    .from("outfits")
    .select("*")
    .eq("user_id", userId)
    .order("id", { ascending: false });
  if (error) throw error;
  return (data as OutfitRow[]).map(rowToOutfit);
}

export async function listOutfitsForUser(userId: string): Promise<Outfit[]> {
  return listOutfits(userId);
}

export async function getOutfit(userId: string, id: number): Promise<Outfit | null> {
  const { data, error } = await admin()
    .from("outfits")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToOutfit(data as OutfitRow) : null;
}

export async function createOutfit(
  userId: string,
  input: {
    name: string;
    style: Style;
    itemIds: number[];
    seasons?: Season[];
    favorite?: boolean;
  }
): Promise<Outfit> {
  const { data, error } = await admin()
    .from("outfits")
    .insert({
      user_id: userId,
      name: input.name,
      style: input.style,
      item_ids: input.itemIds,
      seasons: input.seasons ?? [],
      favorite: !!input.favorite,
    })
    .select("*")
    .single();
  if (error) throw error;
  return rowToOutfit(data as OutfitRow);
}

export async function updateOutfit(
  userId: string,
  id: number,
  patch: Partial<{
    name: string;
    style: Style;
    itemIds: number[];
    seasons: Season[];
    favorite: boolean;
    wornCount: number;
  }>
): Promise<Outfit | null> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.style !== undefined) dbPatch.style = patch.style;
  if (patch.itemIds !== undefined) dbPatch.item_ids = patch.itemIds;
  if (patch.seasons !== undefined) dbPatch.seasons = patch.seasons;
  if (patch.favorite !== undefined) dbPatch.favorite = patch.favorite;
  if (patch.wornCount !== undefined) dbPatch.worn_count = patch.wornCount;
  const { data, error } = await admin()
    .from("outfits")
    .update(dbPatch)
    .eq("user_id", userId)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? rowToOutfit(data as OutfitRow) : null;
}

export async function incrementOutfitWornCount(
  userId: string,
  id: number
): Promise<Outfit | null> {
  const current = await getOutfit(userId, id);
  if (!current) return null;
  return updateOutfit(userId, id, { wornCount: current.wornCount + 1 });
}

export async function deleteOutfit(userId: string, id: number): Promise<boolean> {
  const { error, count } = await admin()
    .from("outfits")
    .delete({ count: "exact" })
    .eq("user_id", userId)
    .eq("id", id);
  if (error) throw error;
  return (count ?? 0) > 0;
}

// ============== TRIPS ==============

export async function listTrips(userId: string): Promise<Trip[]> {
  const { data, error } = await admin()
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .order("id", { ascending: false });
  if (error) throw error;
  return (data as TripRow[]).map(rowToTrip);
}

export async function getTrip(userId: string, id: number): Promise<Trip | null> {
  const { data, error } = await admin()
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToTrip(data as TripRow) : null;
}

export async function createTrip(
  userId: string,
  input: {
    name: string;
    destination?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    itemIds?: number[];
  }
): Promise<Trip> {
  const { data, error } = await admin()
    .from("trips")
    .insert({
      user_id: userId,
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
  userId: string,
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
    .eq("user_id", userId)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? rowToTrip(data as TripRow) : null;
}

export async function deleteTrip(userId: string, id: number): Promise<boolean> {
  const { error, count } = await admin()
    .from("trips")
    .delete({ count: "exact" })
    .eq("user_id", userId)
    .eq("id", id);
  if (error) throw error;
  return (count ?? 0) > 0;
}

// ============== PROFILES ==============

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await admin()
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToProfile(data as ProfileRow) : null;
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await admin()
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data ? rowToProfile(data as ProfileRow) : null;
}

export async function getProfilesByIds(ids: string[]): Promise<Profile[]> {
  if (ids.length === 0) return [];
  const { data, error } = await admin().from("profiles").select("*").in("id", ids);
  if (error) throw error;
  return (data as ProfileRow[]).map(rowToProfile);
}

// ============== FRIENDS ==============

function pair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function areFriends(userA: string, userB: string): Promise<boolean> {
  const [a, b] = pair(userA, userB);
  const { count, error } = await admin()
    .from("friendships")
    .select("user_a", { head: true, count: "exact" })
    .eq("user_a", a)
    .eq("user_b", b);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function listFriends(userId: string): Promise<Profile[]> {
  const { data, error } = await admin()
    .from("friendships")
    .select("user_a,user_b")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`);
  if (error) throw error;
  const others = (data as { user_a: string; user_b: string }[])
    .map((r) => (r.user_a === userId ? r.user_b : r.user_a));
  return getProfilesByIds(others);
}

export async function sendFriendRequest(fromUser: string, toUser: string) {
  if (fromUser === toUser) throw new Error("Can't friend yourself.");
  if (await areFriends(fromUser, toUser)) throw new Error("Already friends.");

  // If reciprocal pending request exists, accept both into a friendship.
  const reciprocal = await admin()
    .from("friend_requests")
    .select("id")
    .eq("from_user", toUser)
    .eq("to_user", fromUser)
    .eq("status", "pending")
    .maybeSingle();
  if (reciprocal.data) {
    await admin()
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", reciprocal.data.id);
    const [a, b] = pair(fromUser, toUser);
    await admin().from("friendships").insert({ user_a: a, user_b: b });
    await admin().from("notifications").insert({
      user_id: toUser,
      type: "friend_accepted",
      title: "You're now friends",
      body: null,
      payload: { user_id: fromUser },
    });
    return { status: "accepted" as const };
  }

  // Otherwise create a pending request
  const { error } = await admin()
    .from("friend_requests")
    .upsert(
      { from_user: fromUser, to_user: toUser, status: "pending" },
      { onConflict: "from_user,to_user" }
    );
  if (error) throw error;
  await admin().from("notifications").insert({
    user_id: toUser,
    type: "friend_request",
    title: "New friend request",
    body: null,
    payload: { from_user: fromUser },
  });
  return { status: "pending" as const };
}

export async function listIncomingRequests(userId: string) {
  const { data, error } = await admin()
    .from("friend_requests")
    .select("id, from_user, to_user, status, created_at")
    .eq("to_user", userId)
    .eq("status", "pending")
    .order("id", { ascending: false });
  if (error) throw error;
  const fromIds = (data as { from_user: string }[]).map((r) => r.from_user);
  const profiles = await getProfilesByIds(fromIds);
  const byId = new Map(profiles.map((p) => [p.id, p]));
  return (data as { id: number; from_user: string; to_user: string; status: string; created_at: string }[]).map(
    (r) => ({
      id: r.id,
      fromUser: r.from_user,
      toUser: r.to_user,
      status: r.status as "pending" | "accepted" | "rejected",
      createdAt: r.created_at,
      fromProfile: byId.get(r.from_user),
    })
  );
}

export async function respondToFriendRequest(
  userId: string,
  requestId: number,
  accept: boolean
) {
  const { data: reqRow, error } = await admin()
    .from("friend_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();
  if (error) throw error;
  if (!reqRow) throw new Error("Request not found");
  if (reqRow.to_user !== userId) throw new Error("Not your request");

  await admin()
    .from("friend_requests")
    .update({ status: accept ? "accepted" : "rejected" })
    .eq("id", requestId);

  if (accept) {
    const [a, b] = pair(reqRow.from_user, reqRow.to_user);
    await admin().from("friendships").upsert({ user_a: a, user_b: b }, { onConflict: "user_a,user_b" });
    await admin().from("notifications").insert({
      user_id: reqRow.from_user,
      type: "friend_accepted",
      title: "Friend request accepted",
      body: null,
      payload: { user_id: reqRow.to_user },
    });
  }
}

export async function removeFriend(userId: string, otherUserId: string) {
  const [a, b] = pair(userId, otherUserId);
  await admin().from("friendships").delete().eq("user_a", a).eq("user_b", b);
}

// ============== NOTIFICATIONS ==============

export async function listNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await admin()
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("id", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data as NotificationRow[]).map(rowToNotification);
}

export async function markNotificationsRead(userId: string) {
  await admin()
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);
}
