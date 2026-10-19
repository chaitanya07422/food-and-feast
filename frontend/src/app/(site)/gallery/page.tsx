import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Interior and ambience photographs from Food & Feast.",
};

export const dynamic = "force-dynamic";

type GalleryImage = {
  _id: string;
  title: string;
  imageUrl: string;
  imageAlt?: string;
};

export default async function GalleryPage() {
  let images: GalleryImage[] = [];
  let error: string | null = null;

  try {
    images = await api.get<GalleryImage[]>("/gallery");
  } catch {
    error = "Gallery is temporarily unavailable.";
  }

  // Prefer a coherent lead: first image large, then alternating rhythm
  const lead = images[0];
  const rest = images.slice(1);

  return (
    <div className="mx-auto max-w-[var(--content-max)] px-4 py-[var(--space-section)] sm:px-6 lg:px-8">
      <p className="section-eyebrow">Gallery</p>
      <h1 className="section-title">Inside Food &amp; Feast</h1>
      <p className="section-lede">
        A look at the dining room, storefront, and moments from the restaurant.
      </p>

      <div className="mt-12">
        {error ? (
          <p className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface p-10 text-muted">
            {error}
          </p>
        ) : images.length === 0 ? (
          <p className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface p-10 text-muted">
            Restaurant photographs will appear here once published.
          </p>
        ) : (
          <div className="space-y-4">
            {lead ? (
              <div className="group/photo relative aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)] bg-ivory-deep shadow-[var(--shadow-soft)] transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:aspect-[21/9] motion-reduce:hover:translate-y-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lead.imageUrl}
                  alt={lead.imageAlt || "Food & Feast restaurant"}
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover/photo:scale-110 motion-reduce:transition-none motion-reduce:group-hover/photo:scale-100"
                  fetchPriority="high"
                />
                <div
                  className="absolute inset-0 bg-burgundy-deep/0 transition-colors duration-300 group-hover/photo:bg-burgundy-deep/20 motion-reduce:transition-none"
                  aria-hidden
                />
              </div>
            ) : null}
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((img, i) => (
                <li
                  key={img._id}
                  className={`group/photo relative overflow-hidden rounded-[var(--radius-lg)] bg-ivory-deep shadow-[var(--shadow-soft)] transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] motion-reduce:hover:translate-y-0 ${
                    i % 5 === 0 ? "sm:col-span-2 sm:aspect-[16/10]" : "aspect-[4/3]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.imageUrl}
                    alt={img.imageAlt || "Food & Feast restaurant"}
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover/photo:scale-110 motion-reduce:transition-none motion-reduce:group-hover/photo:scale-100"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0 bg-burgundy-deep/0 transition-colors duration-300 group-hover/photo:bg-burgundy-deep/20 motion-reduce:transition-none"
                    aria-hidden
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-14 flex flex-wrap gap-3">
        <Link href="/menu" className="btn-primary">
          Explore Menu
        </Link>
        <Link href="/contact" className="btn-secondary">
          Get directions
        </Link>
      </div>
    </div>
  );
}
