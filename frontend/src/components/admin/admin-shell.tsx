"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Images,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Settings,
  Tags,
  UtensilsCrossed,
  ExternalLink,
  X,
  Clapperboard,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/hero", label: "Hero", icon: Clapperboard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function logout() {
    await api.post("/admin/auth/logout");
    router.replace("/admin/login");
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-5">
        <p className="font-display text-xl leading-none text-burgundy">
          Food &amp; Feast
        </p>
        <p className="mt-1.5 text-[0.65rem] tracking-[0.16em] text-muted uppercase">
          Admin portal
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 p-3" aria-label="Admin">
        {nav.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-sm transition-[background-color,color,box-shadow] duration-[180ms] ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy ${
                active
                  ? "bg-burgundy font-medium text-ivory shadow-[0_4px_12px_rgba(107,30,42,0.22)]"
                  : "text-charcoal/80 hover:bg-ivory-deep hover:text-burgundy"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {active ? (
                <span
                  className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gold-soft"
                  aria-hidden
                />
              ) : null}
              <Icon
                size={17}
                strokeWidth={1.75}
                className={
                  active
                    ? "text-gold-soft"
                    : "text-muted transition-colors duration-[180ms] group-hover:text-burgundy"
                }
                aria-hidden
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-0.5 border-t border-border p-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-muted transition-colors hover:bg-ivory-deep hover:text-burgundy"
        >
          <ExternalLink size={16} strokeWidth={1.75} aria-hidden />
          View site
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-muted transition-colors hover:bg-ivory-deep hover:text-burgundy"
        >
          <LogOut size={16} strokeWidth={1.75} aria-hidden />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        <div>
          <p className="font-display text-lg text-burgundy">Food &amp; Feast</p>
          <p className="text-[0.6rem] tracking-[0.14em] text-muted uppercase">
            Admin
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-border"
          aria-expanded={open}
          aria-controls="admin-drawer"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          {open ? <X size={18} aria-hidden /> : <MenuIcon size={18} aria-hidden />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal>
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/40"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
          <aside
            id="admin-drawer"
            className="absolute inset-y-0 left-0 w-[min(18rem,88vw)] border-r border-border bg-surface shadow-[var(--shadow-card-hover)]"
          >
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="mx-auto flex max-w-[88rem] gap-0 lg:min-h-screen">
        <aside
          className="sticky top-0 hidden h-screen w-[var(--admin-sidebar)] shrink-0 border-r border-border bg-surface lg:block"
          aria-label="Admin sidebar"
        >
          {sidebar}
        </aside>
        <main className="admin-page min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
