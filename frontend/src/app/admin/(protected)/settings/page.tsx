"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AdminAlert,
  AdminPageHeader,
  Field,
} from "@/components/admin/ui";
import { api, type RestaurantSettings } from "@/lib/api";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      await api.patch("/admin/settings", {
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
      });
      setMessage("Settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Restaurant"
        title="Settings"
        description="Display name, address, and phone used across the public site. Changes persist in MongoDB."
      />

      {loading ? (
        <p className="text-sm text-muted">Loading settings…</p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="admin-card max-w-xl space-y-5 p-5 sm:p-6"
        >
          <section className="space-y-4">
            <h2 className="text-[0.65rem] tracking-[0.16em] text-gold uppercase">
              Profile
            </h2>
            <Field label="Display name" htmlFor="settings-name" required>
              <input
                id="settings-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="admin-input"
              />
            </Field>
          </section>

          <section className="space-y-4 border-t border-border pt-5">
            <h2 className="text-[0.65rem] tracking-[0.16em] text-gold uppercase">
              Contact
            </h2>
            <Field label="Address" htmlFor="settings-address">
              <textarea
                id="settings-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                className="admin-input"
              />
            </Field>
            <Field
              label="Phone"
              htmlFor="settings-phone"
              help="Shown on the contact page and footer. Use digits guests can dial."
            >
              <input
                id="settings-phone"
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="admin-input"
              />
            </Field>
            {form.phone.trim() ? (
              <p className="text-sm text-muted">
                Preview:{" "}
                <a
                  href={`tel:${form.phone.replace(/\s/g, "")}`}
                  className="font-medium text-burgundy underline-offset-2 hover:underline"
                >
                  {form.phone}
                </a>
              </p>
            ) : null}
          </section>

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving…" : "Save settings"}
            </button>
          </div>

          {message ? <AdminAlert tone="success">{message}</AdminAlert> : null}
          {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}
        </form>
      )}
    </div>
  );
}
