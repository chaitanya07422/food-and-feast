"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  api,
  formatInr,
  type Category,
  type MenuItem,
} from "@/lib/api";

export default function AdminCategoryDishesPage() {
  const params = useParams();
  const categoryId = String(params.categoryId ?? "");

  const [category, setCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!categoryId) return;
    setLoading(true);
    setError(null);
    try {
      const [cats, list] = await Promise.all([
        api.get<Category[]>("/admin/menu/categories"),
        api.get<MenuItem[]>(
          `/admin/menu/items?categoryId=${encodeURIComponent(categoryId)}`,
        ),
      ]);
      const found = cats.find((c) => c._id === categoryId) ?? null;
      if (!found) {
        setError("Category not found.");
        setCategory(null);
        setItems([]);
        return;
      }
      setCategory(found);
      setItems(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dishes");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onDelete(id: string, name: string) {
    if (!confirm(`Delete “${name}”? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/menu/items/${id}`);
      setMessage(`Deleted ${name}.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/categories"
          className="text-sm text-burgundy underline-offset-2 hover:underline"
        >
          ← All categories
        </Link>
        <h1 className="mt-3 font-display text-3xl text-charcoal">
          {category?.name ?? "Category"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {loading
            ? "Loading…"
            : `${items.length} ${items.length === 1 ? "dish" : "dishes"} in this category.`}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/admin/menu?categoryId=${categoryId}`}
          className="btn-primary"
        >
          Add dish here
        </Link>
        <button
          type="button"
          onClick={() => void load()}
          className="btn-secondary"
        >
          Refresh
        </button>
      </div>

      {message ? <p className="text-sm text-[#3d6b4f]">{message}</p> : null}
      {error ? (
        <p className="text-sm text-[#8b2e2e]" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-muted">Loading dishes…</p>
      ) : items.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface p-10 text-center">
          <p className="text-muted">No dishes in this category yet.</p>
          <Link
            href={`/admin/menu?categoryId=${categoryId}`}
            className="btn-primary mt-5"
          >
            Add first dish
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-soft)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-ivory-deep/60 text-xs tracking-wide uppercase">
              <tr>
                <th className="px-3 py-3">Dish</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-b border-border/70">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-ivory-deep">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted">
                          {item.isAvailable ? "Available" : "Unavailable"}
                          {item.imageUrl ? " · Photo" : " · No photo"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">{formatInr(item.price)}</td>
                  <td className="px-3 py-3 capitalize">{item.status}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/menu?edit=${item._id}`}
                        className="text-burgundy underline-offset-2 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(item._id, item.name)}
                        className="text-[#8b2e2e] underline-offset-2 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
