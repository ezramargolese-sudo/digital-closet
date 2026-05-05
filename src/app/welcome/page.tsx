"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function WelcomePage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="hero-grad relative -mx-0 flex min-h-dvh flex-col items-center justify-center px-6 text-cream">
      <div
        className={`flex flex-col items-center text-center transition-all duration-700 ${
          show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <p className="text-sm font-medium tracking-[0.3em] text-blush">DIGITAL CLOSET</p>
        <h1 className="mt-6 font-display text-6xl font-bold tracking-tight">
          hello.
        </h1>
        <p className="mt-6 max-w-xs text-base text-blush/90">
          Your wardrobe, beautifully organized. Build outfits, plan trips, never wonder what to wear.
        </p>
      </div>

      <div
        className={`mt-12 flex w-full max-w-xs flex-col gap-3 transition-all delay-300 duration-700 ${
          show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <Link
          href="/signup"
          className="w-full rounded-full bg-cream py-4 text-center text-base font-semibold text-ink shadow-soft active:scale-[0.99]"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="w-full rounded-full border border-blush/40 bg-white/5 py-4 text-center text-base font-medium text-cream backdrop-blur"
        >
          I already have an account
        </Link>
      </div>

      <div className="absolute bottom-8 text-xs text-blush/60">made with care</div>
    </div>
  );
}
