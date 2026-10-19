import Link from "next/link";
import {
  HeroSlideshow,
  type HeroSlide,
} from "@/components/home/hero-slideshow";
import { DishCard } from "@/components/menu/dish-card";
import {
  formatInr,
  api,
  type Category,
  type MenuItem,
  type RestaurantSettings,
} from "@/lib/api";
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
        <Link
          href="/gallery"
          className="group/photo relative aspect-[4/3] block overflow-hidden rounded-[var(--radius-lg)] bg-ivory-deep shadow-[var(--shadow-soft)] transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy motion-reduce:hover:translate-y-0"
        >
          {ambience ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ambience}
              alt="Dining room at Food & Feast"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover/photo:scale-110 motion-reduce:transition-none motion-reduce:group-hover/photo:scale-100"
            />
          ) : (
            <div
              className="h-full bg-[linear-gradient(145deg,#ebe2d4,#f6f0e6)]"
              aria-hidden
            />
          )}
          <div
            className="absolute inset-0 bg-burgundy-deep/0 transition-colors duration-300 group-hover/photo:bg-burgundy-deep/20 motion-reduce:transition-none"
            aria-hidden
          />
        </Link>
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
            <div className="group/cta mt-10 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-ivory shadow-[var(--shadow-soft)] transition-[box-shadow,border-color] duration-300 hover:border-burgundy/20 hover:shadow-[var(--shadow-card-hover)] motion-reduce:transition-none">
              <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                <div className="flex flex-col justify-center px-6 py-10 sm:px-10">
                  <p className="font-display text-3xl text-charcoal transition-colors duration-300 group-hover/cta:text-burgundy sm:text-4xl motion-reduce:transition-none">
                    200+ dishes ready to browse
                  </p>
                  <p className="mt-3 max-w-md text-muted">
                    Search by name, filter by category, and see vegetarian and
                    non-vegetarian options clearly.
                  </p>
                  <Link
                    href="/menu"
                    className="btn-primary mt-8 w-fit transition-[transform,background-color] duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
                  >
                    Explore Menu
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-px bg-border">
                  {items.slice(0, 4).map((item, i) => (
                    <Link
                      key={item._id}
                      href="/menu"
                      className="group/tile relative aspect-square overflow-hidden bg-[linear-gradient(155deg,#ebe2d4,#f6f0e6)] focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-burgundy"
                      style={{ transitionDelay: `${i * 40}ms` }}
                    >
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/tile:scale-110 motion-reduce:transition-none motion-reduce:group-hover/tile:scale-100"
                          loading="lazy"
                        />
                      ) : null}
                      <div
                        className="absolute inset-0 bg-burgundy-deep/0 transition-colors duration-300 group-hover/tile:bg-burgundy-deep/25 motion-reduce:transition-none"
                        aria-hidden
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/75 via-charcoal/35 to-transparent px-3 pt-10 pb-3 transition-[padding] duration-300 group-hover/tile:pb-4 motion-reduce:transition-none">
                        <p className="truncate text-sm text-ivory transition-transform duration-300 group-hover/tile:-translate-y-0.5 motion-reduce:group-hover/tile:translate-y-0">
                          {item.name}
                        </p>
                        <p className="text-xs text-gold-soft opacity-90 transition-opacity duration-300 group-hover/tile:opacity-100">
                          {formatInr(item.price)}
                        </p>
                      </div>
                    </Link>
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
                className="group flex h-full flex-col justify-between rounded-[var(--radius-lg)] border border-border bg-surface px-5 py-6 shadow-[var(--shadow-soft)] transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-burgundy/30 hover:bg-ivory hover:shadow-[var(--shadow-card-hover)] motion-reduce:hover:translate-y-0"
              >
                <span className="font-display text-2xl text-charcoal transition-colors duration-200 group-hover:text-burgundy">
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
                href={SITE.directionsUrl}
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
                <Link
                  key={photo._id}
                  href="/gallery"
                  className={`group/photo relative overflow-hidden rounded-[var(--radius-lg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-soft ${
                    i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.imageUrl}
                    alt={photo.imageAlt || "Food & Feast restaurant"}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover/photo:scale-110 motion-reduce:transition-none motion-reduce:group-hover/photo:scale-100"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0 bg-charcoal/0 transition-colors duration-300 group-hover/photo:bg-charcoal/25 motion-reduce:transition-none"
                    aria-hidden
                  />
                </Link>
              ))
            ) : (
              <div
                className="col-span-2 aspect-[16/10] rounded-[var(--radius-lg)] border border-white/15 bg-white/5"
                aria-hidden
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
