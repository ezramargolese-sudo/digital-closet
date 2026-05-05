"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="hero-grad min-h-dvh" />}>
      <SignupInner />
    </Suspense>
  );
}

function SignupInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "ok" | "taken" | "invalid" | "error">("idle");
  const [usernameStatusMsg, setUsernameStatusMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Live username availability check
  useEffect(() => {
    const u = username.trim().toLowerCase();
    setUsernameStatusMsg(null);
    if (!u) return setUsernameStatus("idle");
    if (!/^[a-z0-9_.]{3,20}$/.test(u)) {
      setUsernameStatus("invalid");
      return;
    }
    setUsernameStatus("checking");
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/auth/username?u=${encodeURIComponent(u)}`);
        const d = await r.json();
        if (d.available === true) {
          setUsernameStatus("ok");
        } else if (d.reason === "config") {
          setUsernameStatus("error");
          setUsernameStatusMsg("Server is missing Supabase keys");
        } else if (d.reason && d.reason !== "invalid") {
          setUsernameStatus("error");
          setUsernameStatusMsg(d.reason);
        } else {
          setUsernameStatus("taken");
        }
      } catch {
        setUsernameStatus("error");
        setUsernameStatusMsg("Network error");
      }
    }, 350);
    return () => clearTimeout(t);
  }, [username]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (usernameStatus === "error") {
      setError(usernameStatusMsg ?? "Server error checking username. Check your Supabase env vars.");
      return;
    }
    if (usernameStatus !== "ok") {
      setError("Pick an available username (3-20 chars, letters/numbers/_/.)");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim().toLowerCase(),
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error ?? "Sign-up failed");
        setSubmitting(false);
        return;
      }
      if (d.needsConfirmation) {
        setInfo("Check your email to confirm your account, then log in.");
        setSubmitting(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error");
      setSubmitting(false);
    }
  }

  return (
    <div className="hero-grad min-h-dvh px-6 pb-12 pt-12 text-cream">
      <Link href="/welcome" className="text-xs text-blush/80">
        ← Back
      </Link>
      <h1 className="mt-4 font-display text-4xl font-bold">Create your closet</h1>
      <p className="mt-2 text-sm text-blush/80">Just a few details to get started.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="auth-input"
            />
          </Field>
          <Field label="Last name">
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="auth-input"
            />
          </Field>
        </div>

        <Field
          label="Username"
          hint={
            usernameStatus === "checking"
              ? "Checking..."
              : usernameStatus === "ok"
                ? "✓ Available"
                : usernameStatus === "taken"
                  ? "Taken"
                  : usernameStatus === "invalid"
                    ? "3-20 chars: letters, numbers, _ or ."
                    : usernameStatus === "error"
                      ? usernameStatusMsg ?? "Couldn't check"
                      : undefined
          }
          hintTone={
            usernameStatus === "ok"
              ? "ok"
              : usernameStatus === "taken" || usernameStatus === "invalid" || usernameStatus === "error"
                ? "err"
                : "neutral"
          }
        >
          <div className="flex items-center rounded-xl border border-blush/30 bg-white/10 backdrop-blur">
            <span className="pl-4 text-blush/70">@</span>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_handle"
              className="w-full bg-transparent px-2 py-3 text-cream placeholder:text-blush/40 focus:outline-none"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
        </Field>

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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
          />
        </Field>

        {error ? (
          <p className="rounded-xl border border-rose/40 bg-rose/20 p-3 text-sm">{error}</p>
        ) : null}
        {info ? (
          <p className="rounded-xl border border-blush/30 bg-white/10 p-3 text-sm">{info}</p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-cream py-4 text-base font-semibold text-ink shadow-soft active:scale-[0.99] disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create account"}
        </button>

        <p className="text-center text-sm text-blush/80">
          Already have one?{" "}
          <Link href="/login" className="font-semibold text-cream underline">
            Log in
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
        .auth-input::placeholder {
          color: rgba(223, 182, 178, 0.4);
        }
        .auth-input:focus {
          outline: none;
          border-color: rgba(223, 182, 178, 0.7);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
  hint,
  hintTone,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  hintTone?: "ok" | "err" | "neutral";
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-semibold uppercase tracking-wide text-blush/80">{label}</label>
        {hint ? (
          <span
            className={`text-xs ${
              hintTone === "ok" ? "text-blush" : hintTone === "err" ? "text-rose" : "text-blush/60"
            }`}
          >
            {hint}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}
