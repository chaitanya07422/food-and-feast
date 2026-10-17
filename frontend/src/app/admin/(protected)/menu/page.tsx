"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  api,
  type Category,
  type MenuItem,
} from "@/lib/api";

type FormState = {
  _id?: string;
  name: string;
  price: string;
  categoryId: string;
  description: string;
  foodType: MenuItem["foodType"];
  status: MenuItem["status"];
  isAvailable: boolean;
  isFeatured: boolean;
  imageUrl: string;
  imageAlt: string;
};

const emptyForm = (categoryId = ""): FormState => ({
  name: "",
  price: "",
  categoryId,
  description: "",
  foodType: "unspecified",
  status: "published",
  isAvailable: true,
  isFeatured: false,
  imageUrl: "",
  imageAlt: "",
});

export default function AdminMenuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("categoryId") ?? "";
  const editFromUrl = searchParams.get("edit") ?? "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const activeCategoryName = useMemo(() => {
    const id = form.categoryId || categoryFromUrl;
    if (!id) return null;
    return categories.find((c) => c._id === id)?.name ?? null;
  }, [categories, form.categoryId, categoryFromUrl]);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cats = await api.get<Category[]>("/admin/menu/categories");
      setCategories(cats);
      return cats;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
      return [] as Category[];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cats = await loadCategories();
      if (cancelled) return;

      if (editFromUrl) {
        try {
          const item = await api.get<MenuItem>(
            `/admin/menu/items/${editFromUrl}`,
          );
          if (cancelled) return;
          const catId =
            typeof item.categoryId === "object"
              ? item.categoryId._id
              : item.categoryId;
          setForm({
            _id: item._id,
            name: item.name,
            price: String(item.price),
            categoryId: catId,
            description: item.description ?? "",
            foodType: item.foodType,
            status: item.status,
            isAvailable: item.isAvailable,
            isFeatured: item.isFeatured,
            imageUrl: item.imageUrl ?? "",
            imageAlt: item.imageAlt ?? "",
          });
        } catch (err) {
          if (!cancelled) {
            setError(
              err instanceof Error ? err.message : "Could not load dish to edit",
            );
            setForm(emptyForm(categoryFromUrl || cats[0]?._id || ""));
          }
        }
        return;
      }

      setForm(emptyForm(categoryFromUrl || cats[0]?._id || ""));
    })();
    return () => {
      cancelled = true;
    };
  }, [loadCategories, editFromUrl, categoryFromUrl]);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const editing = Boolean(form._id);
  const title = editing ? "Edit dish" : "Add dish";
  const previewSrc = localPreview || form.imageUrl || null;

  function resetForm(nextCategoryId?: string) {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setPendingFile(null);
    setForm(
      emptyForm(
        nextCategoryId ?? categoryFromUrl ?? categories[0]?._id ?? "",
      ),
    );
  }

  function onPickImage(file: File | null) {
    if (localPreview) URL.revokeObjectURL(localPreview);
    if (!file) {
      setPendingFile(null);
      setLocalPreview(null);
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError("Use a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const probe = new Image();
    probe.onload = () => {
      if (probe.height > probe.width) {
        URL.revokeObjectURL(objectUrl);
        setPendingFile(null);
        setLocalPreview(null);
        setError(
          "Please upload a landscape (horizontal) photo — width must be greater than height.",
        );
        return;
      }
      setError(null);
      setPendingFile(file);
      setLocalPreview(objectUrl);
      if (!form.imageAlt.trim()) {
        setForm((prev) => ({ ...prev, imageAlt: prev.name || file.name }));
      }
    };
    probe.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setError("Could not read that image. Try another file.");
    };
    probe.src = objectUrl;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setSaving(true);
    try {
      let imageUrl = form.imageUrl;
      if (pendingFile) {
        const uploaded = await api.uploadImage(pendingFile);
        imageUrl = uploaded.url;
      }

      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        categoryId: form.categoryId,
        description: form.description.trim() || undefined,
        foodType: form.foodType,
        status: form.status,
        isAvailable: form.isAvailable,
        isFeatured: form.isFeatured,
        imageUrl: imageUrl || "",
        imageAlt: form.imageAlt.trim() || form.name.trim(),
      };

      if (form._id) {
        await api.patch(`/admin/menu/items/${form._id}`, payload);
        setMessage("Dish updated.");
      } else {
        await api.post("/admin/menu/items", payload);
        setMessage("Dish created.");
      }

      // Return to the category dish list after save
      router.push(`/admin/categories/${form.categoryId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function clearImage() {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setPendingFile(null);
    setForm((prev) => ({ ...prev, imageUrl: "", imageAlt: "" }));
  }

  if (loading && categories.length === 0) {
    return <p className="text-muted">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">
          {editing ? "Edit dish" : "Add dish"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {activeCategoryName ? (
            <>
              Category: <strong>{activeCategoryName}</strong>. Dish lists live
              under{" "}
              <Link
                href={
                  form.categoryId
                    ? `/admin/categories/${form.categoryId}`
                    : "/admin/categories"
                }
                className="text-burgundy underline-offset-2 hover:underline"
              >
                Categories
              </Link>
              .
            </>
          ) : (
            <>
              Add or edit a dish, then browse lists by category. JPEG, PNG,
              WebP, or GIF up to 5MB.
            </>
          )}
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)] sm:p-6"
      >
        <h2 className="font-display text-2xl">{title}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Dish name *
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-ivory px-3 py-2 text-charcoal"
            />
          </label>
          <label className="block text-sm">
            Price (INR) *
            <input
              required
              type="number"
              min={0}
              step="1"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-ivory px-3 py-2 text-charcoal"
            />
          </label>
          <label className="block text-sm">
            Category *
            <select
              required
              value={form.categoryId}
              onChange={(e) =>
                setForm({ ...form, categoryId: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-border bg-ivory px-3 py-2 text-charcoal"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Food type
            <select
              value={form.foodType}
              onChange={(e) =>
                setForm({
                  ...form,
                  foodType: e.target.value as MenuItem["foodType"],
                })
              }
              className="mt-1 w-full rounded-md border border-border bg-ivory px-3 py-2 text-charcoal"
            >
              <option value="vegetarian">Vegetarian</option>
              <option value="non_vegetarian">Non-vegetarian</option>
              <option value="unspecified">Unspecified</option>
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            Description
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
              className="mt-1 w-full rounded-md border border-border bg-ivory px-3 py-2 text-charcoal"
            />
          </label>

          <div className="sm:col-span-2">
            <p className="text-sm font-medium">Dish photo</p>
            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative aspect-[4/3] w-full max-w-[16rem] overflow-hidden rounded-lg border border-dashed border-border bg-ivory">
                {previewSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewSrc}
                    alt={form.imageAlt || form.name || "Dish preview"}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center px-3 text-center text-xs text-muted">
                    Landscape preview (4:3)
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <label className="block text-sm">
                  Upload landscape image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) =>
                      onPickImage(e.target.files?.[0] ?? null)
                    }
                    className="mt-1 block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-burgundy file:px-3 file:py-2 file:text-sm file:font-medium file:text-ivory"
                  />
                </label>
                <p className="text-xs text-muted">
                  Horizontal photos only (wider than tall). All dishes display
                  in the same 4:3 frame.
                </p>
                <label className="block text-sm">
                  Image description (alt text)
                  <input
                    value={form.imageAlt}
                    onChange={(e) =>
                      setForm({ ...form, imageAlt: e.target.value })
                    }
                    placeholder="e.g. Butter chicken served in a copper bowl"
                    className="mt-1 w-full rounded-md border border-border bg-ivory px-3 py-2 text-charcoal"
                  />
                </label>
                {(previewSrc || pendingFile) && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="text-sm text-[#8b2e2e] underline-offset-2 hover:underline"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) =>
                setForm({ ...form, isAvailable: e.target.checked })
              }
            />
            Available
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) =>
                setForm({ ...form, isFeatured: e.target.checked })
              }
            />
            Featured
          </label>
          <label className="inline-flex items-center gap-2">
            Status
            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as MenuItem["status"],
                })
              }
              className="rounded-md border border-border px-2 py-1"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-burgundy px-4 py-2 text-sm font-medium text-ivory disabled:opacity-60"
          >
            {saving
              ? "Saving…"
              : editing
                ? "Save changes"
                : "Add dish"}
          </button>
          {editing ? (
            <button
              type="button"
              onClick={() => {
                resetForm(form.categoryId);
                router.replace(
                  form.categoryId
                    ? `/admin/menu?categoryId=${form.categoryId}`
                    : "/admin/menu",
                );
              }}
              className="rounded-md border border-border px-4 py-2 text-sm"
            >
              Cancel edit
            </button>
          ) : null}
          {form.categoryId ? (
            <Link
              href={`/admin/categories/${form.categoryId}`}
              className="rounded-md border border-border px-4 py-2 text-sm"
            >
              View category list
            </Link>
          ) : null}
        </div>
        {message ? (
          <p className="text-sm text-[#3d6b4f]">{message}</p>
        ) : null}
        {error ? (
          <p className="text-sm text-[#8b2e2e]" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
