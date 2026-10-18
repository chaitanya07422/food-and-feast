"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import {
  AdminAlert,
  AdminEmptyState,
  AdminPageHeader,
  Field,
  StatusBadge,
} from "@/components/admin/ui";
import { api, type Category } from "@/lib/api";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.get<Category[]>("/admin/menu/categories");
      setCategories(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post("/admin/menu/categories", {
        name: name.trim(),
        displayOrder: categories.length,
      });
      setName("");
      setMessage("Category created.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(cat: Category) {
    try {
      await api.patch(`/admin/menu/categories/${cat._id}`, {
        isActive: !cat.isActive,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function onDelete(cat: Category) {
    if ((cat.itemCount ?? 0) > 0) {
      const target = prompt(
        `“${cat.name}” has ${cat.itemCount} dishes. Enter the ID of another category to move them to before deleting, or cancel.`,
      );
      if (!target) return;
      try {
        await api.delete(
          `/admin/menu/categories/${cat._id}?reassignTo=${encodeURIComponent(target)}`,
        );
        setMessage("Category deleted and dishes reassigned.");
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
      return;
    }
    if (!confirm(`Delete category “${cat.name}”? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/menu/categories/${cat._id}`);
      setMessage("Category deleted.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Menu structure"
        title="Categories"
        description="Click a category to view its dishes. Deleting a category that still has dishes requires reassignment."
      />

      {message ? <AdminAlert tone="success">{message}</AdminAlert> : null}
      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}

      <form
        onSubmit={onCreate}
        className="admin-card flex flex-col gap-3 p-4 sm:flex-row sm:items-end"
      >
        <div className="min-w-0 flex-1">
          <Field label="New category name" htmlFor="cat-name" required>
            <input
              id="cat-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Desserts"
              className="admin-input"
            />
          </Field>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary gap-1.5 shrink-0"
        >
          <Plus size={16} aria-hidden />
          {saving ? "Adding…" : "Add category"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-muted">Loading categories…</p>
      ) : categories.length === 0 ? (
        <AdminEmptyState
          title="No categories yet"
          description="Create a category, then add dishes to it."
        />
      ) : (
        <ul className="admin-card divide-y divide-border overflow-hidden">
          {categories.map((cat) => (
            <li
              key={cat._id}
              className="flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-ivory/70 sm:flex-row sm:items-center sm:justify-between"
            >
              <Link
                href={`/admin/categories/${cat._id}`}
                className="group flex min-w-0 flex-1 items-center gap-3 rounded-[var(--radius-md)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-burgundy"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-charcoal group-hover:text-burgundy">
                    {cat.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {cat.itemCount ?? 0}{" "}
                    {(cat.itemCount ?? 0) === 1 ? "dish" : "dishes"} · View dishes
                  </p>
                </div>
                <StatusBadge tone={cat.isActive ? "success" : "neutral"}>
                  {cat.isActive ? "Active" : "Inactive"}
                </StatusBadge>
                <ChevronRight
                  size={16}
                  className="shrink-0 text-muted group-hover:text-burgundy"
                  aria-hidden
                />
              </Link>
              <div className="flex shrink-0 gap-3 text-sm sm:pl-2">
                <button
                  type="button"
                  onClick={() => toggleActive(cat)}
                  className="font-medium text-burgundy underline-offset-2 hover:underline"
                >
                  {cat.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(cat)}
                  className="font-medium text-[var(--ff-danger)] underline-offset-2 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
