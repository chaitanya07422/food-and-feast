"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { DishCard } from "@/components/menu/dish-card";
import type { Category, MenuItem } from "@/lib/api";

type Props = {
  categories: Category[];
  items: MenuItem[];
  initialCategory?: string;
};

export function MenuBrowser({ categories, items, initialCategory }: Props) {
  const router = useRouter();
  const [category, setCategory] = useState(initialCategory ?? "");
  const [search, setSearch] = useState("");
  const [foodType, setFoodType] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (category) {
        const slug =
          typeof item.categoryId === "object"
            ? item.categoryId.slug
            : undefined;
        if (slug !== category) return false;
      }
      if (foodType && item.foodType !== foodType) return false;
      if (q && !item.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, category, search, foodType]);

  const selectCategory = (slug: string) => {
    setCategory(slug);
    const href = slug ? `/menu?category=${slug}` : "/menu";
    router.replace(href, { scroll: false });
  };

  const clear = () => {
    setCategory("");
    setSearch("");
    setFoodType("");
    router.replace("/menu", { scroll: false });
  };

  const hasFilters = Boolean(category || search || foodType);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <label className="block w-full max-w-md">
          <span className="sr-only">Search dishes</span>
          <span className="relative block">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
              size={18}
              aria-hidden
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes by name"
              className="w-full rounded-[var(--radius-md)] border border-border bg-surface py-3 pr-3 pl-11 text-sm shadow-[var(--shadow-soft)]"
            />
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          <select
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
            className="rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2.5 text-sm"
            aria-label="Filter by food type"
          >
            <option value="">All types</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="non_vegetarian">Non-vegetarian</option>
          </select>
          {hasFilters ? (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2.5 text-sm"
            >
              <X size={14} aria-hidden /> Clear
            </button>
          ) : null}
        </div>
      </div>

      <nav
        className="-mx-4 border-y border-border bg-surface/60 px-4 sm:mx-0 sm:rounded-[var(--radius-lg)] sm:border sm:px-2"
        aria-label="Menu categories"
      >
        <div className="flex gap-1 overflow-x-auto py-2 scrollbar-thin">
          <button
            type="button"
            aria-pressed={!category}
            onClick={() => selectCategory("")}
            className={`relative shrink-0 px-3.5 py-2.5 text-sm whitespace-nowrap transition ${
              !category
                ? "font-semibold text-burgundy"
                : "text-charcoal/70 hover:text-burgundy"
            }`}
          >
            All
            {!category ? (
              <span
                className="absolute inset-x-3 bottom-1 h-0.5 bg-burgundy"
                aria-hidden
              />
            ) : null}
          </button>
          {categories.map((cat) => {
            const active = category === cat.slug;
            return (
              <button
                key={cat._id}
                type="button"
                aria-pressed={active}
                onClick={() => selectCategory(cat.slug)}
                className={`relative shrink-0 px-3.5 py-2.5 text-sm whitespace-nowrap transition ${
                  active
                    ? "font-semibold text-burgundy"
                    : "text-charcoal/70 hover:text-burgundy"
                }`}
              >
                {cat.name}
                {active ? (
                  <span
                    className="absolute inset-x-3 bottom-1 h-0.5 bg-burgundy"
                    aria-hidden
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>

      <p className="text-sm text-muted">
        {filtered.length} {filtered.length === 1 ? "dish" : "dishes"}
        {category
          ? ` in ${categories.find((c) => c.slug === category)?.name ?? "category"}`
          : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface px-6 py-14 text-center">
          <p className="text-muted">No dishes match your filters.</p>
          <button
            type="button"
            onClick={clear}
            className="btn-secondary mt-5"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <DishCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
