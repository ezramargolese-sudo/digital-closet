import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const STORAGE_BUCKET = "closet";

export class SupabaseConfigError extends Error {
  constructor() {
    super(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local (or Vercel env)."
    );
    this.name = "SupabaseConfigError";
  }
}

let _admin: SupabaseClient | null = null;

/** Service-role admin client. Bypasses RLS. SERVER ONLY. */
export function admin(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new SupabaseConfigError();
  _admin = createClient(url, key, { auth: { persistSession: false } });
  return _admin;
}

/** SSR client bound to the request's cookies. Use on the server to read the current user. */
export async function serverClient(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new SupabaseConfigError();
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options as CookieOptions);
          }
        } catch {
          // Called from a Server Component — ignore (cookies set in middleware).
        }
      },
    },
  });
}

/** Returns the auth.user row for the current session, or null. */
export async function currentUser() {
  const sc = await serverClient();
  const { data } = await sc.auth.getUser();
  return data.user ?? null;
}

/** Throws a 401-style error if no user is signed in. */
export async function requireUser() {
  const u = await currentUser();
  if (!u) throw new UnauthorizedError();
  return u;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Not signed in");
    this.name = "UnauthorizedError";
  }
}
