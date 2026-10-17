"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, formatInr, type MenuItem } from "@/lib/api";

type Stats = {
  totalItems: number;
  published: number;
  unavailable: number;
  unpublished: number;
  totalCategories: number;
  recent: MenuItem[];
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Stats>("/admin/dashboard")
      .then(setStats)
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) return <p className="text-[#8b2e2e]">{error}</p>;
  if (!stats) return <p className="text-muted">Loading dashboard…</p>;

  const cards = [
    { label: "Total dishes", value: stats.totalItems },
    { label: "Published", value: stats.published },
    { label: "Unavailable", value: stats.unavailable },
    { label: "Drafts", value: stats.unpublished },
    { label: "Categories", value: stats.totalCategories },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-charcoal">Dashboard</h1>
      <p className="mt-2 text-sm text-muted">
        Quick view of menu content. Manage dishes, gallery, and hero slides from
        the sidebar.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-soft)]"
          >
            <p className="text-[0.65rem] tracking-[0.16em] text-muted uppercase">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-3xl text-burgundy">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/menu" className="btn-primary">
          Manage menu
        </Link>
        <Link href="/admin/gallery" className="btn-secondary">
          Gallery
        </Link>
        <Link href="/admin/hero" className="btn-secondary">
          Hero slides
        </Link>
      </div>
      <section className="mt-10">
        <h2 className="font-display text-2xl">Recently updated</h2>
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
          {stats.recent.map((item) => (
            <li
              key={item._id}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <span className="truncate font-medium">{item.name}</span>
              <span className="shrink-0 text-muted">
                {formatInr(item.price)} · {item.status}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
