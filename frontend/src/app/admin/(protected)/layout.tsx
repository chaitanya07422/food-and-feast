"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RequireAuth } from "@/components/admin/require-auth";
import { api } from "@/lib/api";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/hero", label: "Hero" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await api.post("/admin/auth/logout");
    router.replace("/admin/login");
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-ivory">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:py-8">
          <aside className="w-full shrink-0 rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-soft)] lg:w-56">
            <p className="font-display text-xl text-burgundy">Admin</p>
            <p className="mt-1 text-xs text-muted">Food &amp; Feast</p>
            <nav
              className="mt-5 flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
              aria-label="Admin"
            >
              {links.map((link) => {
                const active =
                  link.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={
                      active
                        ? "shrink-0 rounded-[var(--radius-md)] bg-burgundy px-3 py-2 text-sm font-medium text-ivory"
                        : "shrink-0 rounded-[var(--radius-md)] px-3 py-2 text-sm text-charcoal hover:bg-ivory-deep"
                    }
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4 lg:block">
              <Link
                href="/"
                className="text-sm text-muted underline-offset-4 hover:text-burgundy hover:underline"
              >
                View site
              </Link>
              <button
                type="button"
                onClick={logout}
                className="text-sm text-muted underline-offset-4 hover:text-burgundy hover:underline lg:mt-3 lg:block"
              >
                Log out
              </button>
            </div>
          </aside>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}
