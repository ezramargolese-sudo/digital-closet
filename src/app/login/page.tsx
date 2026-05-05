"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="hero-grad min-h-dvh" />}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const d = await r.json();
    if (!r.ok) {
      setError(d.error ?? "Login failed");
      setSubmitting(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="hero-grad min-h-dvh px-6 pb-12 pt-12 text-cream">
      <Link href="/welcome" className="text-xs text-blush/80">
        ← Back
      </Link>
      <h1 className="mt-4 font-display text-4xl font-bold">Welcome back.</h1>
      <p className="mt-2 text-sm text-blush/80">Sign in to your closet.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Email">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </Field>
        <Field label="Password">
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
          />
        </Field>

        {error ? (
          <p className="rounded-xl border border-rose/40 bg-rose/20 p-3 text-sm">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-cream py-4 text-base font-semibold text-ink shadow-soft active:scale-[0.99] disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-center text-sm text-blush/80">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-cream underline">
            Create an account
          </Link>
        </p>
      </form>

      <style jsx>{`
        .auth-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(223, 182, 178, 0.3);
          border-radius: 12px;
          padding: 12px 16px;
          color: #fbe4d8;
          backdrop-filter: blur(6px);
        }
        .auth-input::placeholder { color: rgba(223, 182, 178, 0.4); }
        .auth-input:focus { outline: none; border-color: rgba(223, 182, 178, 0.7); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-blush/80">{label}</label>
      {children}
    </div>
  );
}
