"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AdminAlert, Field } from "@/components/admin/ui";
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
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(107,30,42,0.08),_transparent_55%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-md">
        <p className="text-[0.65rem] tracking-[0.2em] text-gold uppercase">
          Food &amp; Feast
        </p>
        <h1 className="mt-2 font-display text-4xl text-burgundy">Sign in</h1>
        <p className="mt-2 text-sm text-muted">
          Manage dishes, gallery, and homepage content for the restaurant.
        </p>

        <form
          onSubmit={onSubmit}
          className="admin-card mt-8 space-y-4 p-6 sm:p-7"
        >
          <Field label="Email" htmlFor="email" required>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
            />
          </Field>
          <Field label="Password" htmlFor="password" required>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
            />
          </Field>
          {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 inline-block text-sm text-burgundy underline-offset-4 hover:underline"
        >
          ← Back to website
        </Link>
      </div>
    </div>
  );
}
