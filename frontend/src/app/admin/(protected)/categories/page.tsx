"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, type Category } from "@/lib/api";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const list = await api.get<Category[]>("/admin/menu/categories");
    setCategories(list);
  }, []);

  useEffect(() => {
    load().catch((err: Error) => setError(err.message));
  }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
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
    }
  }

  async function toggleActive(cat: Category) {
    await api.patch(`/admin/menu/categories/${cat._id}`, {
      isActive: !cat.isActive,
    });
    await load();
  }

  async function onDelete(cat: Category) {
    if ((cat.itemCount ?? 0) > 0) {
      const target = prompt(
        `“${cat.name}” has ${cat.itemCount} dishes. Enter the ID of another category to move them to, or cancel.`,
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
    if (!confirm(`Delete category “${cat.name}”?`)) return;
    await api.delete(`/admin/menu/categories/${cat._id}`);
    setMessage("Category deleted.");
    await load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Categories</h1>
        <p className="mt-2 text-sm text-muted">
          Click a category to view all dishes in it. Deleting a category with
          dishes requires reassignment.
        </p>
      </div>

      <form
        onSubmit={onCreate}
        className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border bg-surface p-4 sm:flex-row sm:items-end"
      >
        <label className="block flex-1 text-sm">
          New category name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-border px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-burgundy px-4 py-2 text-sm font-medium text-ivory"
        >
          Add category
        </button>
      </form>

      {message ? <p className="text-sm text-[#3d6b4f]">{message}</p> : null}
      {error ? (
        <p className="text-sm text-[#8b2e2e]" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="divide-y divide-border rounded-[var(--radius-md)] border border-border bg-surface">
        {categories.map((cat) => (
          <li
            key={cat._id}
            className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <Link
              href={`/admin/categories/${cat._id}`}
              className="min-w-0 flex-1 rounded-md px-1 py-0.5 outline-offset-2 hover:bg-ivory-deep/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-burgundy"
            >
              <p className="font-medium text-burgundy">
                {cat.name}
              </p>
              <p className="text-xs text-muted">
                {cat.itemCount ?? 0} dishes ·{" "}
                {cat.isActive ? "Active" : "Inactive"} · View dishes →
              </p>
            </Link>
            <div className="flex gap-3 text-sm">
              <button
                type="button"
                onClick={() => toggleActive(cat)}
                className="text-burgundy underline-offset-2 hover:underline"
              >
                {cat.isActive ? "Deactivate" : "Activate"}
              </button>
              <button
                type="button"
                onClick={() => onDelete(cat)}
                className="text-[#8b2e2e] underline-offset-2 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
