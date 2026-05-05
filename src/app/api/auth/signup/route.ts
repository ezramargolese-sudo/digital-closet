import { NextResponse } from "next/server";
import { admin, serverClient, SupabaseConfigError } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password, firstName, lastName, username } = body;
  if (!email || !password || !firstName || !lastName || !username) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  const u = username.trim().toLowerCase();
  if (!/^[a-z0-9_.]{3,20}$/.test(u)) {
    return NextResponse.json(
      { error: "Username must be 3-20 chars, letters/numbers/_/." },
      { status: 400 }
    );
  }

  try {
    // Check username availability up front (avoids creating an auth user first)
    const taken = await admin()
      .from("profiles")
      .select("id")
      .eq("username", u)
      .limit(1);
    if (taken.error) throw taken.error;
    if ((taken.data?.length ?? 0) > 0) {
      return NextResponse.json({ error: "Username is taken." }, { status: 409 });
    }

    // Use the SSR client so the auth cookie gets set on success
    const sc = await serverClient();
    const { data, error } = await sc.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName, username: u } },
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data.user) {
      return NextResponse.json(
        { error: "Could not create account. Try a different email." },
        { status: 400 }
      );
    }

    // Create the profile row (service role bypasses RLS)
    const { error: pErr } = await admin().from("profiles").insert({
      id: data.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      username: u,
    });
    if (pErr) {
      // Best-effort cleanup if profile insert fails
      await admin().auth.admin.deleteUser(data.user.id).catch(() => {});
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }

    return NextResponse.json({
      user: { id: data.user.id, email: data.user.email },
      needsConfirmation: !data.session,
    });
  } catch (err) {
    if (err instanceof SupabaseConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sign-up failed" },
      { status: 500 }
    );
  }
}
