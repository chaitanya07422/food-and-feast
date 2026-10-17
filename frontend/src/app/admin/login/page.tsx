"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ApiError, api } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@example.com");
  const [password, setPassword] = useState("ChangeMeLocalOnly123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/admin/auth/login", { email, password });
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Unable to sign in right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16">
      <p className="text-xs tracking-[0.2em] text-gold uppercase">Admin portal</p>
      <h1 className="mt-2 font-display text-4xl text-burgundy">Sign in</h1>
      <p className="mt-3 text-sm text-muted">
        Manage dishes, prices, and categories for Food &amp; Feast.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-[var(--radius-md)] border border-border bg-surface p-6 shadow-[var(--shadow-soft)]"
      >
        <div>
          <label className="block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-ivory px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-ivory px-3 py-2 text-sm"
          />
        </div>
        {error ? (
          <p className="text-sm text-[#8b2e2e]" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-burgundy px-4 py-2.5 text-sm font-medium text-ivory hover:bg-burgundy-deep disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <Link
        href="/"
        className="mt-6 text-sm text-burgundy underline-offset-4 hover:underline"
      >
        ← Back to website
      </Link>
    </div>
  );
}
