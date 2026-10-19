"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  AdminAlert,
  AdminEmptyState,
  AdminPageHeader,
  DishThumb,
  StatusBadge,
} from "@/components/admin/ui";
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
      <div className="text-sm text-muted">
        <Link
          href="/admin/categories"
          className="text-burgundy underline-offset-2 hover:underline"
        >
          Categories
        </Link>
        <span className="mx-1.5 text-border">/</span>
        <span className="text-charcoal">{category?.name ?? "…"}</span>
      </div>

      <AdminPageHeader
        title={category?.name ?? "Category"}
        description={
          loading
            ? "Loading…"
            : `${items.length} ${items.length === 1 ? "dish" : "dishes"} in this category.`
        }
        actions={
          <Link
            href={`/admin/menu?categoryId=${categoryId}`}
            className="btn-primary gap-1.5 !py-2.5"
          >
            <Plus size={16} aria-hidden />
            Add dish here
          </Link>
        }
      />

      {message ? <AdminAlert tone="success">{message}</AdminAlert> : null}
      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}

      {loading ? (
        <p className="text-sm text-muted">Loading dishes…</p>
      ) : items.length === 0 ? (
        <AdminEmptyState
          title="No dishes in this category yet"
          description="Add the first dish to populate this section of the menu."
          action={
            <Link
              href={`/admin/menu?categoryId=${categoryId}`}
              className="btn-primary"
            >
              Add first dish
            </Link>
          }
        />
      ) : (
        <>
          <div className="admin-table-wrap hidden md:block">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <DishThumb src={item.imageUrl} />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted">
                            {item.isAvailable ? "Available" : "Unavailable"}
                            {item.imageUrl ? " · Photo" : " · No photo"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap font-medium">
                      {formatInr(item.price)}
                    </td>
                    <td>
                      <StatusBadge
                        tone={
                          item.status === "published" ? "success" : "warning"
                        }
                      >
                        {item.status}
                      </StatusBadge>
                    </td>
                    <td>
                      <div className="flex gap-3">
                        <Link
                          href={`/admin/menu?edit=${item._id}`}
                          className="text-sm font-medium text-burgundy underline-offset-2 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDelete(item._id, item.name)}
                          className="text-sm font-medium text-[var(--ff-danger)] underline-offset-2 hover:underline"
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

          <ul className="space-y-3 md:hidden">
            {items.map((item) => (
              <li key={item._id} className="admin-card p-3.5">
                <div className="flex gap-3">
                  <DishThumb src={item.imageUrl} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted">
                      {formatInr(item.price)}
                    </p>
                    <div className="mt-2">
                      <StatusBadge
                        tone={
                          item.status === "published" ? "success" : "warning"
                        }
                      >
                        {item.status}
                      </StatusBadge>
                    </div>
                    <div className="mt-3 flex gap-3 text-sm">
                      <Link
                        href={`/admin/menu?edit=${item._id}`}
                        className="font-medium text-burgundy"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(item._id, item.name)}
                        className="font-medium text-[var(--ff-danger)]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
