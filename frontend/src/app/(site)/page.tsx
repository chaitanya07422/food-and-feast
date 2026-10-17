import Link from "next/link";
import {
  HeroSlideshow,
  type HeroSlide,
} from "@/components/home/hero-slideshow";
import { DishCard } from "@/components/menu/dish-card";
import { formatInr, api, type Category, type MenuItem, type RestaurantSettings } from "@/lib/api";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

type GalleryImage = {
  _id: string;
  title: string;
  imageUrl: string;
  imageAlt?: string;
};

export default async function HomePage() {
  let slides: HeroSlide[] = [];
  let categories: Category[] = [];
  let items: MenuItem[] = [];
  let gallery: GalleryImage[] = [];
  let settings: RestaurantSettings | null = null;

  try {
    [slides, categories, items, gallery, settings] = await Promise.all([
      api.get<HeroSlide[]>("/hero/slides"),
      api.get<Category[]>("/menu/categories"),
      api.get<MenuItem[]>("/menu/items"),
      api.get<GalleryImage[]>("/gallery"),
      api.get<RestaurantSettings>("/restaurant/settings"),
    ]);
  } catch {
    /* keep empty fallbacks */
  }

  const featured = items.filter((item) => item.isFeatured).slice(0, 4);
  const ambience = gallery[0]?.imageUrl;
  const visitPhotos = gallery.slice(0, 3);
  const discovery = categories.slice(0, 8);
  const address =
    settings?.address ||
    "Old Gajuwaka 60 Feet Road, opposite Federal Bank, near Vantillu Junction";
  const phone = settings?.phone || "8919957635";
  const mapsQuery = encodeURIComponent(address);

  return (
    <>
      <HeroSlideshow slides={slides} />

      {/* Introduction */}
      <section className="mx-auto grid max-w-[var(--content-max)] items-center gap-10 px-4 py-[var(--space-section)] sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <p className="section-eyebrow">Our restaurant</p>
          <h2 className="section-title">One place. Endless flavours.</h2>
          <p className="section-lede">
            {SITE.name} is a multicuisine restaurant in Old Gajuwaka, serving
            Indian, Chinese, Tandoori and Kshatriya specialities in a warm
            dining room made for sharing a meal.
          </p>
          <Link href="/about" className="btn-primary mt-8">
            About us
          </Link>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-ivory-deep shadow-[var(--shadow-soft)]">
          {ambience ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ambience}
              alt="Dining room at Food & Feast"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              Restaurant photograph coming soon
            </div>
          )}
        </div>
      </section>

      {/* Featured / menu CTA */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-[var(--content-max)] px-4 py-[var(--space-section)] sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-eyebrow">The menu</p>
              <h2 className="section-title">
                {featured.length ? "From the kitchen" : "Explore our digital menu"}
              </h2>
              <p className="section-lede">
                {featured.length
                  ? "Selected dishes from the published menu."
                  : "Browse soups, starters, tandoori, biryanis, curries, breads and more — with prices in INR."}
              </p>
            </div>
            <Link href="/menu" className="btn-secondary shrink-0 self-start sm:self-auto">
              Full menu
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {featured.map((item) => (
                <DishCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <div className="mt-10 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-ivory">
              <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                <div className="flex flex-col justify-center px-6 py-10 sm:px-10">
                  <p className="font-display text-3xl text-charcoal sm:text-4xl">
                    200+ dishes ready to browse
                  </p>
                  <p className="mt-3 max-w-md text-muted">
                    Search by name, filter by category, and see vegetarian and
                    non-vegetarian options clearly.
                  </p>
                  <Link href="/menu" className="btn-primary mt-8 w-fit">
                    Explore Menu
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-px bg-border">
                  {items.slice(0, 4).map((item) => (
                    <div
                      key={item._id}
                      className="relative aspect-square overflow-hidden bg-ivory-deep"
                    >
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/70 to-transparent px-3 pt-8 pb-3">
                        <p className="truncate text-sm text-ivory">{item.name}</p>
                        <p className="text-xs text-gold-soft">
                          {formatInr(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Cuisine / category discovery */}
      <section className="mx-auto max-w-[var(--content-max)] px-4 py-[var(--space-section)] sm:px-6 lg:px-8">
        <p className="section-eyebrow">Discover</p>
        <h2 className="section-title">Browse by category</h2>
        <p className="section-lede">
          Open any category from the published menu.
        </p>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {discovery.map((cat) => (
            <li key={cat._id}>
              <Link
                href={`/menu?category=${cat.slug}`}
                className="group flex h-full flex-col justify-between rounded-[var(--radius-lg)] border border-border bg-surface px-5 py-6 shadow-[var(--shadow-soft)] transition hover:border-burgundy/30 hover:bg-ivory"
              >
                <span className="font-display text-2xl text-charcoal transition group-hover:text-burgundy">
                  {cat.name}
                </span>
                <span className="mt-6 text-xs tracking-[0.16em] text-muted uppercase">
                  View dishes →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Gallery + visit */}
      <section className="border-t border-border bg-burgundy-deep text-ivory">
        <div className="mx-auto grid max-w-[var(--content-max)] gap-10 px-4 py-[var(--space-section)] sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8">
          <div>
            <p className="text-[0.7rem] tracking-[0.22em] text-gold-soft uppercase">
              The room
            </p>
            <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
              Visit Food &amp; Feast
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ivory/75">
              {address}
            </p>
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="mt-4 inline-block text-lg text-gold-soft"
            >
              {phone.replace(/(\d{5})(\d+)/, "$1 $2")}
            </a>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-[var(--radius-md)] bg-ivory px-5 py-3 text-sm font-semibold text-burgundy-deep transition hover:bg-gold-soft"
              >
                Get directions
              </a>
              <Link
                href="/gallery"
                className="inline-flex rounded-[var(--radius-md)] border border-ivory/40 px-5 py-3 text-sm font-medium text-ivory transition hover:bg-ivory/10"
              >
                View gallery
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {visitPhotos.length > 0 ? (
              visitPhotos.map((photo, i) => (
                <div
                  key={photo._id}
                  className={`relative overflow-hidden rounded-[var(--radius-lg)] ${
                    i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.imageUrl}
                    alt={photo.imageAlt || "Food & Feast restaurant"}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))
            ) : (
              <div className="col-span-2 flex aspect-[16/10] items-center justify-center rounded-[var(--radius-lg)] border border-white/15 text-sm text-ivory/60">
                Restaurant photographs coming soon
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
