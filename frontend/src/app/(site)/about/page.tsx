import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Food & Feast Multicuisine Restaurant in Old Gajuwaka — Indian, Chinese, Tandoori and Kshatriya dining.",
};

export const dynamic = "force-dynamic";

type GalleryImage = { _id: string; imageUrl: string; imageAlt?: string };

export default async function AboutPage() {
  let photo: string | undefined;
  try {
    const gallery = await api.get<GalleryImage[]>("/gallery");
    photo = gallery[1]?.imageUrl || gallery[0]?.imageUrl;
  } catch {
    photo = undefined;
  }

  return (
    <div className="mx-auto max-w-[var(--content-max)] px-4 py-[var(--space-section)] sm:px-6 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="section-eyebrow">About</p>
          <h1 className="section-title">About {SITE.name}</h1>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-muted">
            <p>
              {SITE.name} is a multicuisine restaurant in Old Gajuwaka — one
              place for endless flavours across Indian, Chinese, Tandoori and
              Kshatriya kitchens.
            </p>
            <p>
              Guests come for generous portions, a welcoming dining room, and a
              menu that ranges from soups and starters to biryanis, curries and
              fresh breads.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/menu" className="btn-primary">
              Explore Menu
            </Link>
            <Link href="/contact" className="btn-secondary">
              Location & contact
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-ivory-deep shadow-[var(--shadow-soft)] sm:aspect-[4/3] lg:aspect-[4/5]">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt="Inside Food & Feast restaurant"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              Restaurant photograph coming soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
