"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
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

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-ivory/95 backdrop-blur-[6px]">
      <div className="mx-auto flex h-[4.25rem] max-w-[var(--content-max)] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0 shrink">
          <span className="font-display text-[1.65rem] leading-none text-burgundy sm:text-[1.85rem]">
            {SITE.name}
          </span>
          <span className="mt-1 hidden text-[0.65rem] tracking-[0.2em] text-muted uppercase sm:block">
            {SITE.tagline}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {SITE.nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-2 text-[0.8125rem] tracking-[0.04em] transition-colors ${
                  active
                    ? "font-semibold text-burgundy"
                    : "text-charcoal/75 hover:text-burgundy"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
                {active ? (
                  <span
                    className="absolute inset-x-3 -bottom-0.5 h-px bg-burgundy/70"
                    aria-hidden
                  />
                ) : null}
              </Link>
            );
          })}
          <Link href="/menu" className="btn-primary ml-3 !py-2 !text-[0.8125rem]">
            Explore Menu
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-border text-charcoal lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-border bg-surface px-4 py-5 lg:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col">
            {SITE.nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block border-b border-border/70 py-3.5 text-base ${
                      active ? "font-semibold text-burgundy" : "text-charcoal"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/menu"
            className="btn-primary mt-5 w-full"
            onClick={() => setOpen(false)}
          >
            Explore Menu
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
