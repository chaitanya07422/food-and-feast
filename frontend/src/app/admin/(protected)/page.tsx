"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ExternalLink,
  FolderOpen,
  ImagePlus,
  LayoutGrid,
  Plus,
  Tags,
  UtensilsCrossed,
  Clapperboard,
  FileWarning,
  Ban,
  CheckCircle2,
} from "lucide-react";
import {
  AdminAlert,
  AdminEmptyState,
  AdminPageHeader,
  DishThumb,
  StatusBadge,
} from "@/components/admin/ui";
import { api, formatInr, type MenuItem } from "@/lib/api";

type Stats = {
  totalItems: number;
  published: number;
  unavailable: number;
  unpublished: number;
  totalCategories: number;
  recent: MenuItem[];
};

const quickActions = [
  { href: "/admin/menu", label: "Add dish", icon: Plus, primary: true },
  { href: "/admin/menu", label: "Manage menu", icon: UtensilsCrossed },
  { href: "/admin/categories", label: "Manage categories", icon: Tags },
  { href: "/admin/gallery", label: "Upload gallery photos", icon: ImagePlus },
  { href: "/admin/hero", label: "Manage homepage slides", icon: Clapperboard },
  {
    href: "/",
    label: "Preview website",
    icon: ExternalLink,
    external: true,
  },
] as const;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Stats>("/admin/dashboard")
      .then(setStats)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        {
          label: "Total dishes",
          value: stats.totalItems,
          icon: LayoutGrid,
          href: "/admin/menu",
          hint: "All menu items",
        },
        {
          label: "Published",
          value: stats.published,
          icon: CheckCircle2,
          href: "/admin/menu",
          hint: "Visible on site",
        },
        {
          label: "Unavailable",
          value: stats.unavailable,
          icon: Ban,
          href: "/admin/menu",
          hint: "Marked unavailable",
        },
        {
          label: "Drafts",
          value: stats.unpublished,
          icon: FileWarning,
          href: "/admin/menu",
          hint: "Not published",
        },
        {
          label: "Categories",
          value: stats.totalCategories,
          icon: FolderOpen,
          href: "/admin/categories",
          hint: "Menu sections",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Overview"
        title="Welcome back"
        description="Monitor menu content, update dishes, and keep the public site in sync."
        actions={
          <>
            <Link href="/admin/menu" className="btn-primary gap-1.5 !py-2.5">
              <Plus size={16} aria-hidden />
              Add dish
            </Link>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary gap-1.5 !py-2.5"
            >
              <ExternalLink size={15} aria-hidden />
              Preview website
            </Link>
          </>
        }
      />

      {error ? <AdminAlert tone="error">{error}</AdminAlert> : null}
      {loading ? (
        <p className="text-sm text-muted">Loading dashboard…</p>
      ) : null}

      {stats ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  href={card.href}
                  className="admin-card admin-card-interactive block p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[0.65rem] tracking-[0.14em] text-muted uppercase">
                      {card.label}
                    </p>
                    <Icon
                      size={16}
                      className="text-gold"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </div>
                  <p className="mt-2 font-display text-3xl leading-none text-burgundy">
                    {card.value}
                  </p>
                  <p className="mt-2 text-xs text-muted">{card.hint}</p>
                </Link>
              );
            })}
          </section>

          <section>
            <h2 className="font-display text-xl text-charcoal">Quick actions</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const className = `admin-card admin-card-interactive flex items-center gap-3 px-4 py-3.5 text-sm font-medium ${
                  "primary" in action && action.primary
                    ? "border-burgundy/25 text-burgundy"
                    : "text-charcoal"
                }`;
                if ("external" in action && action.external) {
                  return (
                    <li key={action.label}>
                      <a
                        href={action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={className}
                      >
                        <Icon size={17} className="text-gold" aria-hidden />
                        {action.label}
                      </a>
                    </li>
                  );
                }
                return (
                  <li key={action.label}>
                    <Link href={action.href} className={className}>
                      <Icon size={17} className="text-gold" aria-hidden />
                      {action.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl text-charcoal">
                  Recently updated
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Latest dishes from the menu, ordered by last change.
                </p>
              </div>
              <Link
                href="/admin/menu"
                className="shrink-0 text-sm font-medium text-burgundy underline-offset-2 hover:underline"
              >
                View all
              </Link>
            </div>

            {stats.recent.length === 0 ? (
              <div className="mt-4">
                <AdminEmptyState
                  title="No dishes yet"
                  description="Add your first dish to see it listed here."
                  action={
                    <Link href="/admin/menu" className="btn-primary">
                      Add dish
                    </Link>
                  }
                />
              </div>
            ) : (
              <ul className="admin-card mt-4 divide-y divide-border overflow-hidden">
                {stats.recent.map((item) => (
                  <li key={item._id}>
                    <Link
                      href={`/admin/menu?edit=${item._id}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-ivory/80"
                    >
                      <DishThumb src={item.imageUrl} alt="" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-charcoal">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted">
                          {formatInr(item.price)}
                        </p>
                      </div>
                      <StatusBadge
                        tone={
                          item.status === "published" ? "success" : "warning"
                        }
                      >
                        {item.status}
                      </StatusBadge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
