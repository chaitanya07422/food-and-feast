"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RotateCcw, Search } from "lucide-react";
import {
  AdminAlert,
  AdminEmptyState,
  AdminPageHeader,
  DishThumb,
  Field,
  StatusBadge,
} from "@/components/admin/ui";
import {
  api,
  categoryName,
  formatInr,
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

function foodTypeLabel(t: MenuItem["foodType"]) {
  if (t === "vegetarian") return "Veg";
  if (t === "non_vegetarian") return "Non-veg";
  return "—";
}

function AdminMenuInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("categoryId") ?? "";
  const editFromUrl = searchParams.get("edit") ?? "";

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [available, setAvailable] = useState("");
  const [foodType, setFoodType] = useState("");
  const [categoryId, setCategoryId] = useState(categoryFromUrl);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [showForm, setShowForm] = useState(Boolean(editFromUrl || categoryFromUrl));
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setCategoryId(categoryFromUrl);
  }, [categoryFromUrl]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (status) params.set("status", status);
      if (categoryId) params.set("categoryId", categoryId);
      if (available) params.set("available", available);
      const q = params.toString() ? `?${params}` : "";
      const [list, cats] = await Promise.all([
        api.get<MenuItem[]>(`/admin/menu/items${q}`),
        api.get<Category[]>("/admin/menu/categories"),
      ]);
      const filtered = foodType
        ? list.filter((item) => item.foodType === foodType)
        : list;
      setItems(filtered);
      setCategories(cats);
      setForm((prev) =>
        prev.categoryId || prev._id
          ? prev
          : emptyForm(categoryFromUrl || cats[0]?._id || ""),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, [search, status, categoryId, available, foodType, categoryFromUrl]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    if (!editFromUrl) return;
    (async () => {
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
        setShowForm(true);
        setDirty(false);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load dish to edit",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editFromUrl]);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const editing = Boolean(form._id);
  const previewSrc = localPreview || form.imageUrl || null;
  const hasFilters = Boolean(
    search || status || categoryId || available || foodType,
  );

  function updateForm(patch: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  }

  function resetForm(nextCategoryId?: string) {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setPendingFile(null);
    setForm(
      emptyForm(nextCategoryId ?? (categoryId || categories[0]?._id || "")),
    );
    setDirty(false);
  }

  function startAdd() {
    resetForm(categoryId || categories[0]?._id || "");
    setShowForm(true);
    setMessage(null);
    router.replace(
      categoryId ? `/admin/menu?categoryId=${categoryId}` : "/admin/menu",
      { scroll: false },
    );
    window.setTimeout(() => {
      document.getElementById("dish-form")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  function startEdit(item: MenuItem) {
    const catId =
      typeof item.categoryId === "object"
        ? item.categoryId._id
        : item.categoryId;
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setPendingFile(null);
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
    setShowForm(true);
    setDirty(false);
    setMessage(null);
    router.replace(`/admin/menu?edit=${item._id}`, { scroll: false });
    window.setTimeout(() => {
      document.getElementById("dish-form")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
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
      setDirty(true);
      if (!form.imageAlt.trim()) {
        updateForm({ imageAlt: form.name || file.name });
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
      setDirty(false);
      resetForm(form.categoryId);
      setShowForm(false);
      router.replace("/admin/menu", { scroll: false });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string, name: string) {
    if (!confirm(`Delete “${name}”? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/menu/items/${id}`);
      setMessage(`Deleted ${name}.`);
      if (form._id === id) {
        resetForm(categoryId || categories[0]?._id || "");
        setShowForm(false);
        router.replace("/admin/menu", { scroll: false });
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function clearFilters() {
    setSearch("");
    setStatus("");
    setAvailable("");
    setFoodType("");
    setCategoryId("");
    router.replace("/admin/menu", { scroll: false });
  }

  function clearImage() {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setPendingFile(null);
    updateForm({ imageUrl: "", imageAlt: "" });
  }

  const activeCategoryName = useMemo(
    () => categories.find((c) => c._id === categoryId)?.name,
    [categories, categoryId],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Menu"
        title={activeCategoryName ? `Menu · ${activeCategoryName}` : "Menu items"}
        description="Search, filter, and edit dishes. Prices are stored in INR."
        actions={
          <button type="button" onClick={startAdd} className="btn-primary gap-1.5 !py-2.5">
            <Plus size={16} aria-hidden />
            Add dish
          </button>
        }
      />

      {message ? <AdminAlert tone="success">{message}</AdminAlert> : null}
      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}

      {/* Toolbar */}
      <div className="admin-card flex flex-col gap-3 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">Search dishes</span>
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name"
              className="admin-input !pl-9"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="admin-input !w-auto min-w-[9rem]"
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="admin-input !w-auto"
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <select
              value={available}
              onChange={(e) => setAvailable(e.target.value)}
              className="admin-input !w-auto"
              aria-label="Filter by availability"
            >
              <option value="">All availability</option>
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
            <select
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="admin-input !w-auto"
              aria-label="Filter by food type"
            >
              <option value="">All types</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="non_vegetarian">Non-vegetarian</option>
              <option value="unspecified">Unspecified</option>
            </select>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="btn-secondary gap-1.5 !py-2.5"
              >
                <RotateCcw size={14} aria-hidden />
                Reset
              </button>
            ) : null}
          </div>
        </div>
        <p className="text-xs text-muted">
          {loading ? "Loading…" : `${items.length} dish${items.length === 1 ? "" : "es"}`}
        </p>
      </div>

      {/* Form */}
      {showForm ? (
        <form
          id="dish-form"
          onSubmit={onSubmit}
          className="admin-card space-y-6 p-4 sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl">
              {editing ? "Edit dish" : "Add dish"}
            </h2>
            <button
              type="button"
              className="text-sm text-muted underline-offset-2 hover:underline"
              onClick={() => {
                if (dirty && !confirm("Discard unsaved changes?")) return;
                resetForm(categoryId || categories[0]?._id || "");
                setShowForm(false);
                router.replace("/admin/menu", { scroll: false });
              }}
            >
              Close
            </button>
          </div>

          <section className="space-y-4">
            <h3 className="text-[0.65rem] tracking-[0.16em] text-gold uppercase">
              Basic information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Dish name" htmlFor="dish-name" required>
                <input
                  id="dish-name"
                  required
                  value={form.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                  className="admin-input"
                />
              </Field>
              <Field label="Category" htmlFor="dish-category" required>
                <select
                  id="dish-category"
                  required
                  value={form.categoryId}
                  onChange={(e) => updateForm({ categoryId: e.target.value })}
                  className="admin-input"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description" htmlFor="dish-desc">
                  <textarea
                    id="dish-desc"
                    value={form.description}
                    onChange={(e) => updateForm({ description: e.target.value })}
                    rows={2}
                    className="admin-input"
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-border pt-5">
            <h3 className="text-[0.65rem] tracking-[0.16em] text-gold uppercase">
              Pricing & classification
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Price (INR)" htmlFor="dish-price" required>
                <input
                  id="dish-price"
                  required
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={form.price}
                  onChange={(e) => updateForm({ price: e.target.value })}
                  className="admin-input"
                />
              </Field>
              <Field label="Food type" htmlFor="dish-food-type">
                <select
                  id="dish-food-type"
                  value={form.foodType}
                  onChange={(e) =>
                    updateForm({
                      foodType: e.target.value as MenuItem["foodType"],
                    })
                  }
                  className="admin-input"
                >
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non_vegetarian">Non-vegetarian</option>
                  <option value="unspecified">Unspecified</option>
                </select>
              </Field>
            </div>
          </section>

          <section className="space-y-4 border-t border-border pt-5">
            <h3 className="text-[0.65rem] tracking-[0.16em] text-gold uppercase">
              Dish photography
            </h3>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative aspect-[4/3] w-full max-w-[14rem] overflow-hidden rounded-[var(--radius-lg)] border border-dashed border-border bg-ivory">
                {previewSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewSrc}
                    alt={form.imageAlt || form.name || "Dish preview"}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center px-3 text-center text-xs text-muted">
                    Landscape preview (4:3)
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <Field
                  label="Upload landscape image"
                  htmlFor="dish-image"
                  help="Horizontal photos only (wider than tall). JPEG, PNG, WebP, or GIF up to 5MB."
                >
                  <input
                    id="dish-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-burgundy file:px-3 file:py-2 file:text-sm file:font-medium file:text-ivory"
                  />
                </Field>
                <Field label="Image description (alt text)" htmlFor="dish-alt">
                  <input
                    id="dish-alt"
                    value={form.imageAlt}
                    onChange={(e) => updateForm({ imageAlt: e.target.value })}
                    placeholder="e.g. Butter chicken served in a copper bowl"
                    className="admin-input"
                  />
                </Field>
                {(previewSrc || pendingFile) && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="text-sm text-[var(--ff-danger)] underline-offset-2 hover:underline"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-border pt-5">
            <h3 className="text-[0.65rem] tracking-[0.16em] text-gold uppercase">
              Publication
            </h3>
            <div className="flex flex-wrap gap-5 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) => updateForm({ isAvailable: e.target.checked })}
                />
                Available
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => updateForm({ isFeatured: e.target.checked })}
                />
                Featured on homepage
              </label>
              <label className="inline-flex items-center gap-2">
                Status
                <select
                  value={form.status}
                  onChange={(e) =>
                    updateForm({
                      status: e.target.value as MenuItem["status"],
                    })
                  }
                  className="admin-input !w-auto"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
            </div>
          </section>

          <div className="flex flex-wrap gap-2 border-t border-border pt-5">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving…" : editing ? "Save changes" : "Add dish"}
            </button>
            {editing ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  if (dirty && !confirm("Discard unsaved changes?")) return;
                  resetForm(form.categoryId);
                  setShowForm(false);
                  router.replace("/admin/menu", { scroll: false });
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      {/* List */}
      {loading ? (
        <p className="text-sm text-muted">Loading dishes…</p>
      ) : items.length === 0 ? (
        <AdminEmptyState
          title="No dishes match your filters"
          description="Try clearing filters or add a new dish."
          action={
            <button type="button" onClick={startAdd} className="btn-primary">
              Add dish
            </button>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="admin-table-wrap hidden md:block">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Type</th>
                  <th>Availability</th>
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
                        <div className="min-w-0">
                          <p className="truncate font-medium">{item.name}</p>
                          {item.isFeatured ? (
                            <p className="text-[0.65rem] text-gold">Featured</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="text-muted">{categoryName(item)}</td>
                    <td className="whitespace-nowrap font-medium">
                      {formatInr(item.price)}
                    </td>
                    <td className="text-muted">{foodTypeLabel(item.foodType)}</td>
                    <td>
                      <StatusBadge tone={item.isAvailable ? "success" : "danger"}>
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </StatusBadge>
                    </td>
                    <td>
                      <StatusBadge
                        tone={item.status === "published" ? "success" : "warning"}
                      >
                        {item.status}
                      </StatusBadge>
                    </td>
                    <td>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="text-sm font-medium text-burgundy underline-offset-2 hover:underline"
                        >
                          Edit
                        </button>
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

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {items.map((item) => (
              <li key={item._id} className="admin-card p-3.5">
                <div className="flex gap-3">
                  <DishThumb src={item.imageUrl} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted">
                      {categoryName(item)} · {formatInr(item.price)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <StatusBadge
                        tone={item.status === "published" ? "success" : "warning"}
                      >
                        {item.status}
                      </StatusBadge>
                      <StatusBadge tone={item.isAvailable ? "success" : "danger"}>
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </StatusBadge>
                    </div>
                    <div className="mt-3 flex gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="font-medium text-burgundy"
                      >
                        Edit
                      </button>
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

export default function AdminMenuPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading menu…</p>}>
      <AdminMenuInner />
    </Suspense>
  );
}
