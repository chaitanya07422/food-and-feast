"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, type RestaurantSettings } from "@/lib/api";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<RestaurantSettings>("/admin/settings")
      .then((s) =>
        setForm({
          name: s.name ?? "",
          address: s.address ?? "",
          phone: s.phone ?? "",
        }),
      )
      .catch((err: Error) => setError(err.message));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.patch("/admin/settings", form);
      setMessage("Settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Restaurant settings</h1>
      <p className="mt-2 text-sm text-muted">
        Contact details from the menu PDF. Update anytime — changes persist in
        MongoDB.
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-8 max-w-xl space-y-4 rounded-[var(--radius-md)] border border-border bg-surface p-6"
      >
        <label className="block text-sm">
          Display name
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Address
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Phone
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-burgundy px-4 py-2 text-sm font-medium text-ivory"
        >
          Save settings
        </button>
        {message ? <p className="text-sm text-[var(--color-success)]">{message}</p> : null}
        {error ? (
          <p className="text-sm text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
