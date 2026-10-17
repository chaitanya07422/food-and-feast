import type { Metadata } from "next";
import { MenuBrowser } from "@/components/menu/menu-browser";
import { api, type Category, type MenuItem } from "@/lib/api";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Digital menu for Food & Feast — Indian, Chinese, Tandoori and Kshatriya dishes with prices in INR.",
};

export const dynamic = "force-dynamic";

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  let categories: Category[] = [];
  let items: MenuItem[] = [];
  let error: string | null = null;

  try {
    [categories, items] = await Promise.all([
      api.get<Category[]>("/menu/categories"),
      api.get<MenuItem[]>("/menu/items"),
    ]);
  } catch {
    error =
      "Menu is temporarily unavailable. Please try again in a moment.";
  }

  return (
    <div className="mx-auto max-w-[var(--content-max)] px-4 py-[var(--space-section)] sm:px-6 lg:px-8">
      <p className="section-eyebrow">Digital menu</p>
      <h1 className="section-title">Our Menu</h1>
      <p className="section-lede">
        Prices in INR from the restaurant menu. Search by name or browse by
        category — vegetarian and non-vegetarian dishes are clearly marked when
        available.
      </p>

      <div className="mt-12">
        {error ? (
          <p className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface p-10 text-muted">
            {error}
          </p>
        ) : (
          <MenuBrowser
            categories={categories}
            items={items}
            initialCategory={params.category}
          />
        )}
      </div>
    </div>
  );
}
