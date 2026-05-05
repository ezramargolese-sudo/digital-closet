import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = ["/welcome", "/login", "/signup"];

export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured yet, let everything through so dev still loads.
  if (!url || !anon) return NextResponse.next();

  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(toSet) {
        for (const { name, value, options } of toSet) {
          res.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;
  const isPublic =
    PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/")) ||
    path.startsWith("/api/") ||
    path.startsWith("/_next/") ||
    path.startsWith("/favicon");

  if (!user && !isPublic) {
    const dest = req.nextUrl.clone();
    dest.pathname = "/welcome";
    dest.searchParams.set("next", path);
    return NextResponse.redirect(dest);
  }

  if (user && (path === "/welcome" || path === "/login" || path === "/signup")) {
    const dest = req.nextUrl.clone();
    dest.pathname = "/";
    dest.search = "";
    return NextResponse.redirect(dest);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
