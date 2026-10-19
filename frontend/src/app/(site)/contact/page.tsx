import type { Metadata } from "next";
import { api, type RestaurantSettings } from "@/lib/api";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Address, phone and directions for Food & Feast in Old Gajuwaka.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  let settings: RestaurantSettings | null = null;
  try {
    settings = await api.get<RestaurantSettings>("/restaurant/settings");
  } catch {
    settings = null;
  }

  const address =
    settings?.address ||
    "Old Gajuwaka 60 Feet Road, opposite Federal Bank, near Vantillu Junction";
  const phone = settings?.phone || "8919957635";
  const mapsQuery = encodeURIComponent(address);

  return (
    <div className="mx-auto max-w-[var(--content-max)] px-4 py-[var(--space-section)] sm:px-6 lg:px-8">
      <p className="section-eyebrow">Contact</p>
      <h1 className="section-title">Find us</h1>
      <p className="section-lede">
        Call ahead or use directions to reach the restaurant in Old Gajuwaka.
      </p>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-7 shadow-[var(--shadow-soft)] sm:p-9">
          <h2 className="font-display text-3xl text-charcoal">
            {settings?.name ?? "Food & Feast"}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted">{address}</p>
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="mt-6 inline-block text-xl font-medium text-burgundy"
          >
            {phone.replace(/(\d{5})(\d+)/, "$1 $2")}
          </a>
          <p className="mt-2 text-sm text-muted">Also: 7780 743264</p>

          <div className="mt-8 border-t border-border pt-6">
            <p className="text-[0.7rem] tracking-[0.18em] text-gold uppercase">
              Opening hours
            </p>
            <p className="mt-3 text-sm text-muted">
              Opening hours will be listed here once confirmed by the
              restaurant. They are not printed on the current menu.
            </p>
          </div>

          <a
            href={SITE.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-8"
          >
            Get directions
          </a>
        </div>

        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-ivory-deep shadow-[var(--shadow-soft)]">
          <iframe
            title="Map directions to Food & Feast"
            src={`https://maps.google.com/maps?q=${mapsQuery}&z=15&output=embed`}
            className="h-full min-h-[22rem] w-full border-0 lg:min-h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
