import Link from "next/link";
import { SITE } from "@/lib/site";

type FooterProps = {
  address?: string;
  phone?: string;
};

export function SiteFooter({ address, phone }: FooterProps) {
  const year = new Date().getFullYear();
  const resolvedAddress =
    address ||
    "Old Gajuwaka 60 Feet Road, opposite Federal Bank, near Vantillu Junction";
  const resolvedPhone = phone || "8919957635";

  return (
    <footer className="mt-auto border-t border-burgundy-deep/20 bg-burgundy-deep text-ivory">
      <div className="mx-auto grid max-w-[var(--content-max)] gap-10 px-4 py-14 sm:px-6 md:grid-cols-12 lg:px-8 lg:gap-12">
        <div className="md:col-span-5">
          <p className="font-display text-3xl">{SITE.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ivory/70">
            {SITE.tagline}. Indian · Chinese · Tandoori · Kshatriya specialities
            in Old Gajuwaka.
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="text-[0.65rem] tracking-[0.22em] text-gold-soft uppercase">
            Explore
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-ivory/85">
            {SITE.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition hover:text-gold-soft"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <p className="text-[0.65rem] tracking-[0.22em] text-gold-soft uppercase">
            Visit
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ivory/75">
            {resolvedAddress}
          </p>
          <a
            href={`tel:${resolvedPhone.replace(/\s/g, "")}`}
            className="mt-3 inline-block text-sm text-gold-soft transition hover:text-ivory"
          >
            {resolvedPhone.replace(/(\d{5})(\d+)/, "$1 $2")}
          </a>
          <p className="mt-1 text-sm text-ivory/60">Also: 7780 743264</p>
          <a
            href={SITE.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block text-sm text-gold-soft underline-offset-4 transition hover:underline"
          >
            Get directions
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-ivory/50 sm:px-6">
        © {year} {SITE.name}. All rights reserved.
      </div>
    </footer>
  );
}
